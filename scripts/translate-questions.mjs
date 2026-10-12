#!/usr/bin/env node
/**
 * Translate the question bank (stem, options, explanation) into Vietnamese with the Message Batches API.
 * Output: data/questions-vi.json  { [id]: { stem, options, explanation } } — served next to the English text.
 *
 *   node scripts/translate-questions.mjs estimate          # token count + cost estimate (count_tokens, no generation)
 *   node scripts/translate-questions.mjs sample [n=3]      # translate n questions right away, print them for review
 *   node scripts/translate-questions.mjs submit [--all]    # send a batch for every untranslated question (--all: redo all)
 *   node scripts/translate-questions.mjs collect <batchId> # wait for the batch, validate, merge into questions-vi.json
 *
 * Needs ANTHROPIC_API_KEY (or an `ant auth login` profile). Re-running submit only sends what is still missing,
 * so a failed or rejected item is retried by running submit + collect again.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANK = path.join(ROOT, "data/questions.json");
const OUT = path.join(ROOT, "data/questions-vi.json");
const MODEL = "claude-opus-5-5";
// Batch prices are half the standard $4 / $20 per million tokens.
const PRICE = { input: 2 / 1e6, output: 10 / 1e6 };

const SYSTEM = `You translate ISTQB Certified Tester Foundation Level (CTFL v4.0.1) exam questions from English into Vietnamese for Vietnamese testers preparing for the exam.

Rules:
- Translate the stem, every option and the explanation. Keep the number and order of options exactly as given.
- Keep ISTQB technical terms in English, as Vietnamese testers use them at work and in the exam: test case, test basis, test condition, defect, failure, error, root cause, regression testing, confirmation testing, verification, validation, boundary value analysis, equivalence partitioning, decision table, state transition, coverage, statement coverage, branch coverage, review, walkthrough, inspection, test plan, exit criteria, entry criteria, product risk, project risk, user story, acceptance criteria, test level and test type names, SDLC, TDD, ATDD, BDD, DevOps, shift left, and similar glossary terms. Write the rest in natural, plain Vietnamese.
- Keep every HTML tag and attribute exactly as it is (including <img src="..."> and table markup); translate only the text between tags.
- Keep option letters and references such as "a)", "b) is correct", "Q12", "FL-4.2.2", numbers, values and code unchanged in meaning. Translate "is correct" / "is not correct" as "đúng" / "không đúng".
- Do not add, drop or soften any information, and do not change which answer is correct.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["stem", "options", "explanation"],
  properties: {
    stem: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    explanation: { type: "string" },
  },
};

const load = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);
const bank = load(BANK, []);
const client = new Anthropic();

const params = (q) => ({
  model: MODEL,
  max_tokens: 16000,
  output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
  system: SYSTEM,
  messages: [{ role: "user", content: JSON.stringify({ stem: q.stem, options: q.options, explanation: q.explanation }) }],
});

const tags = (s) => (s.match(/<\/?[a-z][^>]*>/gi) ?? []).map((t) => t.replace(/\s+alt="[^"]*"/i, "")).join("");
const imgs = (s) => (s.match(/<img[^>]*src="[^"]*"/gi) ?? []).map((t) => t.match(/src="[^"]*"/)[0]).join("|");

/** Reject anything that drifted structurally from the English: option count, images, markup. */
function check(q, vi) {
  const problems = [];
  if (!vi || typeof vi.stem !== "string" || !Array.isArray(vi.options) || typeof vi.explanation !== "string") return ["bad shape"];
  if (vi.options.length !== q.options.length) problems.push(`options ${vi.options.length}/${q.options.length}`);
  if (imgs(q.stem + q.explanation) !== imgs(vi.stem + vi.explanation)) problems.push("images changed");
  if (tags(q.stem) !== tags(vi.stem)) problems.push("stem markup changed");
  if (!vi.stem.trim() || vi.options.some((o) => !String(o).trim())) problems.push("empty text");
  return problems;
}

const textOf = (message) => message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");

async function estimate() {
  // count_tokens on a spread of questions, scaled to the whole bank. Output is assumed ~1.4x the English
  // content (Vietnamese runs longer in tokens) plus a margin for low-effort thinking.
  const step = Math.max(1, Math.floor(bank.length / 40));
  const sample = bank.filter((_, i) => i % step === 0);
  let input = 0;
  let content = 0;
  for (const q of sample) {
    const { input_tokens } = await client.messages.countTokens({ model: MODEL, system: SYSTEM, messages: params(q).messages });
    input += input_tokens;
    const { input_tokens: bare } = await client.messages.countTokens({ model: MODEL, messages: params(q).messages });
    content += bare;
  }
  const k = bank.length / sample.length;
  const inTok = input * k;
  const outTok = content * k * 1.4 * 1.3;
  console.log(`Questions: ${bank.length} (sampled ${sample.length})`);
  console.log(`Input  ≈ ${Math.round(inTok).toLocaleString()} tokens → $${(inTok * PRICE.input).toFixed(2)}`);
  console.log(`Output ≈ ${Math.round(outTok).toLocaleString()} tokens → $${(outTok * PRICE.output).toFixed(2)}`);
  console.log(`Total  ≈ $${(inTok * PRICE.input + outTok * PRICE.output).toFixed(2)} with the Batch API (${MODEL})`);
}

