import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, JsonLd, LangSwitch } from "@/components/Seo";
import type { Lang } from "@/lib/glossary";
import { CHAPTERS, TOPICS } from "@/lib/syllabus";
import { CHAPTER_PAGES, chapterUrl } from "@/lib/syllabusPages";
import { SITE_URL } from "@/lib/site";

type Content = {
  path: string;
  metaTitle: string;
  metaDesc: string;
  tag: string;
  h1: string;
  intro: string;
  h: { format: string; perChapter: string; kLevels: string; levels: string; fees: string; plan: string; faq: string };
  facts: [string, string][];
  perChapterText: string;
  table: { chapter: string; questions: string; share: string; topics: (n: number) => string };
  kLevels: [string, string, string][];
  levels: [string, string][];
  fees: string;
  steps: [string, string, string][];
  ctaSample: string;
  ctaMindmap: string;
  faq: [string, string][];
};

/** The CTFL exam guide in English (/istqb-foundation-level) and Vietnamese (/vi/istqb-foundation-level). */
const C: Record<Lang, Content> = {
  en: {
    path: "/istqb-foundation-level",
    metaTitle: "ISTQB Foundation Level (CTFL v4.0.1): exam format, syllabus, levels & fees",
    metaDesc: "Everything about the ISTQB CTFL exam: 40 questions, 60 minutes, 26 to pass, questions per chapter, K-levels, the ISTQB certification levels, fees and a study plan.",
    tag: "Exam guide",
    h1: "ISTQB Foundation Level (CTFL v4.0.1): the complete exam guide",
    intro: "The ISTQB® Certified Tester Foundation Level (CTFL) is the most widely held software testing certification, with more than a million certificates issued worldwide. This guide covers the exam format, what each syllabus chapter is worth, how the ISTQB levels fit together and how to prepare.",
    h: { format: "Exam format", perChapter: "Questions per syllabus chapter", kLevels: "K-levels: what each question asks of you", levels: "ISTQB certification levels", fees: "Exam fees", plan: "A study plan that works", faq: "FAQ" },
    facts: [
      ["Questions", "40 multiple-choice questions, 1 point each"],
      ["Time", "60 minutes, or 75 minutes (+25%) if the exam is not in your native language"],
      ["Pass mark", "26 of 40 correct (65%)"],
      ["Prerequisites", "None"],
      ["Format", "Closed book, usually one correct answer; a few questions ask you to pick two"],
      ["Validity", "Lifetime: the CTFL certificate does not expire"],
    ],
    perChapterText: "The 40 questions are spread over the six chapters by a fixed distribution. Chapter 4 (test techniques) is worth the most, and it is where the K3 questions are.",
    table: { chapter: "Chapter", questions: "Questions", share: "Share", topics: (n) => `${n} topics in the syllabus notes` },
    kLevels: [
      ["K1", "Remember", "Recall a term or fact, e.g. which of these is a test objective."],
      ["K2", "Understand", "Explain, compare or classify, e.g. the difference between confirmation and regression testing."],
      ["K3", "Apply", "Use a technique on a scenario, e.g. derive boundary values or decision table rules."],
    ],
    levels: [
      ["Foundation", "CTFL (this exam) is the entry point and the prerequisite for most other ISTQB certificates. Specialist modules at this level include AI Testing (CT-AI), Acceptance Testing, Mobile Application Testing and Performance Testing."],
      ["Advanced", "Role-based certificates for experienced testers: Test Analyst, Technical Test Analyst, Test Manager and Test Automation Engineering."],
      ["Expert", "In-depth certificates for senior practitioners, for example in test management and test process improvement."],
    ],
    fees: "ISTQB does not set one global price. Each national board or accredited exam provider sets its own fee, so the cost depends on your country and on whether you sit the exam online or at a test centre. Look up the providers for your country on istqb.org before you book.",
    steps: [
      ["Learn", "Read one chapter in the syllabus notes or on the mindmap: memory hooks, exam traps and the learning objectives.", "/syllabus"],
      ["Check the terms", "Look up anything unclear in the glossary. The exam is precise about wording.", "/glossary"],
      ["Test", "Take the chapter test, then a full 40-question, 60-minute mock exam.", "/tests"],
      ["Fix the gaps", "Re-read the topics you missed and retake. Book the exam when you stay above 65%.", "/tests"],
    ],
    ctaSample: "Try 14 sample questions",
    ctaMindmap: "Open the mindmap",
    faq: [
      ["Is the ISTQB Foundation exam hard?", "It is passable with focused study. Most questions test K1 and K2 understanding of the syllabus wording, and about a quarter are K3 questions on test techniques. The traps are usually in near-synonyms such as verification vs validation or defect vs failure."],
      ["How long should I study for CTFL?", "Many candidates need two to six weeks, depending on experience. A good rhythm is one syllabus chapter at a time, followed by a chapter test, then full mock exams in the last week."],
      ["Which syllabus version is examined?", "The current exams are based on the CTFL v4.0 syllabus; v4.0.1 is a maintenance release with corrections. Testpath follows v4.0.1."],
      ["How much does the ISTQB Foundation exam cost?", "Fees are set by each national board or exam provider, so they vary by country and by whether you take the exam online or at a test centre. Check the provider listed on istqb.org for your country."],
      ["Can I take the exam online?", "Yes. Many ISTQB exam providers offer online proctored exams as well as test centres."],
      ["Does the CTFL certificate expire?", "No. ISTQB Foundation Level certificates are valid for life."],
    ],
  },
  vi: {
    path: "/vi/istqb-foundation-level",
    metaTitle: "Chứng chỉ ISTQB Foundation (CTFL v4.0.1): cấu trúc đề thi, syllabus, lệ phí",
    metaDesc: "Tất cả về kỳ thi ISTQB CTFL: 40 câu, 60 phút, đúng 26 câu là đậu, số câu theo từng chương, K-level, các cấp chứng chỉ ISTQB, lệ phí và lộ trình ôn thi.",
    tag: "Hướng dẫn thi",
    h1: "Chứng chỉ ISTQB Foundation Level (CTFL v4.0.1): hướng dẫn thi đầy đủ",
    intro: "ISTQB® Certified Tester Foundation Level (CTFL) là chứng chỉ kiểm thử phần mềm phổ biến nhất thế giới, với hơn một triệu chứng chỉ đã được cấp. Bài này tóm tắt cấu trúc đề thi, mỗi chương syllabus chiếm bao nhiêu câu, các cấp chứng chỉ ISTQB và cách ôn thi hiệu quả.",
    h: { format: "Cấu trúc đề thi", perChapter: "Số câu hỏi theo từng chương", kLevels: "K-level: mỗi câu hỏi đòi hỏi gì ở bạn", levels: "Các cấp chứng chỉ ISTQB", fees: "Lệ phí thi", plan: "Lộ trình ôn thi hiệu quả", faq: "Câu hỏi thường gặp" },
    facts: [
      ["Số câu", "40 câu trắc nghiệm, mỗi câu 1 điểm"],
      ["Thời gian", "60 phút, hoặc 75 phút (+25%) nếu đề thi không bằng tiếng mẹ đẻ của bạn"],
      ["Điểm đậu", "Đúng 26/40 câu (65%)"],
      ["Điều kiện dự thi", "Không có"],
      ["Hình thức", "Không được xem tài liệu, thường chỉ một đáp án đúng; một số câu yêu cầu chọn hai đáp án"],
      ["Hiệu lực", "Vĩnh viễn: chứng chỉ CTFL không hết hạn"],
    ],
    perChapterText: "40 câu được phân bổ cố định cho sáu chương. Chương 4 (kỹ thuật kiểm thử) chiếm nhiều câu nhất và là nơi có các câu K3 (bài tập áp dụng).",
    table: { chapter: "Chương", questions: "Số câu", share: "Tỷ lệ", topics: (n) => `${n} topic trong ghi chú syllabus` },
    kLevels: [
      ["K1", "Nhớ", "Nhớ lại thuật ngữ hoặc dữ kiện, ví dụ: đâu là một mục tiêu của testing."],
      ["K2", "Hiểu", "Giải thích, so sánh hoặc phân loại, ví dụ: khác nhau giữa confirmation testing và regression testing."],
      ["K3", "Áp dụng", "Dùng kỹ thuật cho một tình huống, ví dụ: tìm giá trị biên hoặc các rule của bảng quyết định."],
    ],
    levels: [
      ["Foundation", "CTFL (kỳ thi này) là cấp nhập môn và là điều kiện tiên quyết cho hầu hết chứng chỉ ISTQB khác. Ở cấp này còn có các module chuyên sâu như AI Testing (CT-AI), Acceptance Testing, Mobile Application Testing và Performance Testing."],
      ["Advanced", "Chứng chỉ theo vai trò cho tester có kinh nghiệm: Test Analyst, Technical Test Analyst, Test Manager và Test Automation Engineering."],
      ["Expert", "Chứng chỉ chuyên sâu cho người làm lâu năm, ví dụ về quản lý kiểm thử và cải tiến quy trình kiểm thử."],
    ],
    fees: "ISTQB không có một mức phí chung toàn cầu. Mỗi hội đồng quốc gia (ở Việt Nam là Vietnamese Testing Board) hoặc đơn vị tổ chức thi được công nhận tự đặt lệ phí, nên chi phí tuỳ quốc gia và tuỳ bạn thi online hay tại trung tâm. Hãy tra danh sách đơn vị tổ chức thi tại istqb.org trước khi đăng ký.",
    steps: [
      ["Học", "Đọc từng chương trong ghi chú syllabus hoặc trên mindmap: memory hook, bẫy đề thi và learning objective.", "/syllabus"],
      ["Tra thuật ngữ", "Tra mọi thuật ngữ chưa rõ trong phần thuật ngữ. Đề thi rất chặt về cách dùng từ.", "/vi/glossary"],
      ["Làm bài", "Làm bài test theo chương, sau đó làm đề thi thử đầy đủ 40 câu trong 60 phút.", "/tests"],
      ["Lấp lỗ hổng", "Đọc lại các topic làm sai rồi làm lại. Đăng ký thi khi điểm ổn định trên 65%.", "/tests"],
    ],
    ctaSample: "Làm thử 14 câu hỏi mẫu",
    ctaMindmap: "Mở mindmap",
    faq: [
      ["Thi ISTQB Foundation có khó không?", "Hoàn toàn có thể đậu nếu ôn tập có trọng tâm. Phần lớn câu hỏi kiểm tra mức K1, K2 về cách diễn đạt trong syllabus, khoảng một phần tư là câu K3 về kỹ thuật kiểm thử. Bẫy thường nằm ở các cặp từ gần nghĩa như verification và validation, defect và failure."],
      ["Cần ôn thi CTFL trong bao lâu?", "Nhiều người cần từ hai đến sáu tuần, tuỳ kinh nghiệm. Nhịp học tốt là mỗi lần một chương, làm bài test chương đó, và tuần cuối làm các đề thi thử đầy đủ."],
      ["Đề thi theo syllabus phiên bản nào?", "Đề thi hiện tại dựa trên syllabus CTFL v4.0; v4.0.1 là bản bảo trì có sửa lỗi. Testpath theo v4.0.1."],
      ["Có thi bằng tiếng Việt được không?", "Có đơn vị tổ chức thi cung cấp đề ISTQB Foundation bằng tiếng Việt. Tuy vậy, thuật ngữ trong công việc và tài liệu chủ yếu là tiếng Anh, nên hãy học thuật ngữ bằng tiếng Anh dù bạn thi bằng ngôn ngữ nào."],
      ["Lệ phí thi ISTQB Foundation là bao nhiêu?", "Lệ phí do từng hội đồng quốc gia hoặc đơn vị tổ chức thi đặt, nên khác nhau theo quốc gia và hình thức thi (online hay tại trung tâm). Hãy kiểm tra đơn vị tổ chức thi cho Việt Nam được liệt kê trên istqb.org."],
      ["Chứng chỉ CTFL có hết hạn không?", "Không. Chứng chỉ ISTQB Foundation Level có giá trị vĩnh viễn."],
    ],
  },
};

