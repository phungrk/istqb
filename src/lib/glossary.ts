import glossary from "@data/glossary.json";
import glossaryVi from "@data/glossary-vi.json";
import syllabusLo from "@data/syllabus-lo.json";
import { slugify } from "@/lib/slug";
import { CHAPTERS, TOPICS, type Topic } from "@/lib/syllabus";

type Raw = { t: string; ch: number; d: string; tip: string; see: string[]; topics?: string[] };
export type Term = { term: string; slug: string; chapter: number; definition: string; tip: string; see: Term[]; topics: Topic[]; vi: { vn: string; d: string; tip: string } };
export type Lang = "en" | "vi";

const norm = (s: string) => s.toLowerCase().replace(/-/g, " ");

const raw = glossary as Raw[];
const VI = glossaryVi as Record<string, Term["vi"]>;
const LO = syllabusLo as Record<string, { keywords: string[] }[]>;

/** Mindmap topics whose syllabus LOs list the term as a keyword, plus any hand-picked ones. */
function topicsFor(r: Raw): Topic[] {
  const k = norm(r.t);
  const ids = new Set(r.topics ?? []);
  for (const [id, los] of Object.entries(LO)) if (los.some((l) => l.keywords.some((w) => norm(w) === k || norm(w) === k + "s"))) ids.add(id);
  return [...ids].map((id) => TOPICS[id]).filter(Boolean);
}

export const TERMS: Term[] = raw
  .map((r) => ({ term: r.t, slug: slugify(r.t), chapter: r.ch, definition: r.d, tip: r.tip, see: [] as Term[], topics: topicsFor(r), vi: VI[slugify(r.t)] }))
  .sort((a, b) => a.term.localeCompare(b.term));

export const TERM: Record<string, Term> = Object.fromEntries(TERMS.map((t) => [t.slug, t]));
for (const r of raw) TERM[slugify(r.t)].see = r.see.map((s) => TERM[slugify(s)]).filter(Boolean);

export const chapterName = (n: number, lang: Lang = "en") => `${lang === "vi" ? "Chương" : "Chapter"} ${n} · ${CHAPTERS[n - 1]?.title ?? ""}`;
/** Definition and tip in the page language. */
export const termText = (t: Term, lang: Lang) => (lang === "vi" ? { definition: t.vi.d, tip: t.vi.tip } : { definition: t.definition, tip: t.tip });
/** First sentence, for lists and meta descriptions. */
export const lead = (d: string) => d.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? d;
