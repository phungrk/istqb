import { CHAPTERS } from "./syllabus";

/**
 * A multiple-choice question. `stem`, `options` and `explanation` are HTML:
 * bank questions come from the sanitised quiz import (scripts/import-quizzes),
 * AI questions are escaped plain text.
 */
export type Question = {
  id: string;
  chapter: number;
  lo?: string;
  src?: string;
  stem: string;
  options: string[];
  /** Indices of the correct options; more than one means "select N". */
  answers: number[];
  explanation: string;
  source?: "bank" | "ai";
};

export type Mode = "practice" | "mock";

/** The three test lengths offered for every set. */
export const SIZES = [
  { size: 10, label: "Short" },
  { size: 20, label: "Medium" },
  { size: 40, label: "Long" },
] as const;
export type Size = (typeof SIZES)[number]["size"];

/**
 * What to draw:
 * - chapter: random questions from one chapter
 * - level: a random draw across the syllabus, weighted like the real exam (guests)
 * - numbered: Short/Medium test number n, a fixed exam-weighted set (members)
 * - long: Long test number n, a fixed list set by the admin (members)
 */
export type SetSpec =
  | { kind: "chapter"; chapter: number; size: Size }
  | { kind: "level"; size: Size }
  | { kind: "numbered"; size: 10 | 20; n: number }
  | { kind: "long"; n: number };

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const specSize = (s: SetSpec): Size => (s.kind === "long" ? 40 : s.size);

export function specKey(s: SetSpec) {
  if (s.kind === "chapter") return `ch${s.chapter}-${s.size}`;
  if (s.kind === "numbered") return `lvl-${s.size}-${pad2(s.n)}`;
  if (s.kind === "long") return `long-${pad2(s.n)}`;
  return `lvl-${s.size}`;
}

export function specTitle(s: SetSpec) {
  const size = specSize(s);
  const label = SIZES.find((x) => x.size === size)?.label;
  if (s.kind === "chapter") return `Chapter ${s.chapter} · ${label} (${size})`;
  if (s.kind === "numbered" || s.kind === "long") return `${label} test ${pad2(s.n)} · ${size} questions`;
  return `${label} test · ${size} questions`;
}

/** How many numbered tests a level offers: Short and Medium split the whole bank; Long is set by the admin. */
export type LevelCounts = { bankTotal: number; short: number; medium: number; long: number };

/** Real exam pace: 60 minutes for 40 questions. */
export const minutesFor = (n: number) => Math.max(1, Math.round(n * 1.5));

/** Questions per chapter for an n-question test, using the real exam's 8/6/4/11/9/2 weighting (largest remainder). */
export function levelDistribution(n: number): Record<number, number> {
  const total = CHAPTERS.reduce((s, c) => s + c.q, 0);
  const raw = CHAPTERS.map((c) => ({ id: c.id, exact: (c.q * n) / total }));
  const out = Object.fromEntries(raw.map((r) => [r.id, Math.floor(r.exact)]));
  let left = n - Object.values(out).reduce((a, b) => a + b, 0);
  for (const r of [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)))) {
    if (left-- <= 0) break;
    out[r.id]++;
  }
  return out;
}

/** Answers are stored per question index as the chosen option indices. */
export type Answers = Record<number, number[]>;

export const isCorrect = (q: Pick<Question, "answers">, chosen: number[] | undefined) =>
  !!chosen && chosen.length === q.answers.length && q.answers.every((a) => chosen.includes(a));

export type PerChapter = Record<string, [number, number]>;

export function score(questions: Pick<Question, "chapter" | "answers">[], answers: Answers) {
  let correct = 0;
  const perChapter: PerChapter = {};
  questions.forEach((q, i) => {
    const ok = isCorrect(q, answers[i]);
    if (ok) correct++;
    const p = perChapter[q.chapter] || [0, 0];
    perChapter[q.chapter] = [p[0] + (ok ? 1 : 0), p[1] + 1];
  });
  return { correct, total: questions.length, perChapter };
}

export const LETTERS = "ABCDE";
export const letters = (idx: number[] | undefined) => (idx?.length ? [...idx].sort().map((i) => LETTERS[i]).join(", ") : "—");

/** Plain text for prompts and previews. */
export const htmlToText = (h: string) =>
  h
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "[$1]")
    .replace(/<\/(p|li|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*/g, "\n")
    .trim();

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
