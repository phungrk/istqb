import type { MetadataRoute } from "next";
import { TERMS } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({ url: `${SITE_URL}${path}`, changeFrequency, priority });
  return [
    page("", 1, "weekly"),
    page("/mindmap", 0.9),
    page("/tests", 0.9, "weekly"),
    page("/istqb-foundation-level", 0.9),
    page("/istqb-sample-questions", 0.9),
    page("/glossary", 0.8),
    ...TERMS.map((t) => page(`/glossary/${t.slug}`, 0.6)),
    page("/contact", 0.2),
  ];
}