async function sample(n) {
  const done = load(OUT, {});
  for (const q of bank.filter((x) => !done[x.id]).slice(0, n)) {
    const res = await client.messages.create(params(q));
    if (res.stop_reason === "refusal") { console.log(`${q.id}: refused`); continue; }
    const vi = JSON.parse(textOf(res));
    console.log(`\n── ${q.id}  (in ${res.usage.input_tokens}, out ${res.usage.output_tokens} tokens)`, check(q, vi).join(", ") || "OK");
    console.log(JSON.stringify(vi, null, 2));
  }
}

async function submit(all) {
  const done = all ? {} : load(OUT, {});
  const todo = bank.filter((q) => !done[q.id]);
  if (!todo.length) return console.log("Everything is translated already.");
  const batch = await client.messages.batches.create({ requests: todo.map((q) => ({ custom_id: q.id, params: params(q) })) });
  console.log(`Submitted ${todo.length} questions. Batch ${batch.id} (${batch.processing_status}).`);
  console.log(`Next: node scripts/translate-questions.mjs collect ${batch.id}`);
}

async function collect(id) {
  let batch = await client.messages.batches.retrieve(id);
  while (batch.processing_status !== "ended") {
    console.log(`… ${batch.processing_status}: ${batch.request_counts.processing} processing, ${batch.request_counts.succeeded} done`);
    await new Promise((r) => setTimeout(r, 60_000));
    batch = await client.messages.batches.retrieve(id);
  }
  const byId = Object.fromEntries(bank.map((q) => [q.id, q]));
  const out = load(OUT, {});
  const rejected = [];
  let ok = 0;
  let usage = { input: 0, output: 0 };
  for await (const r of await client.messages.batches.results(id)) {
    const q = byId[r.custom_id];
    if (r.result.type !== "succeeded") { rejected.push(`${r.custom_id}: ${r.result.type}`); continue; }
    const m = r.result.message;
    usage.input += m.usage.input_tokens;
    usage.output += m.usage.output_tokens;
    if (m.stop_reason === "refusal") { rejected.push(`${r.custom_id}: refusal`); continue; }
    if (m.stop_reason === "max_tokens") { rejected.push(`${r.custom_id}: max_tokens`); continue; }
    let vi;
    try { vi = JSON.parse(textOf(m)); } catch { rejected.push(`${r.custom_id}: invalid JSON`); continue; }
    const problems = check(q, vi);
    if (problems.length) { rejected.push(`${r.custom_id}: ${problems.join(", ")}`); continue; }
    out[q.id] = { stem: vi.stem, options: vi.options, explanation: vi.explanation };
    ok++;
  }
  // Keep the file in bank order so diffs stay readable.
  const ordered = Object.fromEntries(bank.filter((q) => out[q.id]).map((q) => [q.id, out[q.id]]));
  fs.writeFileSync(OUT, JSON.stringify(ordered, null, 1) + "\n");
  console.log(`Saved ${ok} translations → ${path.relative(ROOT, OUT)} (${Object.keys(ordered).length}/${bank.length} total).`);
  console.log(`Tokens: in ${usage.input.toLocaleString()}, out ${usage.output.toLocaleString()} → $${(usage.input * PRICE.input + usage.output * PRICE.output).toFixed(2)}`);
  if (rejected.length) console.log(`Rejected ${rejected.length} (run submit + collect again to retry):\n  ${rejected.join("\n  ")}`);
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === "estimate") await estimate();
  else if (cmd === "sample") await sample(Number(arg ?? 3));
  else if (cmd === "submit") await submit(arg === "--all");
  else if (cmd === "collect" && arg) await collect(arg);
  else console.log("Usage: node scripts/translate-questions.mjs estimate | sample [n] | submit [--all] | collect <batchId>");
} catch (err) {
  if (err instanceof Anthropic.AuthenticationError) console.error("No valid API key: set ANTHROPIC_API_KEY.");
  else if (err instanceof Anthropic.RateLimitError) console.error("Rate limited, try again in a minute.");
  else if (err instanceof Anthropic.APIError) console.error(`API error ${err.status}: ${err.message}`);
  else if (/authentication method/.test(String(err?.message))) console.error("No credentials: set ANTHROPIC_API_KEY (or run `ant auth login`).");
  else throw err;
  process.exitCode = 1;
}
