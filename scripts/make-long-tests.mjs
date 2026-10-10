// Writes a placeholder data/long-tests.json: N fixed 40-question Long tests in the exam's
// chapter weighting (8/6/4/11/9/2), drawn so the tests share as few questions as possible.
// Replace the file with the admin's own lists when they're ready: [{ "n": 1, "questions": ["q08-1", …] }, …]
//
// Usage: node scripts/make-long-tests.mjs [count=6] [repo-dir=.]
import fs from "fs";
import path from "path";

const [count = "6", repo = "."] = process.argv.slice(2);
const bank = JSON.parse(fs.readFileSync(path.join(repo, "data/questions.json"), "utf8"));
const WEIGHTS = { 1: 8, 2: 6, 3: 4, 4: 11, 5: 9, 6: 2 };
// Deterministic shuffle (FNV-1a of a salted id), different from the Short/Medium order.
const h = (s) => [...s].reduce((x, c) => Math.imul(x ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
const pools = Object.fromEntries(Object.keys(WEIGHTS).map((ch) => [ch, bank.filter((q) => q.chapter === +ch).sort((a, b) => h("long:" + a.id) - h("long:" + b.id))]));
const tests = Array.from({ length: +count }, (_, t) => ({
  n: t + 1,
  questions: Object.entries(WEIGHTS).flatMap(([ch, k]) => Array.from({ length: k }, (_, j) => pools[ch][(t * k + j) % pools[ch].length].id)),
}));
fs.writeFileSync(path.join(repo, "data/long-tests.json"), JSON.stringify(tests, null, 1) + "\n");
console.log(`Wrote ${tests.length} Long tests × 40 questions.`);
