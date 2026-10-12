"use client";

import { useEffect, useState } from "react";
import { Html } from "@/components/Html";
import type { Question } from "@/lib/questions";

const KEY = "tp_vi";
const EVENT = "tp-vi-change";

/** The learner's "show Vietnamese" choice, kept in localStorage and shared by every open view. */
export function useVietnamese(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setOn(localStorage.getItem(KEY) === "1");
      } catch {
        /* storage blocked: stays off */
      }
    };
    read();
    addEventListener(EVENT, read);
    addEventListener("storage", read);
    return () => {
      removeEventListener(EVENT, read);
      removeEventListener("storage", read);
    };
  }, []);
  const set = (v: boolean) => {
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* not persisted */
    }
    setOn(v);
    dispatchEvent(new Event(EVENT));
  };
  return [on, set];
}

/** Switch shown only when the current questions have a translation. */
export function VietnameseToggle({ questions, on, onChange }: { questions: Question[]; on: boolean; onChange: (on: boolean) => void }) {
  if (!questions.some((q) => q.vi)) return null;
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="vi-switch" lang="vi">
      <span className="vi-switch-track" aria-hidden>
        <span className="vi-switch-thumb" />
      </span>
      Tiếng Việt
    </button>
  );
}

/** Vietnamese line under an English stem or option. */
export function ViLine({ html, size = "var(--fs-15)" }: { html?: string; size?: string }) {
  if (!html) return null;
  // A span (display: block) so it is valid inside the option buttons.
  return (
    <span lang="vi" className="vi-line" style={{ fontSize: size }}>
      <Html as="span" html={html} />
    </span>
  );
}

/** Explanation in Vietnamese with the English original one tap away; English only when off or untranslated. */
export function Explanation({ q, on, style }: { q: Question; on: boolean; style?: React.CSSProperties }) {
  if (!on || !q.vi) return <Html html={q.explanation} style={style} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div lang="vi">
        <Html html={q.vi.explanation} style={style} />
      </div>
      <details className="vi-original">
        <summary>English original</summary>
        <Html html={q.explanation} style={{ ...style, marginTop: 6 }} />
      </details>
    </div>
  );
}
