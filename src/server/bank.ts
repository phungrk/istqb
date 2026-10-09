import "server-only";
import bank from "@data/questions.json";
import { CHAPTERS } from "@/lib/syllabus";
import { levelDistribution, minutesFor, specKey, specTitle, type Question, type SetSpec } from "@/lib/questions";

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

/** A fresh random set. Level sets follow the exam's chapter weighting and syllabus order. */
export function drawSet(spec: SetSpec) {
  const questions =
    spec.kind === "chapter"
      ? sampleChapter(spec.chapter, spec.size)
      : Object.entries(levelDistribution(spec.size))
          .flatMap(([ch, n]) => sampleChapter(Number(ch), n))
          .sort(byLo);
  return { key: specKey(spec), title: specTitle(spec), spec, questions, minutes: minutesFor(questions.length) };
}
