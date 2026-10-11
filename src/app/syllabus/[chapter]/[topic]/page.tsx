import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import questions from "@data/questions.json";
import sampleIds from "@data/sample-questions.json";
import { Disclaimer, JsonLd } from "@/components/Seo";
import { TopicView } from "@/components/TopicView";
import { SampleQuiz, type SampleQuestion } from "@/app/istqb-sample-questions/SampleQuiz";
import { TERMS } from "@/lib/glossary";
import { palette } from "@/lib/syllabus";
import { TOPIC_PAGES, chapterUrl, findTopic, topicUrl, type TopicPage } from "@/lib/syllabusPages";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_PAGES.map((p) => ({ chapter: p.chapter.slug, topic: p.slug }));
}

type Params = Promise<{ chapter: string; topic: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { chapter, topic } = await params;
  const p = findTopic(chapter, topic);
  if (!p) return {};
  return {
    title: `${p.title}: ISTQB CTFL chapter ${p.chapter.id} explained`,
    description: p.intro,
    alternates: { canonical: topicUrl(p) },
  };
}

const BANK = questions as (SampleQuestion & { src: string })[];
const SAMPLE = new Set(sampleIds as string[]);

/** One practice question from the topic's learning objectives: single answer, no images or tables, not already on the sample page. */
function practiceQuestion(p: TopicPage): SampleQuestion | null {
  const los = new Set(p.los.map((l) => l.lo));
  const q = BANK.filter((x) => los.has(x.lo) && x.answers.length === 1 && !SAMPLE.has(x.id) && !/<img|<table/.test(x.stem + x.explanation) && x.stem.length < 600)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))[0];
  if (!q) return null;
  const { src: _src, ...rest } = q;
  return rest;
}

export default async function TopicSeoPage({ params }: { params: Params }) {
  const { chapter, topic } = await params;
  const p = findTopic(chapter, topic);
  if (!p) notFound();
  const t = p.topic;
  const pal = palette(p.chapter.id);
  const terms = TERMS.filter((x) => x.topics.some((tp) => tp.id === t.id));
  const practice = practiceQuestion(p);
  const all = p.chapter.topics;
  const i = all.indexOf(p);
  const prev = all[i - 1];
  const next = all[i + 1];
  const url = `${SITE_URL}${topicUrl(p)}`;

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 24, maxWidth: 820 }}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: p.title,
            description: p.intro,
            url,
            learningResourceType: "Study notes",
            educationalLevel: "ISTQB Certified Tester Foundation Level",
            teaches: p.los.map((l) => `FL-${l.lo} ${l.statement}`),
            isPartOf: { "@type": "Course", name: "ISTQB CTFL v4.0.1", url: `${SITE_URL}/syllabus` },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Syllabus", item: `${SITE_URL}/syllabus` },
              { "@type": "ListItem", position: 2, name: `Chapter ${p.chapter.id}`, item: `${SITE_URL}${chapterUrl(p.chapter)}` },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
        <Link href="/syllabus">Syllabus</Link> <span aria-hidden>›</span> <Link href={chapterUrl(p.chapter)}>Chapter {p.chapter.id}</Link>{" "}
        <span aria-hidden>›</span> <span aria-current="page">{p.title}</span>
      </nav>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="tag" style={{ background: pal.tint, color: pal.ink }}>Chapter {p.chapter.id} · {p.chapter.title}</span>
        {t.starred && <span className="tag tag-accent">⭐ Often on the exam</span>}
      </div>
      <h1 style={{ margin: 0 }}>{t.icon} {p.title}</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-18)", lineHeight: 1.55 }}>{p.intro}</p>

      <section aria-labelledby="notes" className="card" style={{ padding: 24, gap: 12 }}>
        <h2 id="notes" style={{ margin: 0, fontSize: "var(--fs-22)" }}>Study notes</h2>
        <p style={{ margin: 0, fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
          Memory hooks and exam traps are in Vietnamese; the syllabus learning objectives are quoted in English.
        </p>
        <div lang="vi">
          <TopicView topic={t} color={pal.base} ink={pal.ink} los={p.los} />
        </div>
      </section>

      {terms.length > 0 && (
        <section aria-labelledby="terms" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="terms" style={{ margin: 0, fontSize: "var(--fs-22)" }}>Key terms in the glossary</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {terms.map((x) => (
              <li key={x.slug}>
                <Link href={`/glossary/${x.slug}`} className="tag tag-accent" style={{ textDecoration: "none", minHeight: 36, padding: "6px 14px", fontSize: "var(--fs-14)" }}>{x.term}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {practice && (
        <section aria-labelledby="try" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="try" style={{ margin: 0, fontSize: "var(--fs-22)" }}>Try an exam question</h2>
          <SampleQuiz questions={[practice]} />
        </section>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={`/mindmap?topic=${t.id}`} className="btn btn-primary" style={{ textDecoration: "none" }}>Open on the mindmap</Link>
        <Link href="/tests" className="btn btn-secondary" style={{ textDecoration: "none" }}>Practice chapter {p.chapter.id}</Link>
      </div>
      <nav aria-label="More topics" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: "var(--fs-15)" }}>
        {prev ? <Link href={topicUrl(prev)}>← {prev.title}</Link> : <Link href={chapterUrl(p.chapter)}>← Chapter {p.chapter.id} overview</Link>}
        {next ? <Link href={topicUrl(next)}>{next.title} →</Link> : <Link href={chapterUrl(p.chapter)}>Chapter {p.chapter.id} overview →</Link>}
      </nav>
      <Disclaimer />
    </article>
  );
}
