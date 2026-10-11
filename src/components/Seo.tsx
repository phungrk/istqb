import Link from "next/link";

/** Structured data for search engines. `<` is escaped so a term can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const OFFICIAL = <a href="https://glossary.istqb.org" target="_blank" rel="noopener noreferrer">ISTQB Glossary</a>;

/** Trademark note for the public SEO pages; `glossary` adds the pointer to the official wording. */
export function Disclaimer({ glossary, lang = "en" }: { glossary?: boolean; lang?: "en" | "vi" }) {
  return (
    <p style={{ margin: "24px 0 0", fontSize: "var(--fs-13)", color: "var(--color-neutral-700)", maxWidth: 680 }}>
      {lang === "vi" ? (
        <>
          {glossary && <>Định nghĩa do Testpath biên soạn để hỗ trợ ôn thi. Xem cách diễn đạt chính thức tại {OFFICIAL}. </>}
          ISTQB® là nhãn hiệu đã đăng ký của International Software Testing Qualifications Board; Testpath là công cụ học độc lập, không liên kết với ISTQB.
        </>
      ) : (
        <>
          {glossary && <>Definitions are written by Testpath to help you study. For the official wording, see the {OFFICIAL}. </>}
          ISTQB® is a registered trademark of the International Software Testing Qualifications Board; Testpath is an independent study tool and is not
          affiliated with it.
        </>
      )}
    </p>
  );
}

/** Link to the same page in the other language. */
export function LangSwitch({ lang, href }: { lang: "en" | "vi"; href: string }) {
  const to = lang === "en" ? { label: "Tiếng Việt", code: "vi" } : { label: "English", code: "en" };
  return (
    <Link href={href} hrefLang={to.code} lang={to.code} className="tag" style={{ textDecoration: "none", minHeight: 32, padding: "4px 12px", fontSize: "var(--fs-13)", border: "1px solid var(--color-divider)" }}>
      🌐 {to.label}
    </Link>
  );
}
