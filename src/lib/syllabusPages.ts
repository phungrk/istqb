import seo from "@data/topic-seo.json";
import syllabusLo from "@data/syllabus-lo.json";
import type { LoExcerpt } from "@/components/TopicView";
import { slugify } from "@/lib/slug";
import { CHAPTERS, TOPICS, type Chapter, type Topic } from "@/lib/syllabus";

/** Public, crawlable pages for the syllabus: /syllabus/<chapter>/<topic>. */
export type ChapterPage = Chapter & { slug: string; topics: TopicPage[] };
export type TopicPage = { topic: Topic; slug: string; title: string; intro: string; chapter: ChapterPage; los: LoExcerpt[] };

const SEO = seo as Record<string, { slug: string; title: string; intro: string }>;
const LO = syllabusLo as Record<string, LoExcerpt[]>;

export const CHAPTER_PAGES: ChapterPage[] = CHAPTERS.map((c) => ({ ...c, slug: `chapter-${c.id}-${slugify(c.title)}`, topics: [] }));

export const TOPIC_PAGES: TopicPage[] = Object.values(TOPICS).map((topic) => {
  const chapter = CHAPTER_PAGES[topic.chapter - 1];
  const s = SEO[topic.id] ?? { slug: topic.id, title: topic.label, intro: topic.hook };
  const page = { topic, slug: s.slug, title: s.title, intro: s.intro, chapter, los: LO[topic.id] ?? [] };
  chapter.topics.push(page);
  return page;
});

export const TOPIC_PAGE: Record<string, TopicPage> = Object.fromEntries(TOPIC_PAGES.map((p) => [p.topic.id, p]));

export const chapterUrl = (c: ChapterPage) => `/syllabus/${c.slug}`;
export const topicUrl = (p: TopicPage) => `/syllabus/${p.chapter.slug}/${p.slug}`;
/** URL of a mindmap topic's page, by topic id (for links from the glossary and the mindmap). */
export const topicHref = (id: string) => (TOPIC_PAGE[id] ? topicUrl(TOPIC_PAGE[id]) : `/mindmap?topic=${id}`);

export const findChapter = (slug: string) => CHAPTER_PAGES.find((c) => c.slug === slug);
export const findTopic = (chapterSlug: string, slug: string) => findChapter(chapterSlug)?.topics.find((p) => p.slug === slug);
