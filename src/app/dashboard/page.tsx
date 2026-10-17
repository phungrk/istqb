"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { STUDY_IDS } from "@/lib/syllabus";
import { mastery, pct, type Attempt } from "@/lib/stats";
import { WeakLOs } from "@/components/WeakLOs";

type Account = { username: string; name: string; attempts: number; lastActive: string | null };
type Viewed = { username: string; name: string; attempts: Attempt[]; learned: Record<string, boolean> };

export default function DashboardPage() {
  const router = useRouter();
  const { user, attempts: myAttempts, learned: myLearned, flags, openLogin } = useApp();
  const passMark = flags.passMark;
  const isAdmin = !!user?.admin;
  // Admin only: pick another learner and show their dashboard read-only. The API checks admin again.
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [viewed, setViewed] = useState<Viewed | null>(null);
  const [viewErr, setViewErr] = useState<string | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { accounts: Account[] }) => setAccounts(d.accounts))
      .catch(() => setAccounts([]));
  }, [isAdmin]);
  const viewAs = async (username: string) => {
    setViewErr(null);
    if (!username) return setViewed(null);
    const r = await fetch(`/api/admin/dashboard?username=${encodeURIComponent(username)}`, { cache: "no-store" }).catch(() => null);
    const d = r?.ok ? ((await r.json()) as Omit<Viewed, "learned"> & { learned: string[] }) : null;
    if (!d) return setViewErr("Could not load that account.");
    setViewed({ ...d, learned: Object.fromEntries(d.learned.map((id) => [id, true])) });
  };

  if (!user)
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
        <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14, padding: "40px 0" }}>
          <h1 style={{ margin: 0 }}>Your progress lives here</h1>
          <p style={{ margin: 0, fontSize: "var(--fs-17)", color: "var(--color-neutral-800)" }}>Sign in to save every attempt, see your score trend and find your weakest chapters. It&apos;s free.</p>
          <button className="btn btn-primary" onClick={openLogin} style={{ alignSelf: "flex-start", fontSize: "var(--fs-16)", padding: "12px 22px" }}>Sign in</button>
        </div>
      </section>
    );

  const attempts = viewed?.attempts ?? myAttempts;
  const learned = viewed?.learned ?? myLearned;
  const name = viewed ? viewed.name || viewed.username : user.name;
  const at = [...attempts].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const pcts = at.map(pct);
  const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : 0;
  const mocks = at.filter((a) => a.mode === "mock").map(pct);
  const lastMock = mocks[mocks.length - 1];
  const stats = [
    { label: "Attempts", value: String(at.length), bg: "var(--color-surface)" },
    { label: "Average score", value: pcts.length ? avg + "%" : "—", bg: "var(--color-surface)" },
    { label: "Best score", value: pcts.length ? Math.max(...pcts) + "%" : "—", bg: "var(--color-accent-2-100)" },
    { label: "Last mock exam", value: lastMock !== undefined ? lastMock + "%" : "—", bg: "var(--color-accent-100)" },
  ];
  const readyText =
    lastMock === undefined ? "Take a mock exam to see if you are ready."
    : lastMock >= passMark ? `Your last mock exam is above the ${passMark}% pass mark. Keep it there.`
    : `Your last mock exam is ${passMark - lastMock} points below the ${passMark}% pass mark.`;
  const learnedCount = STUDY_IDS.filter((id) => learned[id]).length;
  const panel = { borderRadius: 32, padding: 26, display: "flex", flexDirection: "column" } as const;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
      {isAdmin && (
        <div data-screen-label="Admin view as" style={{ background: viewed ? "var(--color-accent-100)" : "var(--color-neutral-100)", borderRadius: 24, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label htmlFor="view-as" style={{ fontSize: "var(--fs-14)", fontWeight: 700 }}>Admin · view dashboard of</label>
          <select id="view-as" value={viewed?.username ?? ""} onChange={(e) => void viewAs(e.target.value)} disabled={!accounts}
            style={{ font: "inherit", fontSize: "var(--fs-14)", padding: "6px 10px", borderRadius: 12, border: "1px solid var(--color-divider)", background: "var(--color-bg)", maxWidth: "100%" }}>
            <option value="">{accounts ? "My own dashboard" : "Loading accounts…"}</option>
            {accounts?.map((a) => (
              <option key={a.username} value={a.username}>{a.username}{a.name && a.name !== a.username ? ` · ${a.name}` : ""} · {a.attempts} attempts</option>
            ))}
          </select>
          {viewed && <span className="tag tag-accent" style={{ fontSize: 12 }}>Read-only: viewing {viewed.username}</span>}
          {viewErr && <span style={{ fontSize: "var(--fs-13)", color: "var(--color-accent-800)" }}>{viewErr}</span>}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0 }}>{viewed ? `${name}'s dashboard` : <>Hi {name.split(" ")[0]}, here&apos;s where you stand</>}</h1>
        <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>{readyText}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 28, padding: 22, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "var(--fs-13)", fontWeight: 600, color: "var(--color-neutral-800)" }}>{s.label}</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-38)", lineHeight: 1.1 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ ...panel, flex: "1 1 480px", minWidth: 0, background: "var(--color-neutral-100)", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h4 style={{ margin: 0 }}>Score trend</h4>
            <span style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>Dashed line = {passMark}% pass mark</span>
          </div>
          <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: 12, paddingTop: 10 }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: passMark * 1.6, borderTop: "2px dashed var(--color-accent-2-600)" }} />
            {at.slice(-8).map((a) => {
              const p = pct(a);
              return (
                <div key={a.id} style={{ flex: 1, maxWidth: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "var(--fs-12)", fontWeight: 700 }}>{p}%</span>
                  <div style={{ width: "100%", height: Math.max(6, p * 1.6), borderRadius: "999px 999px 12px 12px", background: p >= passMark ? "var(--color-accent-2-500)" : "var(--color-accent-400)" }} />
                </div>
              );
            })}
          </div>
          {!at.length && <span style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>Take a test to see your trend.</span>}
        </div>
        <div style={{ ...panel, flex: "0 1 380px", minWidth: 280, background: "var(--color-surface)", gap: 14 }}>
          <h4 style={{ margin: 0 }}>Mastery by chapter</h4>
          {mastery(attempts).map((c) => (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: "var(--fs-13)" }}>
                <span>{c.id} · {c.title}</span>
                <span style={{ fontWeight: 700 }}>{c.pct === null ? "—" : c.pct + "%"}</span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: (c.pct || 0) + "%", borderRadius: 999, background: c.pct !== null && c.pct >= passMark ? "var(--color-accent-2-600)" : "var(--color-accent)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <WeakLOs key={viewed?.username ?? "me"} attempts={viewed ? attempts : undefined} readOnly={!!viewed} />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 520px", minWidth: 0, background: "var(--color-neutral-100)", borderRadius: 32, padding: 26, overflowX: "auto" }}>
          <h4 style={{ margin: "0 0 10px" }}>Recent attempts</h4>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Test</th><th>Mode</th><th>Score</th><th>Result</th></tr>
            </thead>
            <tbody>
              {[...at].reverse().slice(0, 8).map((a) => {
                const p = pct(a);
                return (
                  <tr key={a.id}>
                    <td>{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                    <td>{a.title}</td>
                    <td>{a.mode === "mock" ? "Mock" : "Practice"}</td>
                    <td>{a.correct}/{a.total} · {p}%</td>
                    <td><span className={"tag " + (p >= passMark ? "tag-accent-2" : "tag-accent")}>{p >= passMark ? "Pass" : "Below"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ flex: "0 1 380px", minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--color-accent-2-100)", borderRadius: 32, padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-2-800)" }}>Mindmap progress</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-26)" }}>{learnedCount} of {STUDY_IDS.length} topics learned</span>
            {!viewed && <button className="btn btn-ghost" onClick={() => router.push("/mindmap")} style={{ alignSelf: "flex-start", color: "var(--color-accent-2-800)" }}>Continue studying</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
