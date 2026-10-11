import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disclaimer, JsonLd } from "@/components/Seo";
import syllabus from "@data/syllabus.json";
import { NODE, palette } from "@/lib/syllabus";
import { CHAPTER_PAGES, chapterUrl, findChapter, topicUrl } from "@/lib/syllabusPages";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTER_PAGES.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const c = findChapter((await params).chapter);
  if (!c) return {};
  return {
    title: `CTFL Chapter ${c.id}: ${c.title} (ISTQB v4.0.1)`,
    description: `${NODE["c" + c.id]?.summary} ${c.q} of the 40 exam questions. ${c.topics.length} topics with exam traps and learning objectives.`,
    alternates: { canonical: chapterUrl(c) },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const c = findChapter((await params).chapter);
  if (!c) notFound();
  const p = palette(c.id);
  // Syllabus sections (1.1, 1.2 …); the mindmap tree only keeps the topics under a chapter.
  const sections = syllabus.nodes.filter((n) => n.parent === "c" + c.id);
  const los = [...new Map(c.topics.flatMap((t) => t.los).map((l) => [l.lo, l])).values()].sort((a, b) => a.lo.localeCompare(b.lo, undefined, { numeric: true }));
  const prev = CHAPTER_PAGES[c.id - 2];
  const next = CHAPTER_PAGES[c.id];

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 24, maxWidth: 860 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Syllabus", item: `${SITE_URL}/syllabus` },
            { "@type": "ListItem", position: 2, name: `Chapter ${c.id}`, item: `${SITE_URL}${chapterUrl(c)}` },
          ],
        }}
      />
      <nav aria-label="Breadcrumb" style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
        <Link href="/syllabus">Syllabus</Link> <span aria-hidden>›</span> <span aria-current="page">Chapter {c.id}</span>
      </nav>
      <span className="tag" style={{ alignSelf: "flex-start", background: p.tint, color: p.ink }}>Chapter {c.id} · {c.q} of 40 exam questions</span>
      <h1 style={{ margin: 0 }}>{c.title}</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-18)", lineHeight: 1.55 }}>{NODE["c" + c.id]?.summary}</p>

      {sections.length > 0 && (
        <>
          <h2 style={{ margin: "8px 0 0", fontSize: "var(--fs-24)" }}>Syllabus sections</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-16)", lineHeight: 1.5 }}>
            {sections.map((s) => <li key={s.id}><strong>{s.title}</strong>: {s.summary}</li>)}
          </ul>
        </>
      )}

      <h2 style={{ margin: "8px 0 0", fontSize: "var(--fs-24)" }}>Study topics</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 10 }}>
        {c.topics.map((t) => (
          <li key={t.slug}>
            <Link href={topicUrl(t)} className="card" style={{ padding: "16px 18px", gap: 6, textDecoration: "none", color: "inherit", height: "100%" }}>
              <strong style={{ fontSize: "var(--fs-17)" }}>{t.topic.icon} {t.title}</strong>
              <span style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-800)", lineHeight: 1.45 }}>{t.intro}</span>
              {t.topic.starred && <span className="tag tag-accent" style={{ alignSelf: "flex-start" }}>⭐ Often on the exam</span>}
            </Link>
          </li>
        ))}
      </ul>

      {los.length > 0 && (
        <>
          <h2 style={{ margin: "8px 0 0", fontSize: "var(--fs-24)" }}>Learning objectives</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-15)" }}>
            {los.map((l) => (
              <li key={l.lo} style={{ display: "flex", gap: 10 }}>
                <span style={{ flex: "none", fontWeight: 700, minWidth: 74 }}>FL-{l.lo}</span>
                <span style={{ flex: "none", color: p.ink, fontWeight: 600 }}>{l.k}</span>
                <span>{l.statement}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/tests" className="btn btn-primary" style={{ textDecoration: "none" }}>Practice chapter {c.id} questions</Link>
        <Link href={`/mindmap?topic=${c.topics[0]?.topic.id ?? ""}`} className="btn btn-secondary" style={{ textDecoration: "none" }}>Open on the mindmap</Link>
      </div>
      <nav aria-label="Other chapters" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: "var(--fs-15)" }}>
        {prev ? <Link href={chapterUrl(prev)}>← Chapter {prev.id}: {prev.title}</Link> : <span />}
        {next && <Link href={chapterUrl(next)}>Chapter {next.id}: {next.title} →</Link>}
      </nav>
      <Disclaimer />
    </article>
  );
}
