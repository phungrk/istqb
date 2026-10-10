import type { Metadata } from "next";
import Link from "next/link";
import { config } from "@/server/config";
import { listAccounts } from "@/server/admin";
import { computeInsights } from "@/server/insights";
import { getCurrentUser, isAdmin } from "@/server/session";
import { AdminView } from "./AdminView";
import { AdminLogin } from "./AdminLogin";
import { InsightsView } from "./InsightsView";

export const metadata: Metadata = { title: "Admin · Testpath", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  ["accounts", "Accounts"],
  ["insights", "Insights"],
] as const;

/** Owner-only: accounts (password reset) and usage insights. Anyone else sees the admin sign-in form. */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return <AdminLogin configured={!!config.admin} signedInAs={user ? (user.username ?? user.email) : null} />;

  const sp = await searchParams;
  const tab = sp.tab === "insights" ? "insights" : "accounts";
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  return (
    <>
      <nav aria-label="Admin sections" style={{ display: "flex", gap: 4, paddingTop: 20 }}>
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            style={{ padding: "8px 16px", borderRadius: 999, fontWeight: 600, fontSize: 14, textDecoration: "none", background: tab === key ? "var(--color-accent-200)" : "transparent", color: tab === key ? "var(--color-accent-900)" : "var(--color-text)" }}
          >
            {label}
          </Link>
        ))}
      </nav>
      {tab === "insights" ? <InsightsView data={await computeInsights(days)} /> : <AdminView rows={await listAccounts()} />}
    </>
  );
}
