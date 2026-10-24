// Adds one quiz written in Markdown (scripts/quiz-md/quizN.md + quizN.json) to the question bank.
//
// Usage: node scripts/import-quiz-md.mjs scripts/quiz-md/quiz6.json
//
// The Markdown is the "## Question #12 (1 Point) (2.1.6.I012)" format: stem, "**Selections:**",
// "- a) …" options, "**✅ Answer: c)**" and a "> " explanation. The JSON config gives the quiz
// number, the LO of every question (the Markdown tags are not always v4.0.1 numbering), and
// edits that put figures ({{img:file.png|alt}} from the config's folder) into stems.
// Re-running replaces this quiz's questions; one already in the bank under another quiz is kept
// there and only referenced. Questions numbered 1–40 form the Long test; A1, A2 … go to the bank only.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { formatQuestionHtml } from "./lib/line-breaks.mjs";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const cfgPath = path.resolve(process.argv[2] ?? "");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const dir = path.dirname(cfgPath);
const NN = String(cfg.n).padStart(2, "0");
const LETTERS = "abcde";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|\s)\*([^*\s][^*]*?)\*(?=[\s.,;:)]|$)/g, "$1<em>$2</em>");

/** Markdown lines → HTML: paragraphs, "- " lists, "1. " lists. */
function html(lines) {
  const out = [];
  let list = null;
  const close = () => { if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`); list = null; };
  let quote = null;
  const closeQuote = () => { if (quote) out.push(`<blockquote><p>${quote.map(inline).join("<br />")}</p></blockquote>`); quote = null; };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith(">")) { close(); (quote ??= []).push(line.replace(/^>\s?/, "")); continue; }
    closeQuote();
    const ul = line.match(/^[-*] (.*)$/);
    const ol = line.match(/^\d+\. (.*)$/);
    if (ul || ol) {
      const tag = ul ? "ul" : "ol";
      if (list?.tag !== tag) { close(); list = { tag, items: [] }; }
      list.items.push((ul ?? ol)[1]);
    } else {
      close();
      if (line) out.push(`<p>${inline(line)}</p>`);
    }
  }
  close();
  closeQuote();
  return formatQuestionHtml(out.join("\n"));
}

function image(file, alt) {
  const buf = fs.readFileSync(path.join(dir, file));
  const name = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 16) + path.extname(file);
  fs.writeFileSync(path.join(ROOT, "public", "q", name), buf);
  return `<p><img class="qimg" alt="Image - ${esc(alt)}" src="/q/${name}" loading="lazy" /></p>`;
}

function edit(text, edits = [], key) {
  for (const [find, put, how = "replace"] of edits) {
    if (!text.includes(find)) throw new Error(`Q${key}: edit target not found: ${find.slice(0, 60)}`);
    const rep = put.replace(/\{\{img:([^|}]+)\|([^}]*)\}\}/g, (_m, f, alt) => image(f, alt));
    text = text.replace(find, how === "before" ? rep + "\n" + find : how === "after" ? find + "\n" + rep : rep);
  }
  return text;
}

const md = fs.readFileSync(path.join(dir, cfg.md), "utf8");
const parsed = md.split(/^## Question #/m).slice(1).map((block) => {
  const [head, ...rest] = block.split("\n");
  const key = head.match(/^(\w+)/)[1];
  const body = rest.join("\n").replace(/\n---\s*$/, "");
  const [stemPart, after] = body.split("**Selections:**");
  if (after === undefined) throw new Error(`Q${key}: no Selections`);
  const options = [...after.matchAll(/^- ([a-e])\) (.*)$/gm)].map((m) => m[2].trim());
  const ans = after.match(/\*\*✅ Answer: ([a-e](?:\s*,\s*[a-e])*)\)/);
  if (!ans) throw new Error(`Q${key}: no answer`);
  const expl = after.split("\n").filter((l) => l.startsWith(">")).map((l) => l.replace(/^>\s?/, ""));
  const lo = cfg.lo[key];
  if (!lo) throw new Error(`Q${key}: no LO in config`);
  return {
    key,
    q: {
      id: `q${NN}-${key}`,
      chapter: Number(lo[0]),
      lo,
      src: `Quiz ${cfg.n} · ${/^\d/.test(key) ? "Q" : ""}${key}`,
      stem: edit(html(stemPart.split("\n")), cfg.edits?.[key], key),
      options: options.map(inline),
      answers: ans[1].split(/\s*,\s*/).map((l) => LETTERS.indexOf(l)),
      explanation: edit(html(expl), cfg.explanationEdits?.[key], key),
    },
  };
});

const bad = parsed.filter(({ q }) => q.options.length < 3 || q.answers.some((a) => a < 0 || a >= q.options.length));
if (bad.length) throw new Error("Bad questions: " + bad.map((x) => x.key).join(", "));

// Merge: drop this quiz's earlier import, then de-duplicate against the rest of the bank.
const bankPath = path.join(ROOT, "data", "questions.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")).filter((q) => !q.id.startsWith(`q${NN}-`));
const norm = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const dedupKey = (q) => norm(q.stem) + "|" + q.options.map(norm).sort().join("|");
const existing = new Map(bank.map((q) => [dedupKey(q), q.id]));
const added = [];
const ids = {};
for (const { key, q } of parsed) {
  const dup = existing.get(dedupKey(q));
  ids[key] = dup ?? q.id;
  if (!dup) { added.push(q); existing.set(dedupKey(q), q.id); }
}
fs.writeFileSync(bankPath, JSON.stringify([...bank, ...added], null, 1));

const longPath = path.join(ROOT, "data", "long-tests.json");
const longTests = JSON.parse(fs.readFileSync(longPath, "utf8")).filter((t) => t.n !== cfg.n);
const numbered = parsed.filter(({ key }) => /^\d+$/.test(key)).sort((a, b) => Number(a.key) - Number(b.key));
longTests.push({ n: cfg.n, title: `Quiz ${cfg.n}`, questions: numbered.map(({ key }) => ids[key]) });
longTests.sort((a, b) => a.n - b.n);
fs.writeFileSync(longPath, JSON.stringify(longTests, null, 1) + "\n");

const dups = parsed.filter(({ key, q }) => ids[key] !== q.id).map(({ key }) => `${key}→${ids[key]}`);
console.log(`Quiz ${cfg.n}: ${parsed.length} questions, ${added.length} new in the bank (${bank.length + added.length} total), long test ${numbered.length} questions.`);
if (dups.length) console.log(`Already in the bank: ${dups.join(", ")}`);
