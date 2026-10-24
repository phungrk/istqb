// Line breaks for question HTML.
//
// The quiz sources keep their layout (i./ii./iii., A./B./C., AC1/AC2, "Steps to Reproduce", log lines)
// as raw newlines inside a <p>, or as " - " joined bullets in Quiz 1–5 explanations. Browsers collapse
// both, so every item ran into one line. These helpers turn them into <br /> so each item gets its own line.
// Safe to run twice: a break that is already a <br /> is left alone.

const IMG_END = /<img[^>]*>\s*$/;
const IMG_START = /^\s*<img/;

/** Raw newlines inside a <p> → <br /> (not next to a block-level <img>, which already sits on its own line). */
export function breakLines(html) {
  return html.replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/g, (whole, attrs = "", inner) => {
    const lines = inner.trim().split(/\n+/);
    if (lines.length < 2) return whole;
    let out = lines[0].trimEnd();
    for (let i = 1; i < lines.length; i++) {
      const prev = out;
      const cur = lines[i].trim();
      const sep = IMG_END.test(prev) || IMG_START.test(cur) || /<br\s*\/?>$/.test(prev) ? "\n" : "<br />\n";
      out += sep + cur;
    }
    return `<p${attrs}>${out}</p>`;
  });
}

// An item of an enumeration: "(i.)", "ii.", "A.", "AC3:", "1D (", "2.", "b) is not correct" / "b) không đúng", "Moderator – B."
const ITEM = String.raw`(?:\((?:i{1,3}|iv|v|vi{1,3})\.\)|(?:i{1,3}|iv|v|vi{1,3})\.|[A-F]\.|AC\d+:|\d[A-E]\s\(|\d\.|[a-e]\)\s(?:(?:is|are)\s|(?:không\s)?đúng)|(?:Moderator|Review Leader|Manager|Scribe|Facilitator|Author|Reviewer)\s–\s[A-F]\.)`;
const DASH_ITEM = new RegExp(String.raw`\s-\s(?=${ITEM})`, "g");

/**
 * Quiz 1–5 explanations: "a) is correct. - i. foo - ii. bar - iii. baz" → one item per line.
 * Only touches a paragraph with at least two " - " that are followed by an enumerator, so a dash in prose stays.
 */
export function splitDashItems(html) {
  return html.replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/g, (whole, attrs = "", inner) => {
    const hits = inner.match(DASH_ITEM);
    if (!hits || hits.length < 2) return whole;
    return `<p${attrs}>${inner.replace(DASH_ITEM, "<br />\n")}</p>`;
  });
}

const MARKED_LINE = /^(?:\(?(?:i{1,3}|iv|v|vi{1,3})\.\)?|[A-F]\.|AC\d+:)\s/;

/** In an enumerated line, a run of spaces before a new sentence is where the source broke the line (a closing remark after the last item). */
export function splitClosingRemark(html) {
  return html
    .split("\n")
    .map((line) => (MARKED_LINE.test(line) ? line.replace(/(?<=\S) {2,}(?=\p{Lu})/gu, "<br />\n") : line))
    .join("\n");
}

/** Everything above, for any stem, option or explanation. */
export const formatQuestionHtml = (html) => splitClosingRemark(breakLines(splitDashItems(html)));
