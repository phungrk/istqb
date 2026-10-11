import type { MetadataRoute } from "next";
import { TERMS } from "@/lib/glossary";
import { CHAPTER_PAGES, TOPIC_PAGES, chapterUrl, topicUrl } from "@/lib/syllabusPages";
import { SITE_URL } from "@/lib/site";

type Freq = "weekly" | "monthly";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: Freq = "monthly") => ({ url: `${SITE_URL}${path}`, changeFrequency, priority });
  // English page plus its /vi twin, each listing both languages (hreflang).
  const pair = (path: string, priority: number) => {
    const alternates = { languages: { en: `${SITE_URL}${path}`, vi: `${SITE_URL}/vi${path}` } };
    return [
      { ...page(path, priority), alternates },
      { ...page(`/vi${path}`, priority), alternates },
    ];
  };
  return [
    page("", 1, "weekly"),
    page("/mindmap", 0.9),
    page("/tests", 0.9, "weekly"),
    ...pair("/istqb-foundation-level", 0.9),
    page("/istqb-sample-questions", 0.9),
    page("/syllabus", 0.9),
    ...CHAPTER_PAGES.map((c) => page(chapterUrl(c), 0.8)),
    ...TOPIC_PAGES.map((p) => page(topicUrl(p), 0.7)),
    ...pair("/glossary", 0.8),
    ...TERMS.flatMap((t) => pair(`/glossary/${t.slug}`, 0.6)),
    page("/contact", 0.2),
  ];
}
