// Rebuilds data/questions.json and public/q/* from the "Quiz 1–25 – ISTQB CTFL" artifact pages.
//
// Usage: save each quiz page as <dir>/qNN/index.html (q01…q05, q08…q25), then
//   npx -p playwright node scripts/import-quizzes.mjs <dir> .
//
// Quiz 1–5 store figures as small render functions, so those pages are opened in
// headless Chromium to capture the tables/diagrams. Quiz 8–25 embed a JSON QUIZ
// object with HTML stems; their base64 images are written to public/q/.
// HTML is sanitised (no scripts, event handlers or javascript: URLs) and the same
// question appearing in several quizzes is kept once.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { chromium } from "playwright";

const [QDIR, REPO] = process.argv.slice(2);
const IMG_DIR = path.join(REPO, "public", "q");
fs.rmSync(IMG_DIR, { recursive: true, force: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*\*/g, "");
const LETTERS = "abcde";

function sanitize(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    // Authoring notes under rebuilt figures ("Dựng lại từ đáp án…") are not for learners.
    .replace(/<div class="cap">[\s\S]*?<\/div>/g, "")
    .replace(/src="(data:image\/([a-z+]+);base64,([^"]+))"/gi, (_m, _all, type, b64) => {
      const buf = Buffer.from(b64, "base64");
      const ext = type === "svg+xml" ? "svg" : type === "jpeg" ? "jpg" : type;
      const name = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 16) + "." + ext;
      fs.writeFileSync(path.join(IMG_DIR, name), buf);
      return `src="/q/${name}" loading="lazy"`;
    })
    .trim();
}

const out = [];

// Quiz 8–25: JSON with HTML stems.
for (let n = 8; n <= 25; n++) {
  const s = fs.readFileSync(path.join(QDIR, `q${String(n).padStart(2, "0")}`, "index.html"), "utf8");
  const i = s.indexOf("const QUIZ = ") + "const QUIZ = ".length;
  const end = s.indexOf("\nconst ", i);
  const quiz = JSON.parse(s.slice(i, end).trim().replace(/;$/, ""));
  for (const q of quiz.questions) {
    if (q.missing) continue; // figure lost in the source
    out.push({
      id: `q${String(n).padStart(2, "0")}-${q.n}`,
      chapter: Number(q.ch || q.lo[0]),
      lo: q.lo.split(".").slice(0, 3).join("."),
      src: `Quiz ${n} · Q${q.n}`,
      stem: sanitize(q.stem),
      options: q.opts.map((o) => sanitize(o[1])),
      answers: q.correct.map((l) => LETTERS.indexOf(l)),
      explanation: sanitize(q.expl),
    });
  }
}

// Quiz 1–5: structured body + figure functions, rendered in a browser.
const browser = await chromium.launch();
for (let n = 1; n <= 5; n++) {
  const page = await browser.newPage();
  await page.route(/^(?!file:)/, (r) => r.abort());
  await page.goto("file://" + path.join(QDIR, `q0${n}`, "index.html"));
  const qs = await page.evaluate(() =>
    // eslint-disable-next-line no-undef
    Q.map((q) => ({ lo: q.lo, a: q.a, o: q.o, x: q.x, parts: q.b.map((b) => (typeof b === "string" ? { p: b } : Array.isArray(b) ? { l: b } : { f: F[b.f]() })) })),
  );
  qs.forEach((q, k) => {
    const stem = q.parts
      .map((p) => (p.p !== undefined ? `<p>${md(p.p)}</p>` : p.l ? `<ul>${p.l.map((x) => `<li>${md(x)}</li>`).join("")}</ul>` : `<div class="fig">${p.f}</div>`))
      .join("\n");
    out.push({
      id: `q0${n}-${k + 1}`,
      chapter: Number(q.lo[0]),
      lo: q.lo,
      src: `Quiz ${n} · Q${k + 1}`,
      stem: sanitize(stem),
      options: q.o.map(esc),
      answers: Array.isArray(q.a) ? q.a : [q.a],
      explanation: `<p>${md(q.x)}</p>`,
    });
  });
  await page.close();
}
await browser.close();

// De-duplicate: the same sample-exam question appears in several quizzes.
const norm = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const seen = new Set();
const uniq = out.filter((q) => {
  const k = norm(q.stem).slice(0, 400) + "|" + q.options.map(norm).sort().join("|");
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
const bad = uniq.filter((q) => !(q.chapter >= 1 && q.chapter <= 6) || !q.answers.length || q.answers.some((a) => a < 0 || a >= q.options.length));
if (bad.length) throw new Error("Bad questions: " + bad.map((q) => q.id).join(", "));

fs.writeFileSync(path.join(REPO, "data", "questions.json"), JSON.stringify(uniq, null, 1));
const per = {};
uniq.forEach((q) => (per[q.chapter] = (per[q.chapter] || 0) + 1));
console.log("total", out.length, "unique", uniq.length, "per chapter", per, "images", fs.readdirSync(IMG_DIR).length);