const languages = { en: C.en.path, vi: C.vi.path, "x-default": C.en.path };

export function guideMetadata(lang: Lang): Metadata {
  const c = C[lang];
  return { title: c.metaTitle, description: c.metaDesc, alternates: { canonical: c.path, languages } };
}

const th = { textAlign: "left", padding: "10px 12px", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)", fontWeight: 600 } as const;
const td = { padding: "10px 12px", borderTop: "1px solid var(--color-divider)", verticalAlign: "top" } as const;
const h2 = { margin: "8px 0 0", fontSize: "var(--fs-26)" } as const;
const prose = { margin: 0, fontSize: "var(--fs-17)", lineHeight: 1.6 } as const;

export function GuideView({ lang }: { lang: Lang }) {
  const c = C[lang];
  const topicsIn = (ch: number) => Object.values(TOPICS).filter((t) => t.chapter === ch).length;
  return (
    <article lang={lang} style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 32, maxWidth: 820 }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: lang,
          url: `${SITE_URL}${c.path}`,
          mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span className="tag tag-accent-2">{c.tag}</span>
        <LangSwitch lang={lang} href={C[lang === "en" ? "vi" : "en"].path} />
      </div>
      <h1 style={{ margin: 0 }}>{c.h1}</h1>
      <p style={{ ...prose, color: "var(--color-neutral-800)" }}>{c.intro}</p>

      <h2 style={h2}>{c.h.format}</h2>
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-16)" }}>
          <tbody>
            {c.facts.map(([k, v], i) => (
              <tr key={k}>
                <th scope="row" style={{ ...th, ...(i ? { borderTop: "1px solid var(--color-divider)" } : {}), width: "34%" }}>{k}</th>
                <td style={{ ...td, ...(i ? {} : { borderTop: 0 }) }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>{c.h.perChapter}</h2>
      <p style={prose}>{c.perChapterText}</p>
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-16)" }}>
          <thead>
            <tr><th style={th}>{c.table.chapter}</th><th style={{ ...th, textAlign: "right" }}>{c.table.questions}</th><th style={{ ...th, textAlign: "right" }}>{c.table.share}</th></tr>
          </thead>
          <tbody>
            {CHAPTERS.map((ch) => (
              <tr key={ch.id}>
                <td style={td}>
                  <Link href={chapterUrl(CHAPTER_PAGES[ch.id - 1])}><strong>{ch.id}. {ch.title}</strong></Link>
                  <span style={{ display: "block", fontSize: "var(--fs-13)", color: "var(--color-neutral-700)" }}>{c.table.topics(topicsIn(ch.id))}</span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>{ch.q}</td>
                <td style={{ ...td, textAlign: "right" }}>{Math.round((ch.q / 40) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>{c.h.kLevels}</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {c.kLevels.map(([k, name, ex]) => (
          <li key={k} className="card" style={{ padding: "14px 18px", gap: 4 }}>
            <strong>{k} · {name}</strong>
            <span style={{ fontSize: "var(--fs-16)", color: "var(--color-neutral-800)" }}>{ex}</span>
          </li>
        ))}
      </ul>

      <h2 style={h2}>{c.h.levels}</h2>
      <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-17)", lineHeight: 1.55 }}>
        {c.levels.map(([name, text]) => <li key={name}><strong>{name}.</strong> {text}</li>)}
      </ul>

      <h2 style={h2}>{c.h.fees}</h2>
      <p style={prose}>{c.fees}</p>

      <h2 style={h2}>{c.h.plan}</h2>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {c.steps.map(([title, text, href], i) => (
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
        <Link href="/istqb-sample-questions" className="btn btn-primary" style={{ textDecoration: "none" }}>{c.ctaSample}</Link>
        <Link href="/mindmap" className="btn btn-secondary" style={{ textDecoration: "none" }}>{c.ctaMindmap}</Link>
      </div>

      <h2 style={h2}>{c.h.faq}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {c.faq.map(([q, a]) => (
          <details key={q} className="card" style={{ padding: "14px 18px" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "var(--fs-17)" }}>{q}</summary>
            <p style={{ ...prose, marginTop: 8, fontSize: "var(--fs-16)" }}>{a}</p>
          </details>
        ))}
      </div>
      <Disclaimer lang={lang} />
    </article>
  );
}
