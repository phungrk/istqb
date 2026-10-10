import "server-only";
import { htmlToText } from "@/lib/questions";
import { TOPICS } from "@/lib/syllabus";
import { BANK_BY_ID } from "./bank";
import { getStore, type UsageEvent } from "./store";

export type Flag = "wrong-key" | "neg-disc" | "too-hard" | "too-easy" | "dead-distractor";

export type QuestionStat = {
  id: string;
  chapter: number;
  lo: string | null;
  stem: string;
  options: string[];
  correct: number[];
  /** Responses (answered or left blank) in submitted tests. */
  n: number;
  /** Share answered correctly (classical difficulty index). */
  p: number;
  /** Point-biserial: does getting this right go with doing well on the rest of the test? Null with too little data. */
  r: number | null;
  /** How many responses picked each option. */
  picks: number[];
  blank: number;
  medianSec: number | null;
  flags: Flag[];
};

export type Insights = {
  days: number;
  since: string;
  events: number;
  tiles: { visitors: number; started: number; submitted: number; completion: number | null; signups: number; returning: number };
  funnel: { label: string; n: number }[];
  daily: { day: string; visitors: number; submitted: number }[];
  questions: QuestionStat[];
  topics: { id: string; label: string; opens: number; learned: number; loExpands: number }[];
};

type Item = { q: string; c: number[]; ms: number; ok: boolean };
type Submit = UsageEvent & { items: Item[]; correct: number };

// Minimum responses before a question can be flagged; below this the numbers are noise.
const MIN_N = 10;

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** Point-biserial correlation between a 0/1 item score and the rest-of-test score. */
function pointBiserial(pairs: [boolean, number][]): number | null {
  if (pairs.length < MIN_N) return null;
  const rest = pairs.map(([, r]) => r);
  const mean = rest.reduce((a, b) => a + b, 0) / rest.length;
  const sd = Math.sqrt(rest.reduce((a, b) => a + (b - mean) ** 2, 0) / rest.length);
  const right = pairs.filter(([ok]) => ok).map(([, r]) => r);
  const wrong = pairs.filter(([ok]) => !ok).map(([, r]) => r);
  if (!sd || !right.length || !wrong.length) return null;
  const m1 = right.reduce((a, b) => a + b, 0) / right.length;
  const m0 = wrong.reduce((a, b) => a + b, 0) / wrong.length;
  const p = right.length / pairs.length;
  return ((m1 - m0) / sd) * Math.sqrt(p * (1 - p));
}

export async function computeInsights(days: number): Promise<Insights> {
  const since = new Date(Date.now() - days * 864e5);
  const events = await (await getStore()).listEvents(since);

  const anonsOf = (t: string) => new Set(events.filter((e) => e.t === t).map((e) => e.anon));
  const visitors = new Set(events.map((e) => e.anon));
  const daysByAnon = new Map<string, Set<string>>();
  for (const e of events) (daysByAnon.get(e.anon) ?? daysByAnon.set(e.anon, new Set()).get(e.anon)!).add(e.ts.slice(0, 10));
  const returning = [...daysByAnon.values()].filter((d) => d.size >= 2).length;

  const submits = events.filter((e): e is Submit => e.t === "exam_submit" && Array.isArray(e.items));
  const started = events.filter((e) => e.t === "exam_start").length;

  // ── per question ──
  const acc = new Map<string, { picks: number[]; blank: number; ok: number; n: number; secs: number[]; pairs: [boolean, number][] }>();
  for (const s of submits) {
    const len = s.items.length;
    for (const it of s.items) {
      const q = BANK_BY_ID[it.q];
      if (!q) continue;
      const a = acc.get(it.q) ?? { picks: q.options.map(() => 0), blank: 0, ok: 0, n: 0, secs: [], pairs: [] };
      a.n++;
      if (it.ok) a.ok++;
      if (!it.c.length) a.blank++;
      for (const c of it.c) if (c < a.picks.length) a.picks[c]++;
      if (it.ms > 0) a.secs.push(it.ms / 1000);
      // Rest-of-test score leaves this item out, so the item doesn't correlate with itself.
      if (len >= 5) a.pairs.push([it.ok, (s.correct - (it.ok ? 1 : 0)) / (len - 1)]);
      acc.set(it.q, a);
    }
  }
  const questions: QuestionStat[] = [...acc].map(([id, a]) => {
    const q = BANK_BY_ID[id];
    const p = a.ok / a.n;
    const r = pointBiserial(a.pairs);
    const wrong = a.picks.map((n, i) => (q.answers.includes(i) ? -1 : n));
    const minRight = Math.min(...q.answers.map((i) => a.picks[i] ?? 0));
    const flags: Flag[] = [];
    if (a.n >= MIN_N && Math.max(...wrong) > minRight) flags.push("wrong-key");
    if (r !== null && r < 0 && a.n >= 15) flags.push("neg-disc");
    if (a.n >= MIN_N && p < 0.25) flags.push("too-hard");
    if (a.n >= 20 && p > 0.95) flags.push("too-easy");
    if (a.n >= 20 && wrong.some((n) => n === 0)) flags.push("dead-distractor");
    return {
      id,
      chapter: q.chapter,
      lo: q.lo ?? null,
      stem: htmlToText(q.stem).slice(0, 220),
      options: q.options.map((o) => htmlToText(o)),
      correct: q.answers,
      n: a.n,
      p,
      r,
      picks: a.picks,
      blank: a.blank,
      medianSec: median(a.secs),
      flags,
    };
  });
  const severity = (s: QuestionStat) => (s.flags.includes("wrong-key") ? 3 : 0) + (s.flags.includes("neg-disc") ? 2 : 0) + (s.flags.length ? 1 : 0);
  questions.sort((a, b) => severity(b) - severity(a) || b.n - a.n);

  // ── topics ──
  const count = (t: string, key: string, pred: (e: UsageEvent) => boolean = () => true) => {
    const m = new Map<string, number>();
    for (const e of events) if (e.t === t && pred(e)) m.set(e[key] as string, (m.get(e[key] as string) ?? 0) + 1);
    return m;
  };
  const opens = count("topic_open", "topic");
  const learned = count("topic_learned", "topic", (e) => e.learned === true);
  const los = count("lo_expand", "topic");
  const topics = Object.values(TOPICS)
    .map((t) => ({ id: t.id, label: `${t.icon} ${t.label}`, opens: opens.get(t.id) ?? 0, learned: learned.get(t.id) ?? 0, loExpands: los.get(t.id) ?? 0 }))
    .sort((a, b) => b.opens - a.opens);

  // ── daily (last 14 days of the window) ──
  const daily = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const today = events.filter((e) => e.ts.startsWith(day));
    return { day, visitors: new Set(today.map((e) => e.anon)).size, submitted: today.filter((e) => e.t === "exam_submit").length };
  }).reverse();

  return {
    days,
    since: since.toISOString(),
    events: events.length,
    tiles: {
      visitors: visitors.size,
      started,
      submitted: submits.length,
      completion: started ? submits.length / started : null,
      signups: events.filter((e) => e.t === "signup").length,
      returning,
    },
    funnel: [
      { label: "Visited", n: visitors.size },
      { label: "Opened a mindmap topic", n: anonsOf("topic_open").size },
      { label: "Started a test", n: anonsOf("exam_start").size },
      { label: "Finished a test", n: anonsOf("exam_submit").size },
      { label: "Created an account", n: anonsOf("signup").size },
      { label: "Came back another day", n: returning },
    ],
    daily,
    questions,
    topics,
  };
}
