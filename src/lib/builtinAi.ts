/**
 * Chrome built-in AI (Gemini Nano on the learner's device): the Prompt API (LanguageModel) and
 * the Translator API. Desktop Chrome only, so everything here is feature-detected and every
 * caller has a non-AI fallback. Types are declared locally; the APIs are not in lib.dom yet.
 */

export type Availability = "unavailable" | "downloadable" | "downloading" | "available";

type Monitor = { addEventListener(type: "downloadprogress", fn: (e: { loaded: number }) => void): void };
type Lang = { type: "text"; languages: string[] };
type Session = {
  promptStreaming(input: string, opts?: { signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
};
type LanguageModelStatic = {
  availability(opts?: { expectedInputs?: Lang[]; expectedOutputs?: Lang[] }): Promise<Availability>;
  create(opts: {
    initialPrompts?: { role: "system" | "user" | "assistant"; content: string }[];
    expectedInputs?: Lang[];
    expectedOutputs?: Lang[];
    monitor?: (m: Monitor) => void;
    signal?: AbortSignal;
  }): Promise<Session>;
};
type TranslatorStatic = {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<Availability>;
  create(opts: { sourceLanguage: string; targetLanguage: string; monitor?: (m: Monitor) => void }): Promise<{ translate(text: string): Promise<string>; destroy(): void }>;
};

const g = globalThis as unknown as { LanguageModel?: LanguageModelStatic; Translator?: TranslatorStatic };
const EN: Lang[] = [{ type: "text", languages: ["en"] }];

/** Optional origin-trial token, for Chrome versions where the Prompt API on web pages is still a trial. */
const OT_TOKEN = process.env.NEXT_PUBLIC_PROMPT_API_OT_TOKEN;
function injectOriginTrial() {
  if (!OT_TOKEN || typeof document === "undefined" || document.querySelector('meta[http-equiv="origin-trial"]')) return;
  const m = document.createElement("meta");
  m.httpEquiv = "origin-trial";
  m.content = OT_TOKEN;
  document.head.append(m);
}

let modelCheck: Promise<Availability> | null = null;
/** Whether the on-device model can run here; checked once per page. */
export function modelAvailability(): Promise<Availability> {
  injectOriginTrial();
  if (!g.LanguageModel) return Promise.resolve("unavailable");
  return (modelCheck ??= g.LanguageModel.availability({ expectedInputs: EN, expectedOutputs: EN }).catch(() => "unavailable" as const));
}

/** After a successful run the model is on disk: re-check instead of reporting "downloadable" again. */
export const MODEL_READY = "tp-model-ready";
export function modelReady() {
  modelCheck = Promise.resolve("available");
  dispatchEvent(new Event(MODEL_READY));
}

/**
 * One streamed answer from a fresh session. Must start from a click: the first call may download
 * the model, which Chrome only allows after user activation. onProgress gets 0–1 while downloading.
 */
export async function* streamPrompt(system: string, prompt: string, opts: { signal?: AbortSignal; onProgress?: (p: number) => void } = {}) {
  if (!g.LanguageModel) throw new Error("Prompt API not available");
  const session = await g.LanguageModel.create({
    initialPrompts: [{ role: "system", content: system }],
    expectedInputs: EN,
    expectedOutputs: EN,
    signal: opts.signal,
    monitor: (m) => m.addEventListener("downloadprogress", (e) => opts.onProgress?.(e.loaded)),
  });
  try {
    const reader = session.promptStreaming(prompt, { signal: opts.signal }).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    session.destroy();
  }
}

/** English → Vietnamese with the on-device Translator, or null when it is not available here. */
export async function translateToVietnamese(text: string): Promise<string | null> {
  if (!g.Translator) return null;
  const langs = { sourceLanguage: "en", targetLanguage: "vi" };
  try {
    if ((await g.Translator.availability(langs)) === "unavailable") return null;
    const t = await g.Translator.create(langs);
    try {
      // Paragraph by paragraph keeps the line breaks the explanation came with.
      const parts = await Promise.all(text.split(/(\n+)/).map((p) => (p.trim() ? t.translate(p) : p)));
      return parts.join("");
    } finally {
      t.destroy();
    }
  } catch {
    return null;
  }
}
