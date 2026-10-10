import type { Metadata } from "next";
import { Suspense } from "react";
import { config } from "@/server/config";
import { listAccounts } from "@/server/admin";
import { computeInsights } from "@/server/insights";
import { getCurrentUser, isAdmin } from "@/server/session";
import { PageLoading } from "@/components/Loading";
import { AdminView } from "./AdminView";
import { AdminLogin } from "./AdminLogin";
import { AdminTabs } from "./AdminTabs";
import { InsightsView } from "./InsightsView";

export const metadata: Metadata = { title: "Admin · Testpath", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  ["accounts", "Accounts"],
  ["insights", "Insights"],
] as const;

async function Accounts() {
  return <AdminView rows={await listAccounts()} />;
}

async function Insights({ days }: { days: number }) {
  return <InsightsView data={await computeInsights(days)} />;
}

/** Owner-only: accounts (password reset) and usage insights. Anyone else sees the admin sign-in form. */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return <AdminLogin configured={!!config.admin} signedInAs={user ? (user.username ?? user.email) : null} />;

  const sp = await searchParams;
  const tab = sp.tab === "insights" ? "insights" : "accounts";
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  // The tabs render at once; each tab's data streams in behind its own fallback. The key makes a
  // fresh boundary per tab/range, so switching shows the loading state instead of the old tab.
  return (
    <>
      <AdminTabs tab={tab} tabs={TABS} />
      <Suspense
        key={`${tab}-${days}`}
        fallback={<PageLoading label={tab === "insights" ? `Crunching ${days} days of usage data…` : "Loading accounts…"} blocks={tab === "insights" ? 5 : 2} />}
      >
        {tab === "insights" ? <Insights days={days} /> : <Accounts />}
      </Suspense>
    </>
  );
}
