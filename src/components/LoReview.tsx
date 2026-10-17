"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Html } from "@/components/Html";
import { SparklesIcon } from "@/components/icons";
import { needsDownload, useModel } from "@/components/ExplainMistake";
import { useVietnamese } from "@/components/Vietnamese";
import { modelReady, streamPrompt, translateToVietnamese } from "@/lib/builtinAi";
import { NODE } from "@/lib/syllabus";
import type { LoRow } from "@/lib/loQuiz";
import { track } from "@/lib/track";

type Excerpt = { lo: string; k: string; statement: string; section: string; excerpt: string; items: { t: string; html: string }[] };

const SYSTEM = `You are an ISTQB Certified Tester Foundation Level (CTFL v4.0.1) tutor helping a learner who keeps missing questions on one learning objective (LO).
Using ONLY the syllabus text you are given, write plain text (no markdown symbols except "- " at the start of a list line), at most 170 words, in this order:
Key points:
- 3 to 5 short points a learner must remember for the exam
Example:
one short, concrete example that applies the LO
Exam trap:
one common mistake in exam questions on this LO and how to avoid it
Do not invent content that is not supported by the syllabus text.`;

type Ai = { s: "idle" } | { s: "loading"; progress: number | null } | { s: "streaming" | "done"; text: string; vi?: string | null } | { s: "error" };

/**
 * Review panel for one weak LO (dashboard → Weak LOs): the syllabus statement and text, the learner's
 * record, a practice set of questions on just this LO, the mindmap topic, and, where Chrome has
 * Gemini Nano, an on-device summary of key points, an example and an exam trap.
 */
