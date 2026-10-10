"use client";

import Link, { useLinkStatus } from "next/link";
import { Spinner } from "@/components/Loading";

/** Spinner inside a Link while its navigation is pending (the target page computes on the server). */
export function PendingSpinner() {
  const { pending } = useLinkStatus();
  return pending ? <Spinner label="Loading" /> : null;
}

export function AdminTabs({ tab, tabs }: { tab: string; tabs: readonly (readonly [string, string])[] }) {
  return (
    <nav aria-label="Admin sections" style={{ display: "flex", gap: 4, paddingTop: 20 }}>
      {tabs.map(([key, label]) => (
        <Link
          key={key}
          href={`/admin?tab=${key}`}
          aria-current={tab === key ? "page" : undefined}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, fontWeight: 600, fontSize: "var(--fs-14)", textDecoration: "none", background: tab === key ? "var(--color-accent-200)" : "transparent", color: tab === key ? "var(--color-accent-900)" : "var(--color-text)" }}
        >
          {label}
          <PendingSpinner />
        </Link>
      ))}
    </nav>
  );
}
