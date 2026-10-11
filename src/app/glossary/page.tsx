import type { Metadata } from "next";
import { TERMS } from "@/lib/glossary";
import { CHAPTERS } from "@/lib/syllabus";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { GlossaryList } from "./GlossaryList";
import { Disclaimer, JsonLd } from "./shared";

export const metadata: Metadata = {
  title: "ISTQB Glossary: CTFL v4.0.1 key terms explained",
  description: `${TERMS.length} ISTQB Foundation Level (CTFL v4.0.1) terms in plain English, each with an exam tip and links to the syllabus topic. Free.`,
  alternates: { canonical: "/glossary" },
};

/** First sentence of a definition, for the list. */
const lead = (d: string) => d.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? d;

export default function GlossaryPage() {
  const items = TERMS.map((t) => ({ term: t.term, slug: t.slug, chapter: t.chapter, lead: lead(t.definition) }));
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 32, maxWidth: 880 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "ISTQB CTFL v4.0.1 glossary",
          url: `${SITE_URL}/glossary`,
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          hasDefinedTerm: TERMS.map((t) => ({ "@type": "DefinedTerm", name: t.term, url: `${SITE_URL}/glossary/${t.slug}` })),
        }}
      />
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Glossary</span>
      <h1 style={{ margin: 0 }}>ISTQB glossary for the CTFL exam</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-17)", color: "var(--color-neutral-800)", maxWidth: 680 }}>
        {TERMS.length} key terms from the Foundation Level syllabus v4.0.1, explained in plain English. Each term comes with the trap the exam likes to set and a link to the topic on the mindmap.
      </p>
      <GlossaryList items={items} chapters={CHAPTERS.map((c) => ({ id: c.id, title: c.title }))} />
      <Disclaimer />
    </section>
  );
}
