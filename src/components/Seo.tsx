/** Structured data for search engines. `<` is escaped so a term can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Trademark note for the public SEO pages; `glossary` adds the pointer to the official wording. */
export function Disclaimer({ glossary }: { glossary?: boolean }) {
  return (
    <p style={{ margin: "24px 0 0", fontSize: "var(--fs-13)", color: "var(--color-neutral-700)", maxWidth: 680 }}>
      {glossary && (
        <>
          Definitions are written by Testpath to help you study. For the official wording, see the{" "}
          <a href="https://glossary.istqb.org" target="_blank" rel="noopener noreferrer">ISTQB Glossary</a>.{" "}
        </>
      )}
      ISTQB® is a registered trademark of the International Software Testing Qualifications Board; Testpath is an independent study tool and is not
      affiliated with it.
    </p>
  );
}
