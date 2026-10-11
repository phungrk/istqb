import type { Metadata } from "next";
import Link from "next/link";
import questions from "@data/questions.json";
import sampleIds from "@data/sample-questions.json";
import { Disclaimer, JsonLd } from "@/components/Seo";
import { SITE_URL } from "@/lib/site";
import { SampleQuiz, type SampleQuestion } from "./SampleQuiz";

export const metadata: Metadata = {
  title: "ISTQB Foundation sample questions with answers (CTFL v4.0.1)",
  description: "Free ISTQB CTFL v4.0.1 sample questions across all six chapters, including equivalence partitioning and boundary value analysis, with answers and explanations.",
  alternates: { canonical: "/istqb-sample-questions" },
};

const BANK = questions as (SampleQuestion & { src: string })[];
const SAMPLE: SampleQuestion[] = (sampleIds as string[]).map((id) => {
  const { src: _src, ...q } = BANK.find((x) => x.id === id)!;
  return q;
});

export default function SampleQuestionsPage() {
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 32, maxWidth: 820 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "ISTQB Foundation sample questions with answers",
          url: `${SITE_URL}/istqb-sample-questions`,
          about: { "@type": "Thing", name: "ISTQB Certified Tester Foundation Level" },
        }}
      />
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Sample questions</span>
      <h1 style={{ margin: 0 }}>ISTQB Foundation sample questions with answers</h1>
      <p style={{ margin: 0, fontSize: "var(--fs-17)", lineHeight: 1.6, color: "var(--color-neutral-800)" }}>
        {SAMPLE.length} questions in the style of the real CTFL v4.0.1 exam, covering all six chapters. Pick an answer to see whether you got it right and why
        each option is right or wrong. The real exam has 40 questions in 60 minutes and you need 26 to pass;{" "}
        <Link href="/istqb-foundation-level">read the exam guide</Link>.
      </p>
      <SampleQuiz questions={SAMPLE} />
      <div className="card" style={{ padding: "20px 22px", gap: 10, background: "var(--color-accent-2-100)" }}>
        <strong style={{ fontSize: "var(--fs-20)" }}>Ready for the full exam?</strong>
        <span style={{ fontSize: "var(--fs-16)" }}>Take a timed 40-question mock exam, or practise one chapter at a time. Free, no account needed.</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/tests" className="btn btn-primary" style={{ textDecoration: "none" }}>Start a mock exam</Link>
          <Link href="/glossary" className="btn btn-secondary" style={{ textDecoration: "none", background: "var(--color-bg)" }}>Glossary</Link>
        </div>
      </div>
      <Disclaimer />
    </article>
  );
}
