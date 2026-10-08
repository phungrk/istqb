import bank from "@data/questions.json";
import { CHAPTERS, NODE } from "./syllabus";

export type Question = {
  id: string;
  chapter: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  source?: "bank" | "ai";
};

export const BANK: Question[] = (bank as Question[]).map((q) => ({ ...q, source: "bank" as const }));
export const BANK_BY_ID: Record<string, Question> = Object.fromEntries(BANK.map((q) => [q.id, q]));

export type Mode = "practice" | "mock";

export type ExamDef = {
  key: string;
  kicker: string;
  title: string;
  sub: string;
  questions: Question[];
  minutes: number;
};

/** Real exam: 40 questions in 60 minutes, distributed per chapter as CHAPTERS[].q. */
export const REAL_EXAM = { questions: 40, minutes: 60 };

function mockQuestions(variant: "A" | "B"): { questions: Question[]; minutes: number } {
  const byCh = CHAPTERS.map((c) => BANK.filter((q) => q.chapter === c.id));
  const enough = CHAPTERS.every((c, i) => byCh[i].length >= c.q);
  if (enough) {
    // Full-size mock following the syllabus distribution. B draws from the other end of each pool.
    const picked = CHAPTERS.flatMap((c, i) => {
      const pool = variant === "A" ? byCh[i] : [...byCh[i]].reverse();
      return pool.slice(0, c.q);
    });
    return { questions: variant === "A" ? picked : rotate(picked), minutes: REAL_EXAM.minutes };
  }
  // Small bank: use every question, at the real exam's pace of 1.5 min per question.
  const all = BANK;
  return { questions: variant === "A" ? all : rotate(all), minutes: Math.max(1, Math.floor(all.length * 1.5)) };
}

/** Deterministic "mixed order" so Mock B is stable between visits. */
function rotate(qs: Question[]): Question[] {
  const n = qs.length;
  return qs
    .map((q, i) => ({ q, k: (i * 7) % n }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.q);
}

export function examDefs(): ExamDef[] {
  const a = mockQuestions("A");
  const b = mockQuestions("B");
  return [
    { key: "mA", kicker: "Mock exam", title: "Mock Exam A", sub: "All six chapters, in syllabus order", ...a },
    { key: "mB", kicker: "Mock exam", title: "Mock Exam B", sub: "All six chapters, mixed order", ...b },
    ...CHAPTERS.map((c) => {
      const questions = BANK.filter((q) => q.chapter === c.id);
      return {
        key: "c" + c.id,
        kicker: "Chapter " + c.id,
        title: `Chapter ${c.id} · ${c.title}`,
        sub: NODE["c" + c.id].summary,
        questions,
        minutes: questions.length * 2,
      };
    }),
  ];
}

export const examDef = (key: string) => examDefs().find((d) => d.key === key);

export type PerChapter = Record<string, [number, number]>;

export function score(questions: Question[], answers: Record<number, number>) {
  let correct = 0;
  const perChapter: PerChapter = {};
  questions.forEach((q, i) => {
    const ok = answers[i] === q.answerIndex;
    if (ok) correct++;
    const p = perChapter[q.chapter] || [0, 0];
    perChapter[q.chapter] = [p[0] + (ok ? 1 : 0), p[1] + 1];
  });
  return { correct, total: questions.length, perChapter };
}
