import "server-only";
import bank from "@data/questions.json";
import longTests from "@data/long-tests.json";
import { CHAPTERS } from "@/lib/syllabus";
import { levelDistribution, minutesFor, specKey, specTitle, type LevelCounts, type Question, type SetSpec } from "@/lib/questions";

/** Imported from Quiz 1–25 (see scripts/import-quizzes.mjs). Server-only: ~1 MB. */
export const BANK: Question[] = (bank as Question[]).map((q) => ({ ...q, source: "bank" as const }));
export const BANK_BY_ID: Record<string, Question> = Object.fromEntries(BANK.map((q) => [q.id, q]));

export const chapterCounts = (): Record<number, number> =>
  Object.fromEntries(CHAPTERS.map((c) => [c.id, BANK.filter((q) => q.chapter === c.id).length]));

function pick<T>(pool: T[], n: number): T[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const byLo = (a: Question, b: Question) => a.chapter - b.chapter || (a.lo ?? "").localeCompare(b.lo ?? "", undefined, { numeric: true });

export function sampleChapter(chapter: number, n: number) {
  return pick(BANK.filter((q) => q.chapter === chapter), n);
}

/** FNV-1a: a stable pseudo-random order that doesn't change between deploys while the bank doesn't. */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
// Each chapter's questions in a fixed shuffled order, so consecutive numbered tests aren't consecutive LOs.
const POOLS: Record<number, Question[]> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, BANK.filter((q) => q.chapter === c.id).sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id))]),
);

/** Long tests: one per published quiz, from data/long-tests.json (written by scripts/import-quizzes.mjs). */
const LONG: { n: number; title: string; questions: string[] }[] = (longTests as { n: number; title: string; questions: string[] }[]).map((t) => ({
  ...t,
  questions: t.questions.filter((id) => BANK_BY_ID[id]),
}));

export const levelCounts = (): LevelCounts => ({
  bankTotal: BANK.length,
  short: Math.floor(BANK.length / 10),
  medium: Math.floor(BANK.length / 20),
  long: LONG.length,
  longTests: LONG.map((t) => ({ n: t.n, title: t.title, size: t.questions.length })),
});

/**
 * Short/Medium test number n (1-based): the exam's chapter weighting, taking the next block of
 * each chapter's pool, so test n and n+1 share no questions until a chapter's pool wraps around.
 */
export function numberedSet(size: 10 | 20, n: number): Question[] {
  return Object.entries(levelDistribution(size))
    .flatMap(([ch, k]) => {
      const pool = POOLS[Number(ch)];
      return Array.from({ length: Math.min(k, pool.length) }, (_, j) => pool[((n - 1) * k + j) % pool.length]);
    })
    .sort(byLo);
}

/** Long test n = Quiz n, in the quiz's own question order. */
export const longSet = (n: number): Question[] => (LONG.find((t) => t.n === n)?.questions ?? []).map((id) => BANK_BY_ID[id]);

/** A fresh random set. Level sets follow the exam's chapter weighting and syllabus order. */
export function drawSet(spec: SetSpec) {
  const questions =
    spec.kind === "chapter"
      ? sampleChapter(spec.chapter, spec.size)
      : spec.kind === "numbered"
        ? numberedSet(spec.size, spec.n)
        : spec.kind === "long"
          ? longSet(spec.n)
          : Object.entries(levelDistribution(spec.size))
              .flatMap(([ch, n]) => sampleChapter(Number(ch), n))
              .sort(byLo);
  return { key: specKey(spec), title: specTitle(spec), spec, questions, minutes: minutesFor(questions.length) };
}
