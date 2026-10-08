"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { examDefs, type Mode } from "@/lib/questions";
import { pct } from "@/lib/stats";

const MODES: [Mode, string][] = [["practice", "Practice"], ["mock", "Mock exam"]];

export default function TestsPage() {
  const router = useRouter();
  const { tier, attempts, mode, setMode, startExam, openLogin, setCoachTab } = useApp();
  const logged = tier !== "guest";
  const pro = tier === "pro";

  const best: Record<string, number> = {};
  for (const a of attempts) best[a.title] = Math.max(best[a.title] || 0, pct(a));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px" }}>
          <h1 style={{ margin: "0 0 6px" }}>Practice tests</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)", maxWidth: 560 }}>
            {mode === "practice"
              ? "Practice mode: no timer, and you see the right answer and explanation after each question."
              : "Mock exam mode: timed like the real exam, answers revealed only when you submit."}
          </p>
        </div>
        <div role="radiogroup" aria-label="Mode" style={{ display: "flex", background: "var(--color-surface)", borderRadius: 999, padding: 4, gap: 4 }}>
          {MODES.map(([k, label]) => (
            <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)} style={{ border: 0, borderRadius: 999, padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", background: mode === k ? "var(--color-accent)" : "transparent", color: mode === k ? "var(--color-bg)" : "var(--color-text)" }}>{label}</button>
          ))}
        </div>
      </div>

      {!logged && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "var(--color-accent-2-100)", borderRadius: 28, padding: "16px 22px" }}>
          <span style={{ flex: "1 1 300px", fontSize: 14, color: "var(--color-accent-2-900)" }}>You can take any test now. Results are not saved until you sign in.</span>
          <button className="btn btn-secondary" onClick={openLogin}>Sign in with Gmail</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {examDefs().map((d) => (
          <div key={d.key} className="card" style={{ padding: 24, gap: 10, background: d.key[0] === "m" ? "var(--color-surface)" : "var(--color-neutral-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>{d.kicker}</span>
            <span className="card-title" style={{ fontSize: 20 }}>{d.title}</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>{d.sub}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: "auto", paddingTop: 10 }}>
              <span className="tag tag-neutral">{d.questions.length} questions{mode === "mock" ? ` · ${d.minutes} min` : ""}</span>
              {logged && best[d.title] !== undefined && <span className="tag tag-accent-2">Best {best[d.title]}%</span>}
              <button className="btn btn-primary" onClick={() => startExam(d)} style={{ marginLeft: "auto" }} disabled={!d.questions.length}>Start</button>
            </div>
          </div>
        ))}
        <div className="card" style={{ padding: 24, gap: 10, background: "var(--color-accent-100)" }}>
          <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>Pro · AI generated</span>
          <span className="card-title" style={{ fontSize: 20 }}>A set built from your weak topics</span>
          <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>The coach writes new questions for the chapters where you score lowest.</span>
          <button
            className="btn btn-primary"
            onClick={() => { if (pro) { setCoachTab("quiz"); router.push("/coach"); } else router.push("/pricing"); }}
            style={{ alignSelf: "flex-start", marginTop: "auto" }}
          >
            {pro ? "Create a set" : "Unlock with Pro"}
          </button>
        </div>
      </div>
    </section>
  );
}
