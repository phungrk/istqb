"use client";

import { useEffect, useRef, useState } from "react";
import { SparklesIcon } from "@/components/icons";
import { MODEL_READY, modelAvailability, modelReady, streamPrompt, translateToVietnamese, type Availability } from "@/lib/builtinAi";
import { letters, type Question } from "@/lib/questions";
import { track } from "@/lib/track";

const SYSTEM = `You are a friendly ISTQB Certified Tester Foundation Level (CTFL v4.0.1) tutor.
A learner answered a multiple-choice exam question wrong. Explain their mistake using ONLY the official explanation and the syllabus excerpt you are given.
Write at most 120 words of plain text (no markdown, no headings, no bullet symbols), in three short paragraphs:
1. Why the learner's choice is wrong.
2. Why the correct answer is right.
3. One short tip to remember for the exam.
Never change which answer is correct, and do not invent syllabus content.`;

const plain = (html: string) =>
  html
    .replace(/<img[^>]*>/gi, " [figure] ")
    .replace(/<\/(p|li|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

const L = "abcde";
async function buildPrompt(q: Question, chosen: number[]) {
  let syllabus = "";
  if (q.lo) {
    const r = await fetch(`/api/lo-excerpt?lo=${encodeURIComponent(q.lo)}`).catch(() => null);
    if (r?.ok) {
      const d = (await r.json()) as { statement: string; section: string; excerpt: string };
      syllabus = `Syllabus ${d.section} (LO ${q.lo}: ${d.statement})\n${d.excerpt.slice(0, 2500)}`;
    }
  }
  const figure = /<img/i.test(q.stem) ? "\n(The question has a figure you cannot see; rely on the official explanation for its content.)" : "";
  return [
    `Question:\n${plain(q.stem)}${figure}`,
    `Options:\n${q.options.map((o, i) => `${L[i]}) ${plain(o)}`).join("\n")}`,
    `Learner's answer: ${chosen.length ? chosen.map((i) => L[i]).join(", ") : "no answer"}`,
    `Correct answer: ${q.answers.map((i) => L[i]).join(", ")}`,
    `Official explanation:\n${plain(q.explanation)}`,
    syllabus && `Syllabus excerpt:\n${syllabus}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

type State =
  | { s: "idle" }
  | { s: "loading"; progress: number | null }
  | { s: "streaming" | "done"; text: string; vi?: string | null }
  | { s: "error" };

/** The on-device model's state on this device; "unavailable" until checked (and on browsers without it). */
export function useModel(): [Availability, (a: Availability) => void] {
  const [a, setA] = useState<Availability>("unavailable");
  useEffect(() => {
    let live = true;
    modelAvailability().then((x) => live && setA(x));
    // One explanation downloads the model for every other button on the page.
    const ready = () => setA("available");
    addEventListener(MODEL_READY, ready);
    return () => {
      live = false;
      removeEventListener(MODEL_READY, ready);
    };
  }, []);
  return [a, setA];
}

export const needsDownload = (a: Availability) => a === "downloadable" || a === "downloading";

/** One line for learners whose Chrome has not downloaded the model yet; nothing otherwise. */
function DownloadNote({ vi }: { vi: boolean }) {
  return (
    <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }} lang={vi ? "vi" : undefined}>
      {vi ? "Lần đầu dùng, Chrome cần tải AI Gemini Nano về máy (vài GB, chỉ một lần)." : "First use: Chrome downloads its Gemini Nano AI model (several GB, one time only)."}
    </span>
  );
}

/** The download note once above a list of answers (result page), only while the model is not on the device. */
export function ExplainMistakeIntro({ vi }: { vi: boolean }) {
  const [a] = useModel();
  return needsDownload(a) ? <DownloadNote vi={vi} /> : null;
}

/**
 * "Explain my mistake" with Gemini Nano on the learner's device (Chrome Prompt API). Renders nothing
 * where the model cannot run (other browsers, phones, low-end hardware), so the static explanation
 * stays the fallback. With Vietnamese on, the answer is translated on-device when Chrome can.
 */
export function ExplainMistake({ q, chosen, vi, note = false }: { q: Question; chosen: number[]; vi: boolean; note?: boolean }) {
  const [avail] = useModel();
  const [st, setSt] = useState<State>({ s: "idle" });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  // Translate a finished answer when Vietnamese is (or gets) switched on.
  const text = st.s === "done" ? st.text : null;
  const needsVi = st.s === "done" && vi && st.vi === undefined;
  useEffect(() => {
    if (!needsVi || !text) return;
    let live = true;
    translateToVietnamese(text).then((t) => live && setSt((x) => (x.s === "done" && x.text === text ? { ...x, vi: t } : x)));
    return () => {
      live = false;
    };
  }, [needsVi, text]);

  if (avail === "unavailable") return null;
  const download = needsDownload(avail);

  const run = async () => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setSt({ s: "loading", progress: null });
    try {
      const prompt = await buildPrompt(q, chosen);
      let out = "";
      for await (const chunk of streamPrompt(SYSTEM, prompt, { signal: ac.signal, onProgress: (p) => setSt({ s: "loading", progress: p }) })) {
        // Older Chrome builds stream the whole text so far, newer ones only the new part.
        out = chunk.startsWith(out) && out ? chunk : out + chunk;
        setSt({ s: "streaming", text: out });
      }
      setSt({ s: "done", text: out.trim() });
      modelReady();
      track("ai_explain", { q: q.id, ok: true });
    } catch (err) {
      if (ac.signal.aborted) return;
      console.warn("[ai] explain failed:", err);
      setSt({ s: "error" });
      track("ai_explain", { q: q.id, ok: false });
    }
  };

  const busy = st.s === "loading" || st.s === "streaming";
  return (
    <div className="ai-explain" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(st.s === "idle" || st.s === "error") && (
        <button type="button" className="btn btn-ghost" onClick={run} style={{ alignSelf: "flex-start", color: "var(--color-accent-700)", paddingLeft: 0 }}>
          <SparklesIcon /> {st.s === "error" ? "Try again: explain my mistake" : download ? "Download AI model & explain my mistake" : "Explain my mistake"}
          <span className="tag tag-neutral" style={{ fontSize: 11, padding: "2px 8px", marginLeft: 4 }}>on-device AI</span>
        </button>
      )}
      {st.s === "idle" && download && note && <DownloadNote vi={vi} />}
      {st.s === "error" && <span style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>The on-device model could not answer this time.</span>}
      {st.s === "loading" && (
        <span role="status" style={{ fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>
          {st.progress !== null && st.progress < 1
            ? `${vi ? "Đang tải mô hình Gemini Nano (chỉ một lần)" : "Downloading Gemini Nano model (one time only)"}: ${Math.round(st.progress * 100)}%`
            : vi ? "Đang suy nghĩ…" : "Thinking…"}
        </span>
      )}
      {(st.s === "streaming" || st.s === "done") && (
        <div style={{ background: "var(--color-bg)", borderRadius: 20, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-accent-800)" }}>
            <SparklesIcon /> Why your answer was wrong
          </span>
          {vi && st.s === "done" && st.vi ? (
            <>
              <p lang="vi" style={{ margin: 0, whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{st.vi}</p>
              <details className="vi-original">
                <summary>English original</summary>
                <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{st.text}</p>
              </details>
            </>
          ) : (
            <p aria-live="polite" style={{ margin: 0, whiteSpace: "pre-line", fontSize: "var(--fs-14)" }}>{st.text}</p>
          )}
          {vi && st.s === "done" && st.vi === null && (
            <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }} lang="vi">Chrome trên máy này chưa dịch được sang tiếng Việt, nên phần giải thích hiển thị bằng tiếng Anh.</span>
          )}
          <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
            Generated by Gemini Nano in your browser from the official explanation{q.lo ? ` and syllabus LO ${q.lo}` : ""}. It can be wrong; the correct answer is {letters(q.answers)}.
          </span>
          {busy && (
            <button type="button" className="btn btn-ghost" onClick={() => { abort.current?.abort(); setSt({ s: "idle" }); }} style={{ alignSelf: "flex-start", paddingLeft: 0, fontSize: 13 }}>Stop</button>
          )}
        </div>
      )}
    </div>
  );
}
