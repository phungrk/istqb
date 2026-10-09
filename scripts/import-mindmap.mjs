// Rebuilds data/mindmap.json from the "Mindmap CTFL — nhớ bằng hình" artifact page.
//
// Usage: save the artifact page as <file>.html, then
//   node scripts/import-mindmap.mjs <file>.html .
//
// The page keeps its content in a `const CH = [...]` JSON literal (6 chapters → 36
// topics with content blocks) and the exam-favourite topics in `const STARRED`.
// Every string is sanitised (no scripts, event handlers or javascript: URLs), and the
// illustration colours are remapped onto the Organic palette.
import fs from "fs";
import path from "path";

const [file, repo] = process.argv.slice(2);
const html = fs.readFileSync(file, "utf8");

const start = html.indexOf("const CH = ") + "const CH = ".length;
const end = html.indexOf("\nconst BY", start);
const CH = JSON.parse(html.slice(start, end).trim().replace(/;$/, ""));
const starred = new Set(JSON.parse(html.match(/const STARRED = new Set\((\[[^\]]*\])\)/)[1].replace(/'/g, '"')));

// Illustration colours → Organic tokens' hex values.
const COLORS = { "#E8737D": "#ffc6a5", "#E8A33D": "#f6a06b", "#4FD1C5": "#ccdbb2", "#1E2230": "#201e1d" };

const clean = (s) =>
  String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/#(E8737D|E8A33D|4FD1C5|1E2230)\b/gi, (m) => COLORS[m.toUpperCase()] ?? m);
const deep = (x) => (typeof x === "string" ? clean(x) : Array.isArray(x) ? x.map(deep) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deep(v)])) : x);

const out = CH.map((c) => ({
  id: c.id,
  n: c.n,
  icon: c.icon,
  nick: c.title,
  topics: c.leaves.map((l) => deep({ id: l.id, icon: l.icon, label: l.label.replace(/\s*\n\s*/g, " "), starred: starred.has(l.id), hook: l.hook, trap: l.trap, body: l.body })),
}));

const ids = out.flatMap((c) => c.topics.map((t) => t.id));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate topic ids");
fs.writeFileSync(path.join(repo, "data", "mindmap.json"), JSON.stringify(out, null, 1));
console.log("chapters", out.length, "topics", ids.length, "starred", out.flatMap((c) => c.topics).filter((t) => t.starred).length);
