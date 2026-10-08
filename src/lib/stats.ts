import { CHAPTERS, type Chapter } from "./syllabus";
import type { Mode, PerChapter } from "./questions";

export type Attempt = {
  id: string;
  title: string;
  setKey: string;
  mode: Mode;
  correct: number;
  total: number;
  durationSec: number;
  perChapter: PerChapter;
  createdAt: string;
};

export type ChapterMastery = Chapter & { pct: number | null };

export const pct = (a: { correct: number; total: number }) => Math.round((a.correct / a.total) * 100);

/** Σcorrect / Σtotal per chapter across all attempts. */
export function mastery(attempts: Attempt[]): ChapterMastery[] {
  const agg: Record<string, [number, number]> = {};
  for (const a of attempts)
    for (const [c, [k, t]] of Object.entries(a.perChapter)) {
      const p = agg[c] || [0, 0];
      agg[c] = [p[0] + k, p[1] + t];
    }
  return CHAPTERS.map((c) => {
    const p = agg[c.id];
    return { ...c, pct: p ? Math.round((p[0] / p[1]) * 100) : null };
  });
}

/** The two weakest chapters; Chapters 4 and 5 when there is no data yet. */
export function weakest(attempts: Attempt[]): ChapterMastery[] {
  const m = mastery(attempts)
    .filter((c) => c.pct !== null)
    .sort((a, b) => (a.pct as number) - (b.pct as number));
  return m.length ? m.slice(0, 2) : [CHAPTERS[3], CHAPTERS[4]].map((c) => ({ ...c, pct: null }));
}

export const formatClock = (s: number) => {
  s = Math.max(0, Math.round(s));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
};
