import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, JsonLd } from "@/components/Seo";
import { CHAPTERS, TOPICS } from "@/lib/syllabus";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "ISTQB Foundation Level (CTFL v4.0.1): exam format, syllabus, levels & fees",
  description: "Everything about the ISTQB CTFL exam: 40 questions, 60 minutes, 26 to pass, questions per chapter, K-levels, the ISTQB certification levels, fees and a study plan.",
  alternates: { canonical: "/istqb-foundation-level" },
};

const FACTS: [string, string][] = [
  ["Questions", "40 multiple-choice questions, 1 point each"],
  ["Time", "60 minutes, or 75 minutes (+25%) if the exam is not in your native language"],
  ["Pass mark", "26 of 40 correct (65%)"],
  ["Prerequisites", "None"],
  ["Format", "Closed book, usually one correct answer; a few questions ask you to pick two"],
  ["Validity", "Lifetime: the CTFL certificate does not expire"],
];

const K_LEVELS: [string, string, string][] = [
  ["K1", "Remember", "Recall a term or fact, e.g. which of these is a test objective."],
  ["K2", "Understand", "Explain, compare or classify, e.g. the difference between confirmation and regression testing."],
  ["K3", "Apply", "Use a technique on a scenario, e.g. derive boundary values or decision table rules."],
];

const LEVELS: [string, string][] = [
  ["Foundation", "CTFL (this exam) is the entry point and the prerequisite for most other ISTQB certificates. Specialist modules at this level include AI Testing (CT-AI), Acceptance Testing, Mobile Application Testing and Performance Testing."],
  ["Advanced", "Role-based certificates for experienced testers: Test Analyst, Technical Test Analyst, Test Manager and Test Automation Engineering."],
  ["Expert", "In-depth certificates for senior practitioners, for example in test management and test process improvement."],
];

const FAQ: [string, string][] = [
  ["Is the ISTQB Foundation exam hard?", "It is passable with focused study. Most questions test K1 and K2 understanding of the syllabus wording, and about a quarter are K3 questions on test techniques. The traps are usually in near-synonyms such as verification vs validation or defect vs failure."],
  ["How long should I study for CTFL?", "Many candidates need two to six weeks, depending on experience. A good rhythm is one syllabus chapter at a time, followed by a chapter test, then full mock exams in the last week."],
  ["Which syllabus version is examined?", "The current exams are based on the CTFL v4.0 syllabus; v4.0.1 is a maintenance release with corrections. Testpath follows v4.0.1."],
  ["How much does the ISTQB Foundation exam cost?", "Fees are set by each national board or exam provider, so they vary by country and by whether you take the exam online or at a test centre. Check the provider listed on istqb.org for your country."],
  ["Can I take the exam online?", "Yes. Many ISTQB exam providers offer online proctored exams as well as test centres."],
  ["Does the CTFL certificate expire?", "No. ISTQB Foundation Level certificates are valid for life."],
];

const STEPS: [string, string, string][] = [
  ["Learn", "Read one chapter on the mindmap: memory hooks, exam traps and the syllabus learning objectives.", "/mindmap"],
  ["Check the terms", "Look up anything unclear in the glossary. The exam is precise about wording.", "/glossary"],
  ["Test", "Take the chapter test, then a full 40-question, 60-minute mock exam.", "/tests"],
  ["Fix the gaps", "Re-read the topics you missed and retake. Book the exam when you stay above 65%.", "/tests"],
];

const th = { textAlign: "left", padding: "10px 12px", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)", fontWeight: 600 } as const;
const td = { padding: "10px 12px", borderTop: "1px solid var(--color-divider)", verticalAlign: "top" } as const;
const h2 = { margin: "8px 0 0", fontSize: "var(--fs-26)" } as const;
const prose = { margin: 0, fontSize: "var(--fs-17)", lineHeight: 1.6 } as const;

export default function FoundationGuidePage() {
  const topicsIn = (ch: number) => Object.values(TOPICS).filter((t) => t.chapter === ch).length;
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 32, maxWidth: 820 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: `${SITE_URL}/istqb-foundation-level`,
          mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Exam guide</span>
      <h1 style={{ margin: 0 }}>ISTQB Foundation Level (CTFL v4.0.1): the complete exam guide</h1>
      <p style={{ ...prose, color: "var(--color-neutral-800)" }}>
        The ISTQB® Certified Tester Foundation Level (CTFL) is the most widely held software testing certification, with more than a million certificates
        issued worldwide. This guide covers the exam format, what each syllabus chapter is worth, how the ISTQB levels fit together and how to prepare.
      </p>

      <h2 style={h2}>Exam format</h2>
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-16)" }}>
          <tbody>
            {FACTS.map(([k, v], i) => (
              <tr key={k}>
                <th scope="row" style={{ ...th, ...(i ? { borderTop: "1px solid var(--color-divider)" } : {}), width: "34%" }}>{k}</th>
                <td style={{ ...td, ...(i ? {} : { borderTop: 0 }) }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>Questions per syllabus chapter</h2>
      <p style={prose}>The 40 questions are spread over the six chapters by a fixed distribution. Chapter 4 (test techniques) is worth the most, and it is where the K3 questions are.</p>
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-16)" }}>
          <thead>
            <tr><th style={th}>Chapter</th><th style={{ ...th, textAlign: "right" }}>Questions</th><th style={{ ...th, textAlign: "right" }}>Share</th></tr>
          </thead>
          <tbody>
            {CHAPTERS.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <strong>{c.id}. {c.title}</strong>
                  <span style={{ display: "block", fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>{topicsIn(c.id)} topics on the mindmap</span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>{c.q}</td>
                <td style={{ ...td, textAlign: "right" }}>{Math.round((c.q / 40) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>K-levels: what each question asks of you</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {K_LEVELS.map(([k, name, ex]) => (
          <li key={k} className="card" style={{ padding: "14px 18px", gap: 4 }}>
            <strong>{k} · {name}</strong>
            <span style={{ fontSize: "var(--fs-16)", color: "var(--color-neutral-800)" }}>{ex}</span>
          </li>
        ))}
      </ul>

      <h2 style={h2}>ISTQB certification levels</h2>
      <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-17)", lineHeight: 1.55 }}>
        {LEVELS.map(([name, text]) => <li key={name}><strong>{name}.</strong> {text}</li>)}
      </ul>

      <h2 style={h2}>Exam fees</h2>
      <p style={prose}>
        ISTQB does not set one global price. Each national board or accredited exam provider sets its own fee, so the cost depends on your country and on
        whether you sit the exam online or at a test centre. Look up the providers for your country on istqb.org before you book.
      </p>

      <h2 style={h2}>A study plan that works</h2>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {STEPS.map(([title, text, href], i) => (
          <li key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-bg)", display: "grid", placeItems: "center", fontWeight: 700 }}>{i + 1}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
              <Link href={href}><strong>{title}</strong></Link>
              <span style={{ fontSize: "var(--fs-16)", color: "var(--color-neutral-800)" }}>{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/istqb-sample-questions" className="btn btn-primary" style={{ textDecoration: "none" }}>Try 14 sample questions</Link>
        <Link href="/mindmap" className="btn btn-secondary" style={{ textDecoration: "none" }}>Open the mindmap</Link>
      </div>

      <h2 style={h2}>FAQ</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAQ.map(([q, a]) => (
          <details key={q} className="card" style={{ padding: "14px 18px" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "var(--fs-17)" }}>{q}</summary>
            <p style={{ ...prose, marginTop: 8, fontSize: "var(--fs-16)" }}>{a}</p>
          </details>
        ))}
      </div>
      <Disclaimer />
    </article>
  );
}
