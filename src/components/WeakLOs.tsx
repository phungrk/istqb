"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NODE } from "@/lib/syllabus";
import { LOQ_QUIZ, LOQ_TOPIC, loRows, type LoLevel } from "@/lib/loQuiz";

const COLORS: Record<LoLevel, { fill: string; ink: string }> = {
  weak: { fill: "var(--color-accent)", ink: "var(--color-accent-800)" },
  watch: { fill: "var(--color-accent-300)", ink: "var(--color-neutral-800)" },
  low: { fill: "var(--color-neutral-400)", ink: "var(--color-neutral-700)" },
};
const GRID = { display: "grid", gridTemplateColumns: `54px minmax(160px,1fr) repeat(${LOQ_QUIZ.length},18px) 96px`, columnGap: 5, alignItems: "center", padding: "9px 12px" } as const;
const ALL = loRows();
const TOP = 10;

/** Dashboard panel: which syllabus LOs keep being missed across quizzes (design: Dashboard → "Weak LOs"). */
export function WeakLOs() {
  const router = useRouter();
  const [ch, setCh] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const rows = loRows(ch || undefined);
  const shown = showAll ? rows : rows.slice(0, TOP);
  const weakN = ALL.filter((r) => r.level === "weak").length;
  const topic = (lo: string) => (NODE[LOQ_TOPIC[lo]] ? LOQ_TOPIC[lo] : null);
  const open = (lo: string) => { const t = topic(lo); if (t) router.push(`/mindmap?topic=${t}`); };

  return (
    <div data-screen-label="Weak LOs" style={{ background: "var(--color-surface)", borderRadius: 32, padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 620 }}>
          <h4 style={{ margin: 0 }}>Weak learning objectives</h4>
          <p style={{ margin: "6px 0 0", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
            Each row is a syllabus LO, each column a quiz you took. A filled dot means you got at least one question on that LO wrong. {weakN} of {ALL.length} LOs were missed in 6 or more quizzes.
          </p>
        </div>
        <div role="group" aria-label="Filter by chapter" style={{ display: "flex", padding: 4, borderRadius: 999, background: "var(--color-neutral-100)", gap: 4, flexWrap: "wrap" }}>
          {[0, 1, 2, 3, 4, 5, 6].map((c) => (
            <button key={c} type="button" aria-pressed={ch === c} onClick={() => { setCh(c); setShowAll(false); }}
              style={{ border: 0, borderRadius: 999, padding: "6px 12px", font: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", background: ch === c ? "var(--color-accent)" : "transparent", color: ch === c ? "var(--color-bg)" : "var(--color-text)" }}>
              {c ? `Ch ${c}` : "All"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {ALL.slice(0, 3).map((r) => (
          <div key={r.lo} style={{ background: "var(--color-accent-100)", borderRadius: 24, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 13, fontWeight: 700, color: "var(--color-accent-800)" }}>
              <span style={{ whiteSpace: "nowrap" }}>LO {r.lo} · Ch {r.ch}</span>
              <span style={{ whiteSpace: "nowrap" }}>{r.n}/{LOQ_QUIZ.length} quizzes</span>
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>{r.topic}</span>
            {topic(r.lo) && (
              <button type="button" className="btn btn-ghost" onClick={() => open(r.lo)} style={{ alignSelf: "flex-start", color: "var(--color-accent-800)", paddingLeft: 0 }}>Review in mindmap</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 720 }}>
          <div style={{ ...GRID, fontSize: 11, fontWeight: 700, color: "var(--color-neutral-700)" }}>
            <span>LO</span>
            <span>Topic</span>
            {LOQ_QUIZ.map((q) => <span key={q} style={{ textAlign: "center" }}>{q}</span>)}
            <span style={{ textAlign: "right" }}>Missed</span>
          </div>
          {shown.map((r) => {
            const c = COLORS[r.level];
            const t = topic(r.lo);
            return (
              <div key={r.lo} className="wlo-row" style={{ ...GRID, borderRadius: 999 }}>
                <span style={{ fontSize: "var(--fs-13)", fontWeight: 700, color: c.ink }}>{r.lo}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {t ? (
                    <button type="button" onClick={() => open(r.lo)} title={`Open ${r.topic} in the mindmap`}
                      style={{ border: 0, background: "none", padding: 0, font: "inherit", fontSize: "var(--fs-14)", fontWeight: 500, color: "inherit", cursor: "pointer", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "underline", textDecorationColor: "var(--color-neutral-300)", textUnderlineOffset: 3, minWidth: 0 }}>
                      {r.topic}
                    </button>
                  ) : (
                    <span style={{ fontSize: "var(--fs-14)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.topic}</span>
                  )}
                  {r.level !== "low" && (
                    <span className={`tag ${r.level === "weak" ? "tag-accent" : "tag-neutral"}`} style={{ fontSize: 11, padding: "2px 8px", flex: "none" }}>{r.level === "weak" ? "Weak" : "Watch"}</span>
                  )}
                </span>
                {r.misses.map((m, i) => (
                  <span key={i} title={`Quiz ${LOQ_QUIZ[i]}: ${m ? "missed" : "ok"}`} style={{ justifySelf: "center", width: 14, height: 14, borderRadius: "50%", boxSizing: "border-box", border: `2px solid ${m ? c.fill : "var(--color-neutral-300)"}`, background: m ? c.fill : "transparent" }} />
                ))}
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <span style={{ width: 40, height: 7, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${r.pct * 100}%`, background: c.fill }} />
                  </span>
                  <span style={{ fontSize: "var(--fs-13)", fontWeight: 700 }}>{r.n}/{LOQ_QUIZ.length}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)" }}>Quizzes 6, 7, 12, 13 and 23–25 not taken. * LO inferred from question content.</span>
        {rows.length > TOP && (
          <button type="button" className="btn btn-secondary" onClick={() => setShowAll((v) => !v)}>{showAll ? `Show top ${TOP}` : `Show all ${rows.length}`}</button>
        )}
      </div>
    </div>
  );
}
