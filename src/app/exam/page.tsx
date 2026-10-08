"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { ClockIcon, SparklesIcon } from "@/components/icons";
import { chapterTitle } from "@/lib/syllabus";
import { formatClock } from "@/lib/stats";

export default function ExamPage() {
  const router = useRouter();
  const { exam, setExam, submit, askAI, tier, hydrated } = useApp();
  const [now, setNow] = useState(() => Date.now());

  // Only on arrival: after Submit/Leave the exam is cleared while navigating away.
  useEffect(() => {
    if (hydrated && !exam) router.replace("/tests");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const timed = exam?.mode === "mock";
  const left = exam ? exam.set.minutes * 60 - (now - exam.started) / 1000 : 0;
  useEffect(() => {
    if (!timed) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [timed]);
  useEffect(() => {
    if (timed && left <= 0) submit();
  }, [timed, left, submit]);

  if (!exam) return null;
  const e = exam;
  const q = e.set.questions[e.idx];
  const chosen = e.answers[e.idx];
  const practice = e.mode === "practice";
  const reveal = practice && chosen !== undefined;
  const total = e.set.questions.length;
  const isLast = e.idx === total - 1;
  const lowTime = left < 120;

  const pick = (i: number) => {
    if (reveal) return;
    setExam({ ...e, answers: { ...e.answers, [e.idx]: i } });
  };
  const go = (idx: number) => setExam({ ...e, idx: Math.max(0, Math.min(total - 1, idx)) });

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => { setExam(null); router.push("/tests"); }}>Leave test</button>
        <h3 style={{ margin: 0, flex: "1 1 240px" }}>{e.set.title}</h3>
        <span className="tag tag-accent-2" style={{ fontSize: 13, padding: "5px 14px" }}>{practice ? "Practice · instant feedback" : "Mock exam · timed"}</span>
        {timed && (
          <span role="timer" style={{ display: "flex", alignItems: "center", gap: 8, background: lowTime ? "var(--color-accent-200)" : "var(--color-surface)", color: lowTime ? "var(--color-accent-900)" : "var(--color-text)", borderRadius: 999, padding: "7px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            <ClockIcon />
            {formatClock(left)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "var(--color-neutral-100)", borderRadius: 32, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Question {e.idx + 1} of {total}</span>
              <span className="tag tag-neutral">Chapter {q.chapter} · {chapterTitle(q.chapter)}</span>
            </div>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.45, textWrap: "pretty" }}>{q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((text, i) => {
                let bg = "var(--color-bg)", bd = "var(--color-divider)", dBg = "var(--color-surface)", dFg = "var(--color-text)";
                if (reveal) {
                  if (i === q.answerIndex) { bg = "var(--color-accent-2-100)"; bd = "var(--color-accent-2-600)"; dBg = "var(--color-accent-2-600)"; dFg = "var(--color-bg)"; }
                  else if (i === chosen) { bg = "var(--color-accent-100)"; bd = "var(--color-accent-600)"; dBg = "var(--color-accent-600)"; dFg = "var(--color-bg)"; }
                } else if (i === chosen) { bg = "var(--color-accent-100)"; bd = "var(--color-accent)"; dBg = "var(--color-accent)"; dFg = "var(--color-bg)"; }
                return (
                  <button key={i} className="hov-shadow-sm" aria-pressed={i === chosen} onClick={() => pick(i)}
                    style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "12px 18px 12px 12px", borderRadius: 999, background: bg, border: `2px solid ${bd}`, cursor: reveal ? "default" : "pointer", color: "var(--color-text)", fontSize: 15 }}>
                    <span style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 700, background: dBg, color: dFg }}>{"ABCD"[i]}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
            {reveal && (
              <div style={{ borderRadius: 24, padding: "20px 22px", background: chosen === q.answerIndex ? "var(--color-accent-2-100)" : "var(--color-accent-100)", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: chosen === q.answerIndex ? "var(--color-accent-2-800)" : "var(--color-accent-800)" }}>{chosen === q.answerIndex ? "Correct" : "Not quite"}</span>
                <span style={{ fontSize: 15, color: "var(--color-neutral-900)" }}>{q.explanation}</span>
                <button className="btn btn-ghost" onClick={() => askAI(q, chosen)} style={{ alignSelf: "flex-start", color: "var(--color-accent-700)" }}>
                  <SparklesIcon />
                  {tier === "pro" ? "Ask the AI coach to explain" : "Ask the AI coach (Pro)"}
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-secondary" onClick={() => go(e.idx - 1)} disabled={e.idx === 0}>Previous</button>
            <span style={{ flex: 1 }} />
            {isLast ? <button className="btn btn-primary" onClick={submit}>Submit test</button> : <button className="btn btn-primary" onClick={() => go(e.idx + 1)}>Next question</button>}
          </div>
        </div>

        <aside style={{ flex: "0 1 280px", minWidth: 240, background: "var(--color-surface)", borderRadius: 32, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{Object.keys(e.answers).length} of {total} answered</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {e.set.questions.map((qq, i) => {
              const a = e.answers[i];
              let bg = "var(--color-neutral-200)", fg = "var(--color-text)";
              if (a !== undefined) bg = practice ? (a === qq.answerIndex ? "var(--color-accent-2-300)" : "var(--color-accent-300)") : "var(--color-accent-200)";
              if (i === e.idx) { bg = "var(--color-text)"; fg = "var(--color-bg)"; }
              return (
                <button key={i} aria-label={`Question ${i + 1}`} aria-current={i === e.idx} onClick={() => go(i)} style={{ aspectRatio: "1", borderRadius: "50%", border: 0, cursor: "pointer", fontWeight: 700, fontSize: 13, background: bg, color: fg }}>{i + 1}</button>
              );
            })}
          </div>
          <button className="btn btn-secondary" onClick={submit} style={{ marginTop: 6 }}>Submit now</button>
        </aside>
      </div>
    </section>
  );
}
