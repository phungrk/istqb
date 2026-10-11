"use client";

import { useState } from "react";
import { Html } from "@/components/Html";
import { LETTERS } from "@/lib/questions";

export type SampleQuestion = { id: string; chapter: number; lo: string; stem: string; options: string[]; answers: number[]; explanation: string };

/**
 * Click-to-answer list. Everything, explanations included, is in the server HTML (inside <details>),
 * so it reads fine without JavaScript and search engines see the full content.
 */
export function SampleQuiz({ questions }: { questions: SampleQuestion[] }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const done = Object.keys(picked).length;
  const right = questions.filter((q) => picked[q.id] !== undefined && q.answers.includes(picked[q.id])).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q, n) => {
          const p = picked[q.id];
          const answered = p !== undefined;
          return (
            <li key={q.id} className="card exam-card" style={{ padding: "20px 22px", gap: 12 }}>
              <span style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>Question {n + 1} · Chapter {q.chapter} · LO {q.lo}</span>
              <Html html={q.stem} style={{ fontSize: "var(--fs-17)", lineHeight: 1.5 }} />
              <div role="group" aria-label={`Answers for question ${n + 1}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((o, i) => {
                  const correct = q.answers.includes(i);
                  const tone = !answered ? undefined : correct ? "var(--color-accent-2-200)" : i === p ? "var(--color-accent-100)" : undefined;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="exam-option"
                      aria-pressed={i === p}
                      disabled={answered}
                      onClick={() => setPicked((s) => ({ ...s, [q.id]: i }))}
                      style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", padding: "10px 14px", minHeight: 44, borderRadius: 20, border: "1px solid var(--color-divider)", background: tone ?? "var(--color-bg)", color: "var(--color-text)", cursor: answered ? "default" : "pointer", fontSize: "var(--fs-16)" }}
                    >
                      <strong style={{ flex: "none" }}>{LETTERS[i]}</strong>
                      <span>{o}</span>
                      {answered && correct && <span style={{ marginLeft: "auto", flex: "none", fontWeight: 700, color: "var(--color-accent-2-900)" }}>Correct</span>}
                    </button>
                  );
                })}
              </div>
              <details open={answered || undefined} key={answered ? "open" : "closed"}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  {answered ? (q.answers.includes(p) ? "Right! Why:" : `Not quite. The answer is ${LETTERS[q.answers[0]]}. Why:`) : "Show answer"}
                </summary>
                <Html html={q.explanation} style={{ marginTop: 8, fontSize: "var(--fs-15)", lineHeight: 1.55 }} />
              </details>
            </li>
          );
        })}
      </ol>
      {done > 0 && (
        <p role="status" style={{ margin: 0, fontWeight: 700 }}>
          Score so far: {right} of {done}
          {done === questions.length && (right / done >= 0.65 ? " · that's a pass mark." : " · below the 65% pass mark; keep going.")}
        </p>
      )}
    </div>
  );
}
