import type { Topic, TopicBlock } from "@/lib/syllabus";

/** Syllabus learning objective with the sentences that carry this topic's keywords (built by scripts/import-syllabus.py). */
export type LoExcerpt = { lo: string; k: string; statement: string; section: string; keywords: string[]; excerpt: { t: "p" | "li"; html: string }[] };

/*
 * Renders a mindmap topic. The blocks mirror the source artifact's renderer: most
 * strings may carry inline HTML (sanitised at import by scripts/import-mindmap.mjs),
 * work-product cells are escaped.
 */
const E = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
type Row = [string, string, string?];

function blockHtml(b: TopicBlock): string {
  const items = (b.items ?? []) as unknown[];
  switch (b.k) {
    case "svg":
      return `<div class="b-svg">${b.t}${b.cap ? `<p class="cap">${b.cap}</p>` : ""}</div>`;
    case "kw":
      return `<div class="b-kwwrap"><div class="b-label">Key terms</div><div class="b-kw">${items.map((s) => `<span class="kwc">${s}</span>`).join("")}</div></div>`;
    case "p":
      return `<p class="b-p">${b.t}</p>`;
    case "f":
      return `<div class="b-f">${b.t}</div>`;
    case "flow":
      return `<div class="b-flow">${items.map((s) => `<span class="fc">${s}</span>`).join('<span class="fa">→</span>')}</div>`;
    case "rows":
      return `<ul class="b-rows">${(items as Row[]).map((r) => `<li><span class="ri">${r[0]}</span><span><b>${r[1]}</b>${r[2] ? `<br><span class="rd">${r[2]}</span>` : ""}</span></li>`).join("")}</ul>`;
    case "grid":
      return `<div class="b-grid">${(items as Row[]).map((r) => `<div class="gc"><div class="gi">${r[0]}</div><div class="gt">${r[1]}</div><div class="gd">${r[2]}</div></div>`).join("")}</div>`;
    case "vs":
      return `<div class="b-vs">${[b.a, b.b].map((v) => { const r = v as Row; return `<div class="vc"><div class="vi">${r[0]}</div><div class="vt">${r[1]}</div>${r[2]}</div>`; }).join("")}</div>`;
    case "wp": {
      let inner = "";
      if (b.doc) inner = `<div class="wp-doc">${(b.doc as Row[]).map((r) => `<div class="wp-r"><div class="wp-l">${E(r[0])}</div><div class="wp-v">${E(r[1])}</div></div>`).join("")}</div>`;
      else if (b.head) {
        const td = (tag: string, c: unknown) => `<${tag}${String(c).length <= 12 ? ' class="nw"' : ""}>${E(c)}</${tag}>`;
        inner = `<div class="wp-scroll"><table class="wp-t"><thead><tr>${(b.head as unknown[]).map((h) => td("th", h)).join("")}</tr></thead><tbody>${(b.rows as unknown[][]).map((r) => `<tr>${r.map((c) => td("td", c)).join("")}</tr>`).join("")}</tbody></table></div>`;
      } else if (b.code) inner = `<pre class="wp-c">${E(b.code)}</pre>`;
      return `<div class="b-wp"><div class="b-label">Sample work product · ${E(b.name)}</div>${inner}${b.note ? `<p class="wp-n">${E(b.note)}</p>` : ""}</div>`;
    }
    case "sample":
      return `<div class="b-sample"><div class="b-label">Sample question · LO ${b.lo}</div><div class="b-sq">${b.q}</div><div class="b-so">${(b.o as string[]).map((t, i) => `<div><b>${"abcd"[i]})</b> ${t}</div>`).join("")}</div><details class="b-sa"><summary>Show answer</summary><p><b>Answer: ${b.a})</b> ${b.why}</p></details></div>`;
    default:
      return "";
  }
}

/** LO statements and excerpts are escaped syllabus text with <mark> added by the import script. */
function syllabusHtml(los: LoExcerpt[]): string {
  if (!los.length) return "";
  const lo = (e: LoExcerpt, i: number) => {
    let body = "";
    let list: string[] = [];
    const flush = () => { if (list.length) body += `<ul>${list.join("")}</ul>`; list = []; };
    for (const x of e.excerpt) {
      if (x.t === "li") list.push(`<li>${x.html}</li>`);
      else { flush(); body += `<p>${x.html}</p>`; }
    }
    flush();
    return `<details class="lo"${i === 0 ? " open" : ""}><summary><span class="lo-id">FL-${e.lo}</span><span class="lo-k">${e.k}</span><span class="lo-st">${e.statement}</span></summary><div class="lo-body"><div class="lo-sec">Syllabus ${E(e.section)}</div>${body}</div></details>`;
  };
  return `<div class="b-syl"><div class="b-label">📘 Syllabus · learning objectives</div>${los.map(lo).join("")}<p class="lo-src">Quoted from the ISTQB® CTFL Syllabus v4.0.1. Highlighted: this topic's keywords.</p></div>`;
}

export function TopicView({ topic, color, ink, los = [] }: { topic: Topic; color: string; ink: string; los?: LoExcerpt[] }) {
  // The syllabus block goes right after the first key-terms block.
  const kwAt = topic.body.findIndex((b) => b.k === "kw");
  const blocks = topic.body.map(blockHtml);
  blocks.splice(kwAt + 1, 0, syllabusHtml(los));
  const html =
    `<div class="hook"><span class="lbl">Remember it as</span><p>${topic.hook}</p></div>` +
    blocks.join("") +
    (topic.trap ? `<div class="trap"><span class="lbl">🪤 Exam trap</span><p>${topic.trap}</p></div>` : "");
  return <div className="topic" style={{ "--c": color, "--c-ink": ink } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: html }} />;
}
