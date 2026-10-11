/** Structured data for search engines. `<` is escaped so a term can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Disclaimer() {
  return (
    <p style={{ margin: "24px 0 0", fontSize: "var(--fs-13)", color: "var(--color-neutral-700)", maxWidth: 680 }}>
      Definitions are written by Testpath to help you study. For the official wording, see the{" "}
      <a href="https://glossary.istqb.org" target="_blank" rel="noopener noreferrer">ISTQB Glossary</a>. ISTQB® is a registered trademark of the
      International Software Testing Qualifications Board; Testpath is not affiliated with it.
    </p>
  );
}
