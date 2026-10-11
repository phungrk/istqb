import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TERM, TERMS, chapterName } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";
import { Disclaimer, JsonLd } from "@/components/Seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return TERMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = TERM[(await params).slug];
  if (!t) return {};
  const description = t.definition.length > 155 ? t.definition.slice(0, 152).replace(/\s+\S*$/, "") + "…" : t.definition;
  return {
    title: `${t.term}: ISTQB definition & exam tip`,
    description,
    alternates: { canonical: `/glossary/${t.slug}` },
    // Setting openGraph here replaces the inherited one, so the shared image is listed again.
    openGraph: { title: `${t.term} · ISTQB glossary`, description, type: "article", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = TERM[(await params).slug];
  if (!t) notFound();
  const i = TERMS.indexOf(t);
  const prev = TERMS[i - 1];
  const next = TERMS[i + 1];
  const url = `${SITE_URL}/glossary/${t.slug}`;

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 24, maxWidth: 760 }}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: t.term,
            description: t.definition,
            url,
            inDefinedTermSet: { "@type": "DefinedTermSet", name: "ISTQB CTFL v4.0.1 glossary", url: `${SITE_URL}/glossary` },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Glossary", item: `${SITE_URL}/glossary` },
              { "@type": "ListItem", position: 2, name: t.term, item: url },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
        <Link href="/glossary">Glossary</Link> <span aria-hidden>›</span> <span aria-current="page">{t.term}</span>
      </nav>
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>{chapterName(t.chapter)}</span>
      <h1 style={{ margin: 0 }}>{t.term}</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-18)", lineHeight: 1.55 }}>{t.definition}</p>

      <div className="card" style={{ padding: "18px 20px", gap: 6, background: "var(--color-accent-100)" }}>
        <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>Exam tip</span>
        <p style={{ margin: 0, fontSize: "var(--fs-16)", lineHeight: 1.5 }}>{t.tip}</p>
      </div>

      {t.see.length > 0 && (
        <section aria-labelledby="related" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="related" style={{ margin: 0, fontSize: "var(--fs-20)" }}>Related terms</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {t.see.map((s) => (
              <li key={s.slug}>
                <Link href={`/glossary/${s.slug}`} className="tag tag-accent" style={{ textDecoration: "none", minHeight: 36, padding: "6px 14px", fontSize: "var(--fs-14)" }}>{s.term}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="study" className="card" style={{ padding: "18px 20px", gap: 12 }}>
        <h2 id="study" style={{ margin: 0, fontSize: "var(--fs-20)" }}>Study it, then test yourself</h2>
        {t.topics.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {t.topics.map((tp) => (
              <li key={tp.id}>
                <Link href={`/mindmap?topic=${tp.id}`}>{tp.icon} {tp.label}</Link>
                <span style={{ color: "var(--color-neutral-700)", fontSize: "var(--fs-14)" }}> · mindmap, chapter {tp.chapter}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/tests" className="btn btn-primary" style={{ textDecoration: "none" }}>Practice chapter {t.chapter} questions</Link>
          <Link href="/glossary" className="btn btn-secondary" style={{ textDecoration: "none" }}>All terms</Link>
        </div>
      </section>

      <nav aria-label="More terms" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: "var(--fs-15)" }}>
        {prev ? <Link href={`/glossary/${prev.slug}`}>← {prev.term}</Link> : <span />}
        {next && <Link href={`/glossary/${next.slug}`}>{next.term} →</Link>}
      </nav>
      <Disclaimer glossary />
    </article>
  );
}
