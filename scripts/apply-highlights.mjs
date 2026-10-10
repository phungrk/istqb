// Re-applies the <mark> highlights in data/syllabus-lo.json from data/lo-highlights.json.
//
// Usage: node scripts/apply-highlights.mjs [repo-dir]   (run after scripts/import-syllabus.py)
//
// data/lo-highlights.json lists, per mindmap topic, the phrases to highlight in that topic's
// syllabus excerpts. Each phrase is quoted verbatim from the excerpt, carries a verb, and is
// derived from the topic's own Key terms chips: the wording that decides an exam answer
// ("Reducing the risk level…"), not bare nouns ("test objectives"). Every phrase must match
// somewhere in its topic, or the script fails so a typo can't silently drop a highlight.
import fs from "fs";
import path from "path";

const repo = process.argv[2] ?? ".";
const loFile = path.join(repo, "data/syllabus-lo.json");
const LO = JSON.parse(fs.readFileSync(loFile, "utf8"));
const HL = JSON.parse(fs.readFileSync(path.join(repo, "data/lo-highlights.json"), "utf8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unmark = (h) => h.replace(/<\/?mark>/g, "");

let missing = 0;
for (const [topic, los] of Object.entries(LO)) {
  // Longest first, so a phrase wins over a shorter one it contains.
  const phrases = [...(HL[topic] ?? [])].sort((a, b) => b.length - a.length);
  const re = phrases.length ? new RegExp(phrases.map((p) => reEsc(esc(p))).join("|"), "gi") : null;
  const hits = new Set();
  const mark = (h) => (re ? unmark(h).replace(re, (m) => (hits.add(m.toLowerCase()), `<mark>${m}</mark>`)) : unmark(h));
  for (const lo of los) {
    lo.statement = mark(lo.statement);
    for (const e of lo.excerpt) e.html = mark(e.html);
  }
  for (const p of phrases)
    if (!hits.has(esc(p).toLowerCase())) {
      console.error(`✗ ${topic}: no match for "${p}"`);
      missing++;
    }
}
for (const t of Object.keys(HL)) if (!LO[t]) console.error(`✗ unknown topic ${t}`), missing++;
if (missing) process.exit(1);

fs.writeFileSync(loFile, JSON.stringify(LO, null, 1) + "\n");
const n = Object.values(HL).reduce((s, l) => s + l.length, 0);
console.log(`Highlighted ${n} phrases across ${Object.keys(HL).length} topics.`);
