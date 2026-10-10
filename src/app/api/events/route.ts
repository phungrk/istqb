import { z } from "zod";
import { isCorrect } from "@/lib/questions";
import { BANK_BY_ID } from "@/server/bank";
import { getStore, type UsageEvent } from "@/server/store";
import { sessionUserId } from "@/server/session";

const id = z.string().max(64);
const Ev = z.discriminatedUnion("t", [
  z.object({ t: z.literal("page_view"), path: z.string().max(200) }),
  z.object({ t: z.literal("topic_open"), topic: id }),
  z.object({ t: z.literal("topic_learned"), topic: id, learned: z.boolean() }),
  z.object({ t: z.literal("lo_expand"), topic: id, lo: id }),
  z.object({ t: z.literal("exam_start"), set: id, mode: z.enum(["practice", "mock"]), n: z.number().int().min(1).max(200) }),
  z.object({
    t: z.literal("exam_submit"),
    set: id,
    mode: z.enum(["practice", "mock"]),
    sec: z.number().int().min(0).max(24 * 3600),
    // One entry per question: id, chosen option indexes, milliseconds spent on it.
    items: z.array(z.object({ q: id, c: z.array(z.number().int().min(0).max(4)).max(5), ms: z.number().int().min(0).max(36e5) })).min(1).max(200),
  }),
  z.object({ t: z.literal("exam_abandon"), set: id, at: z.number().int().min(0).max(200), answered: z.number().int().min(0).max(200), n: z.number().int().min(1).max(200) }),
  z.object({ t: z.literal("signup") }),
  z.object({ t: z.literal("login") }),
]);
const Body = z.object({
  anon: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/),
  events: z.array(z.intersection(Ev, z.object({ ago: z.number().int().min(0).max(864e5).optional() }))).min(1).max(50),
});

/**
 * Anonymous usage events from src/lib/track.ts. Server time is authoritative; exam
 * submissions are re-scored against the answer key here, so the client can't skew item stats.
 */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 64_000) return new Response(null, { status: 413 });
  const parsed = Body.safeParse((() => { try { return JSON.parse(text); } catch { return null; } })());
  if (!parsed.success) return new Response(null, { status: 400 });

  const now = Date.now();
  const uid = await sessionUserId();
  const events: UsageEvent[] = parsed.data.events.map(({ ago, ...e }) => {
    const base = { ts: new Date(now - (ago ?? 0)).toISOString(), anon: parsed.data.anon, ...(uid ? { uid } : {}) };
    if (e.t !== "exam_submit") return { ...base, ...e };
    // Only bank questions are scored and kept; AI-written ones have no stable id.
    const items = e.items.flatMap((it) => {
      const q = BANK_BY_ID[it.q];
      return q ? [{ ...it, ok: isCorrect(q, it.c) }] : [];
    });
    return { ...base, ...e, items, correct: items.filter((i) => i.ok).length };
  });
  await (await getStore()).addEvents(events);
  return new Response(null, { status: 204 });
}
