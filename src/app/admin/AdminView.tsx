"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { AdminRow } from "@/server/admin";

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

export function AdminView({ rows }: { rows: AdminRow[] }) {
  const { toast } = useApp();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);
  const shown = useMemo(() => rows.filter((r) => r.username.includes(q.trim().toLowerCase())), [rows, q]);

  async function reset(username: string) {
    if (!confirm(`Give ${username} a new password? The old one stops working right away.`)) return;
    setBusy(username);
    const res = await fetch("/api/admin/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(data.error || "Could not reset the password");
    setIssued({ username: data.username, password: data.password });
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ margin: "0 0 6px" }}>Accounts</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>{rows.length} {rows.length === 1 ? "account" : "accounts"}. Reset a password when someone forgets theirs; their progress is kept.</p>
        </div>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username" aria-label="Search username" style={{ minHeight: 42, width: 220 }} />
      </div>

      {issued && (
        <div role="status" style={{ background: "var(--color-accent-2-100)", borderRadius: 24, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", color: "var(--color-accent-2-900)" }}>
          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>New password for {issued.username}</strong>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: ".06em", fontVariantNumeric: "tabular-nums" }}>{issued.password}</span>
            <span style={{ fontSize: 13 }}>Send it to the user now: it won&apos;t be shown again.</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ background: "var(--color-bg)" }}
            onClick={() => navigator.clipboard?.writeText(`Username: ${issued.username}\nPassword: ${issued.password}`).then(() => toast("Copied"), () => toast("Copy failed"))}
          >
            Copy username & password
          </button>
          <button className="btn btn-ghost" onClick={() => setIssued(null)}>Dismiss</button>
        </div>
      )}

      <div style={{ background: "var(--color-neutral-100)", borderRadius: 28, padding: "8px 20px", overflowX: "auto" }}>
        <table className="table" style={{ width: "100%", minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Username</th>
              <th style={{ textAlign: "right" }}>Tests taken</th>
              <th style={{ textAlign: "left" }}>Last test</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.username}>
                <td style={{ fontWeight: 700 }}>{r.username}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.attempts}</td>
                <td>{fmt(r.lastActive)}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-secondary" disabled={busy === r.username} onClick={() => reset(r.username)} style={{ fontSize: 13, padding: "6px 14px" }}>
                    {busy === r.username ? "Resetting…" : "Reset password"}
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--color-neutral-700)", padding: 20 }}>No accounts{q ? " match" : " yet"}.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
