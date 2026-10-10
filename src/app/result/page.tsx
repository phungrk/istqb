"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Html } from "@/components/Html";
import { Spinner } from "@/components/Loading";
import { CheckIcon, XIcon } from "@/components/icons";
import { isCorrect, letters } from "@/lib/questions";
import { chapterTitle } from "@/lib/syllabus";
import { formatClock } from "@/lib/stats";

export default function ResultPage() {
  const router = useRouter();
  const { result: r, hydrated, tier, flags, retry, openLogin, askAI, loadingSet } = useApp();
  const logged = tier !== "guest";
  const passMark = flags.passMark;

  useEffect(() => {
    if (hydrated && !r) router.replace("/tests");
  }, [hydrated, r, router]);
  if (!r) return null;

  const p = Math.round((r.correct / r.total) * 100);
  const pass = p >= passMark;
  const ringFg = pass ? "var(--color-accent-2-900)" : "var(--color-accent-900)";

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
      <div style={{ display: "flex", gap: 36, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ width: 220, height: 220, borderRadius: "50%", background: pass ? "var(--color-accent-2-200)" : "var(--color-accent-200)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-64)", lineHeight: 1, color: ringFg }}>{p}%</span>
          <span style={{ fontSize: "var(--fs-14)", fontWeight: 700, color: ringFg }}>{r.correct} / {r.total} correct</span>
        </div>
        <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>{r.set.title} · {r.mode === "mock" ? "Mock exam" : "Practice"}</span>
          <h1 style={{ margin: 0 }}>{pass ? "You passed this set" : "Not yet at the pass mark"}</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-800)" }}>
            Pass mark is {passMark}%. Time taken {formatClock(r.durationSec)}.{pass ? "" : " The chapter bars show where to focus."}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button className="btn btn-primary" onClick={() => retry(r.set, r.mode)} disabled={!!loadingSet} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {loadingSet && <Spinner />} Try again
            </button>
            <button className="btn btn-secondary" onClick={() => router.push("/tests")}>All tests</button>
            {logged && <button className="btn btn-secondary" onClick={() => router.push("/dashboard")}>Open dashboard</button>}
          </div>
        </div>
      </div>

      {!logged && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "var(--color-accent-2-100)", borderRadius: 28, padding: "18px 22px" }}>
          <span style={{ flex: "1 1 300px", fontSize: "var(--fs-15)", color: "var(--color-accent-2-900)" }}>This result is not saved. Sign in to keep it and follow your progress.</span>
          <button className="btn btn-primary" onClick={openLogin}>Save my result</button>
        </div>
      )}
      {logged && r.saved && <span className="tag tag-accent-2" style={{ alignSelf: "flex-start", fontSize: "var(--fs-13)", padding: "6px 14px" }}>Saved to your dashboard</span>}
      {logged && !r.saved && !r.saveFailed && (
        <span role="status" className="tag tag-neutral" style={{ alignSelf: "flex-start", fontSize: "var(--fs-13)", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Spinner /> Saving your result…
        </span>
      )}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 380px", minWidth: 280, background: "var(--color-surface)", borderRadius: 32, padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0 }}>By chapter</h4>
          {Object.entries(r.perChapter).map(([c, [k, t]]) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-14)", gap: 10 }}>
                <span>{c} · {chapterTitle(Number(c))}</span>
                <span style={{ fontWeight: 700 }}>{k}/{t}</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.round((k / t) * 100) + "%", borderRadius: 999, background: (k / t) * 100 >= passMark ? "var(--color-accent-2-600)" : "var(--color-accent)" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ margin: 0 }}>Review answers</h4>
          {r.set.questions.map((q, i) => {
            const a = r.answers[i];
            const ok = isCorrect(q, a);
            return (
              <div key={q.id + i} style={{ background: "var(--color-neutral-100)", borderRadius: 28, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span aria-label={ok ? "Correct" : "Wrong"} style={{ width: 28, height: 28, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: ok ? "var(--color-accent-2-600)" : "var(--color-accent-600)", color: "var(--color-bg)" }}>
                    {ok ? <CheckIcon strokeWidth={3} /> : <XIcon strokeWidth={3} />}
                  </span>
                  <span style={{ fontSize: "var(--fs-13)", fontWeight: 700 }}>Q{i + 1} · Chapter {q.chapter}{q.lo ? ` · LO ${q.lo}` : ""}</span>
                </div>
                <Html html={q.stem} style={{ fontSize: "var(--fs-15)" }} />
                <span style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-800)" }}>Your answer: {letters(a)} · Correct: {letters(q.answers)}</span>
                {!ok && (
                  <>
                    <Html html={q.explanation} style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-800)" }} />
                    {flags.pro && (
                      <button className="btn btn-ghost" onClick={() => askAI(q, a)} style={{ alignSelf: "flex-start", color: "var(--color-accent-700)" }}>
                        {tier === "pro" ? "Explain with AI coach" : "Explain with AI coach (Pro)"}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
