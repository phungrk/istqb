import syllabusLo from "@data/syllabus-lo.json";

type Lo = { lo: string; statement: string; section: string; excerpt: { t: string; html: string }[] };

const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** LO → plain-text syllabus statement and excerpt, the grounding for the on-device "Explain my mistake". */
const BY_LO = new Map<string, { statement: string; section: string; excerpt: string }>();
for (const los of Object.values(syllabusLo as Record<string, Lo[]>))
  for (const l of los)
    if (!BY_LO.has(l.lo))
      BY_LO.set(l.lo, { statement: l.statement, section: l.section, excerpt: l.excerpt.map((e) => (e.t === "li" ? "- " : "") + text(e.html)).join("\n") });

export function GET(req: Request) {
  const lo = new URL(req.url).searchParams.get("lo") ?? "";
  const hit = BY_LO.get(lo);
  if (!hit) return Response.json({ error: "Unknown LO" }, { status: 404 });
  return Response.json({ lo, ...hit }, { headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}
