import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, JsonLd, LangSwitch } from "@/components/Seo";
import { TERMS, chapterName, lead, termText, type Lang, type Term } from "@/lib/glossary";
import { CHAPTERS } from "@/lib/syllabus";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { topicHref } from "@/lib/syllabusPages";
import { GlossaryList } from "./GlossaryList";

/** The glossary in English (/glossary) and Vietnamese (/vi/glossary): same terms and slugs, translated text. */
const T = {
  en: {
    base: "/glossary",
    tag: "Glossary",
    h1: "ISTQB glossary for the CTFL exam",
    intro: (n: number) => `${n} key terms from the Foundation Level syllabus v4.0.1, explained in plain English. Each term comes with the trap the exam likes to set and a link to the topic in the syllabus notes.`,
    guide: ["New to the exam? Start with the", "CTFL exam guide", "/istqb-foundation-level"],
    metaTitle: "ISTQB Glossary: CTFL v4.0.1 key terms explained",
    metaDesc: (n: number) => `${n} ISTQB Foundation Level (CTFL v4.0.1) terms in plain English, each with an exam tip and links to the syllabus topic. Free.`,
    termTitle: (t: Term) => `${t.term}: ISTQB definition & exam tip`,
    tip: "Exam tip",
    related: "Related terms",
    study: "Study it, then test yourself",
    notes: (ch: number) => `study notes, chapter ${ch}`,
    practice: (ch: number) => `Practice chapter ${ch} questions`,
    all: "All terms",
    list: { search: "Search a term, e.g. regression", searchLabel: "Search the glossary", allChapters: "All chapters", chapter: "Chapter", ch: "Ch", jump: "Jump to letter", none: "No term matches" },
    setName: "ISTQB CTFL v4.0.1 glossary",
  },
  vi: {
    base: "/vi/glossary",
    tag: "Thuật ngữ",
    h1: "Thuật ngữ ISTQB cho kỳ thi CTFL",
    intro: (n: number) => `${n} thuật ngữ chính của syllabus Foundation Level v4.0.1, giải thích bằng tiếng Việt dễ hiểu. Mỗi thuật ngữ kèm bẫy hay gặp trong đề thi và link tới ghi chú của topic trong syllabus.`,
    guide: ["Mới tìm hiểu kỳ thi? Bắt đầu với", "hướng dẫn thi CTFL", "/vi/istqb-foundation-level"],
    metaTitle: "Thuật ngữ ISTQB (CTFL v4.0.1) giải thích bằng tiếng Việt",
    metaDesc: (n: number) => `${n} thuật ngữ ISTQB Foundation Level (CTFL v4.0.1) giải thích bằng tiếng Việt, kèm mẹo thi và link tới topic trong syllabus. Miễn phí.`,
    termTitle: (t: Term) => `${t.term} là gì? (${t.vi.vn}) · Thuật ngữ ISTQB`,
    tip: "Mẹo thi",
    related: "Thuật ngữ liên quan",
    study: "Học rồi tự kiểm tra",
    notes: (ch: number) => `ghi chú học, chương ${ch}`,
    practice: (ch: number) => `Luyện câu hỏi chương ${ch}`,
    all: "Tất cả thuật ngữ",
    list: { search: "Tìm thuật ngữ, ví dụ regression", searchLabel: "Tìm trong thuật ngữ", allChapters: "Tất cả các chương", chapter: "Chương", ch: "Ch", jump: "Chuyển tới chữ cái", none: "Không có thuật ngữ nào khớp với" },
    setName: "Thuật ngữ ISTQB CTFL v4.0.1",
  },
};

const other = (lang: Lang): Lang => (lang === "en" ? "vi" : "en");
const languages = (path: string) => ({ en: `/glossary${path}`, vi: `/vi/glossary${path}`, "x-default": `/glossary${path}` });

export function glossaryMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: t.metaTitle, description: t.metaDesc(TERMS.length), alternates: { canonical: t.base, languages: languages("") } };
}

