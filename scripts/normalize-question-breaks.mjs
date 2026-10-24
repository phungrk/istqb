// Gives every enumerated item in the question bank its own line (see scripts/lib/line-breaks.mjs).
//
//   node scripts/normalize-question-breaks.mjs          # rewrite data/questions.json and data/questions-vi.json
//   node scripts/normalize-question-breaks.mjs --check  # only report; exit 1 if anything would change
//
// Idempotent. New quizzes get the same treatment from scripts/import-quiz-md.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatQuestionHtml } from "./lib/line-breaks.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const files = ["data/questions.json", "data/questions-vi.json"];

let changed = 0;
for (const f of files) {
  const file = path.join(ROOT, f);
  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  const rows = Array.isArray(data) ? data : Object.entries(data).map(([id, v]) => ({ id, ...v, __v: v }));
  const touched = new Set();
  const fix = (obj, key, id) => {
    const next = Array.isArray(obj[key]) ? obj[key].map(formatQuestionHtml) : formatQuestionHtml(obj[key]);
    if (JSON.stringify(next) !== JSON.stringify(obj[key])) { obj[key] = next; touched.add(id); }
  };
  for (const row of rows) {
    const target = row.__v ?? row;
    for (const key of ["stem", "options", "explanation"]) fix(target, key, row.id);
  }
  changed += touched.size;
  console.log(`${f}: ${touched.size} question(s) reformatted`);
  if (!check && touched.size) fs.writeFileSync(file, JSON.stringify(data, null, 1) + (Array.isArray(data) ? "" : "\n"));
}
if (check && changed) process.exit(1);