export function LoReview({ row, quizzes, onClose, readOnly = false }: { row: LoRow; quizzes: number; onClose: () => void; readOnly?: boolean }) {
  const { startSet, loadingSet } = useApp();
  const [vi] = useVietnamese();
  const [data, setData] = useState<Excerpt | null | "missing">(null);
  const [avail] = useModel();
  const [ai, setAi] = useState<Ai>({ s: "idle" });
  const abort = useRef<AbortController | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setAi({ s: "idle" });
    fetch(`/api/lo-excerpt?lo=${encodeURIComponent(row.lo)}`)
      .then((r) => (r.ok ? r.json() : "missing"))
      .then((d) => live && setData(d))
      .catch(() => live && setData("missing"));
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return () => {
      live = false;
      abort.current?.abort();
    };
  }, [row.lo]);

  const text = ai.s === "done" ? ai.text : null;
  const needsVi = ai.s === "done" && vi && ai.vi === undefined;
  useEffect(() => {
    if (!needsVi || !text) return;
    let live = true;
    translateToVietnamese(text).then((t) => live && setAi((x) => (x.s === "done" && x.text === text ? { ...x, vi: t } : x)));
    return () => {
      live = false;
    };
  }, [needsVi, text]);

  const ex = data && data !== "missing" ? data : null;
  const topicId = row.topicId && NODE[row.topicId] ? row.topicId : null;
  const spec = { kind: "lo" as const, lo: row.lo };
  const practicing = loadingSet === `lo-${row.lo}`;

  const summarize = async () => {
    if (!ex) return;
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setAi({ s: "loading", progress: null });
    try {
      const prompt = `LO ${row.lo} (${ex.k}): ${ex.statement}\nSyllabus section ${ex.section}:\n${ex.excerpt.slice(0, 3000)}`;
      let out = "";
      for await (const chunk of streamPrompt(SYSTEM, prompt, { signal: ac.signal, onProgress: (p) => setAi({ s: "loading", progress: p }) })) {
        out = chunk.startsWith(out) && out ? chunk : out + chunk;
        setAi({ s: "streaming", text: out });
      }
      setAi({ s: "done", text: out.trim() });
      modelReady();
      track("ai_lo_review", { lo: row.lo, ok: true });
    } catch (err) {
      if (ac.signal.aborted) return;
      console.warn("[ai] LO review failed:", err);
      setAi({ s: "error" });
      track("ai_lo_review", { lo: row.lo, ok: false });
    }
  };

  return (
    <div ref={ref} data-screen-label="LO review" style={{ background: "var(--color-bg)", border: "2px solid var(--color-accent-200)", borderRadius: 28, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent-800)" }}>
            LO {row.lo}{ex ? ` · ${ex.k}` : ""} · Chapter {row.ch} · missed in {row.n} of {quizzes} {quizzes === 1 ? "quiz" : "quizzes"}
          </span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>{row.topic}</span>
          {ex && <span style={{ fontSize: "var(--fs-15)" }}>{ex.statement}</span>}
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close LO review" style={{ flex: "none" }}>Close</button>
      </div>

      {!readOnly && (
        <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" disabled={!!loadingSet} onClick={() => startSet(spec, "practice")}>
          {practicing ? "Loading…" : "Practice this LO"}
        </button>
        {topicId && <Link className="btn btn-secondary" href={`/mindmap?topic=${topicId}`}>Open in mindmap</Link>}
      </div>
      <span style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)", marginTop: -6 }}>
        Up to 10 questions on LO {row.lo} in practice mode, with the answer and explanation after each one.
      </span>
        </>
      )}

      {data === null && <span style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>Loading the syllabus…</span>}
      {ex && (
        <details open className="lo-syllabus">
          <summary style={{ fontWeight: 700, fontSize: "var(--fs-14)", cursor: "pointer" }}>Syllabus {ex.section}</summary>
          <div className="qhtml" style={{ marginTop: 8, fontSize: "var(--fs-14)", maxHeight: 260, overflowY: "auto", paddingRight: 6 }}>
            {ex.items.some((i) => i.t === "li") ? (
              <>
                {ex.items.filter((i) => i.t !== "li").map((i, k) => <Html key={`p${k}`} html={`<p>${i.html}</p>`} />)}
                <Html html={`<ul>${ex.items.filter((i) => i.t === "li").map((i) => `<li>${i.html}</li>`).join("")}</ul>`} />
              </>
            ) : (
              ex.items.map((i, k) => <Html key={k} html={`<p>${i.html}</p>`} />)
            )}
          </div>
        </details>
      )}

      {ex && avail !== "unavailable" && (
        <div style={{ background: "var(--color-accent-100)", borderRadius: 20, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {(ai.s === "idle" || ai.s === "error") && (
            <>
              <button type="button" className="btn btn-ghost" onClick={summarize} style={{ alignSelf: "flex-start", color: "var(--color-accent-700)", paddingLeft: 0 }}>
                <SparklesIcon /> {needsDownload(avail) ? "Download AI model & summarize this LO" : ai.s === "error" ? "Try again: summarize this LO" : "Summarize this LO with AI"}
                <span className="tag tag-neutral" style={{ fontSize: 11, padding: "2px 8px", marginLeft: 4 }}>on-device AI</span>
              </button>
              <span style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: -4 }} lang={vi ? "vi" : undefined}>
                {vi
                  ? "AI tóm tắt ý chính, một ví dụ và một bẫy hay gặp trong đề thi."
                  : "AI summarizes the key points, an example and a common exam trap."}
                {needsDownload(avail) && (vi ? " Lần đầu Chrome tải mô hình (vài GB, chỉ một lần)." : " First use downloads the model (several GB, one time only).")}
              </span>
              {ai.s === "error" && <span style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>The on-device model could not answer this time.</span>}
            </>
          )}
          {ai.s === "loading" && (
            <span role="status" style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>
              {ai.progress !== null && ai.progress < 1
                ? `${vi ? "Đang tải mô hình Gemini Nano (chỉ một lần)" : "Downloading Gemini Nano model (one time only)"}: ${Math.round(ai.progress * 100)}%`
                : vi ? "Đang tóm tắt…" : "Summarizing…"}
            </span>
          )}
          {(ai.s === "streaming" || ai.s === "done") && (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-accent-800)" }}>
                <SparklesIcon /> AI summary of LO {row.lo}
              </span>
              {vi && ai.s === "done" && ai.vi ? (
                <>
                  <p lang="vi" style={{ margin: 0, whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{ai.vi}</p>
                  <details className="vi-original">
                    <summary>English original</summary>
                    <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{ai.text}</p>
                  </details>
                </>
              ) : (
                <p aria-live="polite" style={{ margin: 0, whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{ai.text}</p>
              )}
              <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Generated by Gemini Nano in your browser from the syllabus text above. It can be wrong; the syllabus is the reference.</span>
              {ai.s === "streaming" && (
                <button type="button" className="btn btn-ghost" onClick={() => { abort.current?.abort(); setAi({ s: "idle" }); }} style={{ alignSelf: "flex-start", paddingLeft: 0, fontSize: 13 }}>Stop</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