export function termMetadata(term: Term, lang: Lang): Metadata {
  const t = T[lang];
  const d = termText(term, lang).definition;
  const description = d.length > 155 ? d.slice(0, 152).replace(/\s+\S*$/, "") + "…" : d;
  return {
    title: t.termTitle(term),
    description,
    alternates: { canonical: `${t.base}/${term.slug}`, languages: languages(`/${term.slug}`) },
    // Setting openGraph here replaces the inherited one, so the shared image is listed again.
    openGraph: { title: t.termTitle(term), description, type: "article", locale: lang === "vi" ? "vi_VN" : "en_US", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export function GlossaryIndex({ lang }: { lang: Lang }) {
  const t = T[lang];
  const items = TERMS.map((x) => ({ term: x.term, sub: lang === "vi" ? x.vi.vn : undefined, slug: x.slug, chapter: x.chapter, lead: lead(termText(x, lang).definition) }));
  return (
    <section lang={lang} style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 32, maxWidth: 880 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: t.setName,
          inLanguage: lang,
          url: `${SITE_URL}${t.base}`,
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          hasDefinedTerm: TERMS.map((x) => ({ "@type": "DefinedTerm", name: x.term, url: `${SITE_URL}${t.base}/${x.slug}` })),
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span className="tag tag-accent-2">{t.tag}</span>
        <LangSwitch lang={lang} href={T[other(lang)].base} />
      </div>
      <h1 style={{ margin: 0 }}>{t.h1}</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-17)", color: "var(--color-neutral-800)", maxWidth: 680 }}>
        {t.intro(TERMS.length)} {t.guide[0]} <Link href={t.guide[2]}>{t.guide[1]}</Link>.
      </p>
      <GlossaryList items={items} base={t.base} labels={t.list} chapters={CHAPTERS.map((c) => ({ id: c.id, title: c.title }))} />
      <Disclaimer glossary lang={lang} />
    </section>
  );
}

export function TermView({ term, lang }: { term: Term; lang: Lang }) {
  const t = T[lang];
  const { definition, tip } = termText(term, lang);
  const i = TERMS.indexOf(term);
  const prev = TERMS[i - 1];
  const next = TERMS[i + 1];
  const url = `${SITE_URL}${t.base}/${term.slug}`;

  return (
    <article lang={lang} style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 24, maxWidth: 760 }}>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "DefinedTerm", name: term.term, ...(lang === "vi" ? { alternateName: term.vi.vn } : {}), description: definition, inLanguage: lang, url, inDefinedTermSet: { "@type": "DefinedTermSet", name: t.setName, url: `${SITE_URL}${t.base}` } },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t.tag, item: `${SITE_URL}${t.base}` },
              { "@type": "ListItem", position: 2, name: term.term, item: url },
            ],
          },
        ]}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
          <Link href={t.base}>{t.tag}</Link> <span aria-hidden>›</span> <span aria-current="page">{term.term}</span>
        </nav>
        <LangSwitch lang={lang} href={`${T[other(lang)].base}/${term.slug}`} />
      </div>
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>{chapterName(term.chapter, lang)}</span>
      <h1 style={{ margin: 0 }}>{term.term}</h1>
      {lang === "vi" && <p style={{ margin: "-8px 0 0", fontSize: "var(--fs-18)", color: "var(--color-neutral-700)" }}>{term.vi.vn}</p>}
      <p style={{ margin: 0, fontSize: "var(--fs-18)", lineHeight: 1.55 }}>{definition}</p>

      <div className="card" style={{ padding: "18px 20px", gap: 6, background: "var(--color-accent-100)" }}>
        <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>{t.tip}</span>
        <p style={{ margin: 0, fontSize: "var(--fs-16)", lineHeight: 1.5 }}>{tip}</p>
      </div>

      {term.see.length > 0 && (
        <section aria-labelledby="related" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="related" style={{ margin: 0, fontSize: "var(--fs-20)" }}>{t.related}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {term.see.map((s) => (
              <li key={s.slug}>
                <Link href={`${t.base}/${s.slug}`} className="tag tag-accent" style={{ textDecoration: "none", minHeight: 36, padding: "6px 14px", fontSize: "var(--fs-14)" }}>{s.term}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="study" className="card" style={{ padding: "18px 20px", gap: 12 }}>
        <h2 id="study" style={{ margin: 0, fontSize: "var(--fs-20)" }}>{t.study}</h2>
        {term.topics.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {term.topics.map((tp) => (
              <li key={tp.id}>
                <Link href={topicHref(tp.id)}>{tp.icon} {tp.label}</Link>
                <span style={{ color: "var(--color-neutral-700)", fontSize: "var(--fs-14)" }}> · {t.notes(tp.chapter)}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/tests" className="btn btn-primary" style={{ textDecoration: "none" }}>{t.practice(term.chapter)}</Link>
          <Link href={t.base} className="btn btn-secondary" style={{ textDecoration: "none" }}>{t.all}</Link>
        </div>
      </section>

      <nav aria-label="More terms" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: "var(--fs-15)" }}>
        {prev ? <Link href={`${t.base}/${prev.slug}`}>← {prev.term}</Link> : <span />}
        {next && <Link href={`${t.base}/${next.slug}`}>{next.term} →</Link>}
      </nav>
      <Disclaimer glossary lang={lang} />
    </article>
  );
}
