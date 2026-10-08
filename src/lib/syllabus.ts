import syllabus from "@data/syllabus.json";

export type Chapter = { id: number; title: string; q: number };
export type SyllabusNode = { id: string; parent: string | null; title: string; summary: string; points: string[] };

export const CHAPTERS: Chapter[] = syllabus.chapters;
export const NODES: SyllabusNode[] = syllabus.nodes;

export const NODE: Record<string, SyllabusNode> = {};
export const KIDS: Record<string, string[]> = {};
for (const n of NODES) {
  NODE[n.id] = n;
  if (n.parent) (KIDS[n.parent] ||= []).push(n.id);
}

/** Chapter number a node belongs to, or null for the root. */
export function chapterOf(id: string): number | null {
  let n: SyllabusNode | undefined = NODE[id];
  while (n && n.parent && n.parent !== "root") n = NODE[n.parent];
  return n && n.id[0] === "c" ? Number(n.id.slice(1)) : null;
}

export function depthOf(id: string): number {
  let d = 0;
  let n = NODE[id];
  while (n?.parent) {
    d++;
    n = NODE[n.parent];
  }
  return d;
}

/** Sections and concepts: the nodes a member can mark as learned. */
export const STUDY_IDS = NODES.filter((n) => n.parent && n.parent !== "root").map((n) => n.id);

export type Palette = { tint: string; mid: string; ink: string; base: string };

/** Odd chapters use the accent ramp, even chapters the accent-2 ramp. */
export function palette(chapter: number): Palette {
  return chapter % 2
    ? { tint: "var(--color-accent-100)", mid: "var(--color-accent-200)", ink: "var(--color-accent-800)", base: "var(--color-accent)" }
    : { tint: "var(--color-accent-2-100)", mid: "var(--color-accent-2-200)", ink: "var(--color-accent-2-800)", base: "var(--color-accent-2)" };
}

export const chapterTitle = (id: number) => CHAPTERS[id - 1]?.title ?? `Chapter ${id}`;
