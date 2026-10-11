import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, JsonLd } from "@/components/Seo";
import { NODE, palette } from "@/lib/syllabus";
import { CHAPTER_PAGES, chapterUrl, topicUrl } from "@/lib/syllabusPages";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ISTQB CTFL v4.0.1 syllabus explained, chapter by chapter",
  description: "The ISTQB Foundation Level v4.0.1 syllabus in 6 chapters and 36 topics, each with memory hooks, exam traps, learning objectives and a practice question.",
  alternates: { canonical: "/syllabus" },
};

export default function SyllabusIndexPage() {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 32, maxWidth: 900 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "ISTQB Certified Tester Foundation Level (CTFL) v4.0.1",
          description: "Study notes for the six chapters of the ISTQB CTFL v4.0.1 syllabus.",
          url: `${SITE_URL}/syllabus`,
          provider: { "@type": "Organization", name: "Testpath", url: SITE_URL },
          hasPart: CHAPTER_PAGES.map((c) => ({ "@type": "LearningResource", name: `Chapter ${c.id}: ${c.title}`, url: `${SITE_URL}${chapterUrl(c)}` })),
        }}
      />
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Syllabus</span>
      <h1 style={{ margin: 0 }}>The ISTQB CTFL v4.0.1 syllabus, explained</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-17)", lineHeight: 1.6, color: "var(--color-neutral-800)", maxWidth: 700 }}>
        Six chapters, 36 study topics. Each topic has a memory hook, the exam trap to watch for, the official learning objectives it covers and a practice
        question. Prefer to see everything at once? Open the <Link href="/mindmap">interactive mindmap</Link>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CHAPTER_PAGES.map((c) => {
          const p = palette(c.id);
          return (
            <section key={c.id} className="card" aria-labelledby={`ch-${c.id}`} style={{ padding: "20px 22px", gap: 10, background: p.tint }}>
              <span style={{ fontSize: "var(--fs-13)", color: p.ink, fontWeight: 600 }}>Chapter {c.id} · {c.q} of 40 exam questions</span>
              <h2 id={`ch-${c.id}`} style={{ margin: 0, fontSize: "var(--fs-24)" }}>
                <Link href={chapterUrl(c)} style={{ color: "inherit" }}>{c.title}</Link>
              </h2>
              <p style={{ margin: 0, fontSize: "var(--fs-16)" }}>{NODE["c" + c.id]?.summary}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {c.topics.map((t) => (
                  <li key={t.slug}>
                    <Link href={topicUrl(t)} className="tag" style={{ background: "var(--color-bg)", color: p.ink, textDecoration: "none", minHeight: 36, padding: "6px 14px", fontSize: "var(--fs-14)" }}>
                      {t.topic.icon} {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <Disclaimer />
    </section>
  );
}
