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
function useModel(): [Availability, (a: Availability) => void] {
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

const needsDownload = (a: Availability) => a === "downloadable" || a === "downloading";

/** What the feature is and what the first use downloads, in the learner's language. */
function About({ vi, download }: { vi: boolean; download: boolean }) {
  return vi ? (
    <div lang="vi" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ margin: 0 }}>
        <strong>Explain my mistake</strong> dùng Gemini Nano, mô hình AI nhỏ có sẵn trong Google Chrome. AI chạy ngay trên máy tính của bạn: câu trả lời không gửi lên server nào và hoàn toàn miễn phí.
      </p>
      <p style={{ margin: 0 }}>
        Với mỗi câu bạn làm sai, AI chỉ dựa vào lời giải chính thức và đoạn syllabus của LO đó để giải thích vì sao lựa chọn của bạn sai, vì sao đáp án đúng, kèm một mẹo để nhớ. AI vẫn có thể nhầm: đáp án chính thức luôn là căn cứ.
      </p>
      {download && (
        <p style={{ margin: 0, color: "var(--color-accent-800)", fontWeight: 600 }}>
          Lần dùng đầu tiên, Chrome cần tải mô hình Gemini Nano về máy (vài GB, chỉ tải một lần; Chrome yêu cầu ổ đĩa còn trống khoảng 22 GB). Hãy giữ tab này mở đến khi tải xong. Những lần sau giải thích hiện ra ngay.
        </p>
      )}
      <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>Chỉ hoạt động trên Chrome máy tính (Windows, macOS, Linux, ChromeOS) đủ mạnh; không có trên điện thoại hay trình duyệt khác.</p>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ margin: 0 }}>
        <strong>Explain my mistake</strong> uses Gemini Nano, a small AI model built into Google Chrome. It runs on your computer, so your answers are not sent to any server, and it is free.
      </p>
      <p style={{ margin: 0 }}>
        For each question you got wrong, it uses only the official explanation and the syllabus text for that LO to explain why your choice is wrong, why the correct answer is right, and one tip to remember. It can still be wrong: the official answer always wins.
      </p>
      {download && (
        <p style={{ margin: 0, color: "var(--color-accent-800)", fontWeight: 600 }}>
          First use: Chrome downloads the Gemini Nano model (several GB, one time only; Chrome asks for about 22 GB of free disk space). Keep this tab open until it finishes. After that, explanations start right away.
        </p>
      )}
      <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>Works in Chrome on a capable desktop or laptop (Windows, macOS, Linux, ChromeOS); not on phones or other browsers.</p>
    </div>
  );
}

/** One-time intro above a list of answers (result page); renders nothing where the model cannot run. */
export function ExplainMistakeIntro({ vi }: { vi: boolean }) {
  const [a] = useModel();
  if (a === "unavailable") return null;
  return (
    <div style={{ background: "var(--color-accent-100)", borderRadius: 24, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-14)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--color-accent-800)" }}>
        <SparklesIcon /> {vi ? "Mới: AI giải thích lỗi sai ngay trên máy bạn" : "New: AI explains your mistakes on your own device"}
      </span>
      <About vi={vi} download={needsDownload(a)} />
    </div>
  );
}

/**
 * "Explain my mistake" with Gemini Nano on the learner's device (Chrome Prompt API). Renders nothing
 * where the model cannot run (other browsers, phones, low-end hardware), so the static explanation
 * stays the fallback. With Vietnamese on, the answer is translated on-device when Chrome can.
 */
export function ExplainMistake({ q, chosen, vi, about = false }: { q: Question; chosen: number[]; vi: boolean; about?: boolean }) {
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
      {st.s === "idle" && download && about && (
        <span style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: -4 }} lang={vi ? "vi" : undefined}>
          {vi ? "Lần đầu: Chrome tải mô hình Gemini Nano (vài GB, chỉ một lần)." : "First use downloads the Gemini Nano model (several GB, one time only)."}
        </span>
      )}
      {st.s === "idle" && about && (
        <details className="vi-original" style={{ fontSize: "var(--fs-13)", marginTop: -4 }}>
          <summary>{vi ? "Tính năng này là gì?" : "What is this?"}</summary>
          <div style={{ marginTop: 6 }}><About vi={vi} download={download} /></div>
        </details>
      )}
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
