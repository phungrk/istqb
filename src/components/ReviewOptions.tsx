"use client";

import { Html } from "@/components/Html";
import { CheckIcon, XIcon } from "@/components/icons";
import { ViLine } from "@/components/Vietnamese";
import { LETTERS, type Question } from "@/lib/questions";

/**
 * Every option of a question for the result page: the correct ones carry a "Correct" check mark, an option the
 * learner picked that is wrong is marked "Your answer", and a correct pick says both. Colour is never the only cue.
 */
export function ReviewOptions({ q, chosen, vi }: { q: Question; chosen: number[]; vi: boolean }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {q.options.map((text, i) => {
        const right = q.answers.includes(i);
        const picked = chosen.includes(i);
        const wrongPick = picked && !right;
        const bg = right ? "var(--color-accent-2-100)" : wrongPick ? "var(--color-accent-100)" : "var(--color-bg)";
        const bd = right ? "var(--color-accent-2-600)" : wrongPick ? "var(--color-accent-600)" : "var(--color-divider)";
        const dot = right ? "var(--color-accent-2-600)" : wrongPick ? "var(--color-accent-600)" : "var(--color-surface)";
        return (
          <li
            key={i}
            data-correct={right ? "true" : undefined}
            data-picked={picked ? "true" : undefined}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px 10px 10px", borderRadius: 22, background: bg, border: `2px solid ${bd}` }}
          >
            <span aria-hidden style={{ width: 30, height: 30, flex: "none", borderRadius: q.answers.length > 1 ? 9 : "50%", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "var(--fs-14)", background: dot, color: right || wrongPick ? "var(--color-bg)" : "var(--color-text)" }}>
              {LETTERS[i]}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-14)", paddingTop: 3 }}>
              <span className="sr-only">{`Option ${LETTERS[i]}. `}</span>
              <Html as="span" className="opt-html" html={text} />
              {vi && <ViLine html={q.vi?.options[i]} size="var(--fs-13)" />}
            </span>
            {(right || picked) && (
              <span style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingTop: 2 }}>
                {right && (
                  <span className="tag tag-accent-2" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 10px" }}>
                    <CheckIcon strokeWidth={3} /> Correct
                  </span>
                )}
                {picked && (
                  <span className={`tag ${right ? "tag-neutral" : "tag-accent"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 10px" }}>
                    {!right && <XIcon strokeWidth={3} />} Your answer
                  </span>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
