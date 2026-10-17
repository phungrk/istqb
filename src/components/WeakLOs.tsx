"use client";

import { useState } from "react";
import Link from "next/link";
import type { Attempt } from "@/lib/stats";
import { loMatrix, type LoLevel } from "@/lib/loQuiz";
import { useApp } from "@/components/AppProvider";
import { LoReview } from "@/components/LoReview";

const INK: Record<LoLevel, string> = {
  weak: "var(--color-accent-800)",
  watch: "var(--color-neutral-800)",
  low: "var(--color-neutral-700)",
};
const BAR: Record<LoLevel, string> = { weak: "var(--color-accent)", watch: "var(--color-accent-300)", low: "var(--color-neutral-400)" };
const TOP = 10;
const pctText = (p: number) => `${Math.round(p * 100)}%`;

/** Dashboard panel: which syllabus LOs the user keeps missing, quiz by quiz (layout of LO_x_Quiz.xlsx). */
export function WeakLOs({ attempts: viewed, readOnly = false }: { attempts?: Attempt[]; readOnly?: boolean } = {}) {
  const { attempts: mine } = useApp();
  // Admin "view as": another learner's attempts, shown read-only.
  const attempts = viewed ?? mine;
  const [ch, setCh] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const all = loMatrix(attempts);
  const { quizzes, rows } = loMatrix(attempts, ch || undefined);
  const N = quizzes.length;
  const shown = showAll ? rows : rows.slice(0, TOP);
  const weakN = all.rows.filter((r) => r.level === "weak").length;
  const focusRow = all.rows.find((r) => r.lo === focus) ?? null;
  const grid = { display: "grid", gridTemplateColumns: `54px minmax(170px,1fr) 112px repeat(${N},44px)`, columnGap: 4, alignItems: "center", padding: "6px 12px" } as const;

  return (
    <div data-screen-label="Weak LOs" style={{ background: "var(--color-surface)", borderRadius: 32, padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 620 }}>
          <h4 style={{ margin: 0 }}>Weak learning objectives</h4>
          <p style={{ margin: "6px 0 0", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
            Each row is a syllabus LO, each column a quiz you took. ✗ means you got at least one question on that LO wrong in that quiz. Click an LO to review it: syllabus text, practice questions on just that LO, and an AI summary.
            {N > 0 && ` ${all.rows.length} LOs missed across ${N} ${N === 1 ? "quiz" : "quizzes"}${weakN ? `, ${weakN} of them in 2+ quizzes and at least a third of all` : ""}.`}
          </p>
        </div>
        {N > 0 && (
          <div role="group" aria-label="Filter by chapter" style={{ display: "flex", padding: 4, borderRadius: 999, background: "var(--color-neutral-100)", gap: 4, flexWrap: "wrap" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((c) => (
              <button key={c} type="button" aria-pressed={ch === c} onClick={() => { setCh(c); setShowAll(false); }}
                style={{ border: 0, borderRadius: 999, padding: "6px 12px", font: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", background: ch === c ? "var(--color-accent)" : "transparent", color: ch === c ? "var(--color-bg)" : "var(--color-text)" }}>
                {c ? `Ch ${c}` : "All"}
              </button>
            ))}
          </div>
        )}
      </div>

      {N === 0 ? (
        <div style={{ background: "var(--color-neutral-100)", borderRadius: 24, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--fs-15)" }}>No per-LO results yet. Take a practice test: every test you finish from now on adds a column here.</span>
          <Link href="/tests" className="btn btn-primary">Practice tests</Link>
        </div>
      ) : all.rows.length === 0 ? (
        <div style={{ background: "var(--color-accent-100)", borderRadius: 24, padding: "22px 24px", fontSize: "var(--fs-15)" }}>
          No wrong answers in your {N} {N === 1 ? "quiz" : "quizzes"} so far. Nothing to fix yet.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {all.rows.slice(0, 3).map((r) => (
              <div key={r.lo} style={{ background: "var(--color-accent-100)", borderRadius: 24, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 13, fontWeight: 700, color: "var(--color-accent-800)" }}>
                  <span style={{ whiteSpace: "nowrap" }}>LO {r.lo} · Ch {r.ch}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{r.n}/{N} quizzes · {pctText(r.pct)}</span>
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>{r.topic}</span>
                <button type="button" className="btn btn-ghost" aria-pressed={focus === r.lo} onClick={() => setFocus(focus === r.lo ? null : r.lo)} style={{ alignSelf: "flex-start", color: "var(--color-accent-800)", paddingLeft: 0 }}>
                  {focus === r.lo ? "Hide review" : "Review this LO"}
                </button>
              </div>
            ))}
          </div>

          {focusRow && <LoReview row={focusRow} quizzes={N} onClose={() => setFocus(null)} readOnly={readOnly} />}

          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 54 + 170 + N * 48 + 112 + 40 }}>
              <div style={{ ...grid, fontSize: 11, fontWeight: 700, color: "var(--color-neutral-700)" }}>
                <span>LO</span>
                <span>Topic</span>
                <span style={{ textAlign: "right", paddingRight: 10 }}>Tỷ lệ quiz sai</span>
                {quizzes.map((q) => <span key={q.label} title={`${q.title} · ${q.date}`} style={{ textAlign: "center", whiteSpace: "nowrap" }}>{q.label}</span>)}
              </div>
              {rows.length === 0 && <div style={{ padding: "12px", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>No misses in Chapter {ch}.</div>}
              {shown.map((r) => {
                return (
                  <div key={r.lo} className="wlo-row" style={{ ...grid, borderRadius: 16 }}>
                    <span style={{ fontSize: "var(--fs-13)", fontWeight: 700, color: INK[r.level] }}>{r.lo}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <button type="button" onClick={() => setFocus(r.lo)} title={`Review LO ${r.lo}: syllabus, practice questions and AI summary`}
                        style={{ border: 0, background: "none", padding: 0, font: "inherit", fontSize: "var(--fs-14)", fontWeight: focus === r.lo ? 700 : 500, color: "inherit", cursor: "pointer", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "underline", textDecorationColor: "var(--color-neutral-300)", textUnderlineOffset: 3, minWidth: 0 }}>
                        {r.topic}
                      </button>
                      {r.level !== "low" && (
                        <span className={`tag ${r.level === "weak" ? "tag-accent" : "tag-neutral"}`} style={{ fontSize: 11, padding: "2px 8px", flex: "none" }}>{r.level === "weak" ? "Weak" : "Watch"}</span>
                      )}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, paddingRight: 10 }}>
                      <span style={{ width: 36, height: 7, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                        <span style={{ display: "block", height: "100%", width: `${r.pct * 100}%`, background: BAR[r.level] }} />
                      </span>
                      <span style={{ fontSize: "var(--fs-13)", fontWeight: 700, minWidth: 34, textAlign: "right" }} title={`${r.n}/${N} quizzes`}>{pctText(r.pct)}</span>
                    </span>
                    {r.misses.map((m, i) =>
                      m ? (
                        <span key={i} className="wlo-fail" title={`${quizzes[i].label} (${quizzes[i].title}): failed`} aria-label={`${quizzes[i].label}: failed`}>✗</span>
                      ) : (
                        <span key={i} aria-label={`${quizzes[i].label}: ok`} />
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)" }}>Quiz 1 is your first test with per-LO results; tests taken before this panel existed are not included. Hover a column for the test name and date.</span>
            {rows.length > TOP && (
              <button type="button" className="btn btn-secondary" onClick={() => setShowAll((v) => !v)}>{showAll ? `Show top ${TOP}` : `Show all ${rows.length}`}</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
