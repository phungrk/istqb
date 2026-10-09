import { z } from "zod";
import { score, type Answers } from "@/lib/questions";
import { BANK_BY_ID } from "@/server/bank";
import { getStore } from "@/server/store";
import { requireTier } from "@/server/session";

export async function GET() {
  const gate = await requireTier("member");
  if ("error" in gate) return gate.error;
  return Response.json({ attempts: await (await getStore()).listAttempts(gate.user.id) });
}

const Body = z.object({
  title: z.string().max(200),
  setKey: z.string().max(40),
  mode: z.enum(["practice", "mock"]),
  durationSec: z.number().int().min(0).max(24 * 3600),
  questions: z
    .array(
      z.object({
        id: z.string(),
        chapter: z.number().int().min(1).max(6),
        answers: z.array(z.number().int().min(0).max(4)).min(1).max(5),
        source: z.enum(["bank", "ai"]).optional(),
      }),
    )
    .min(1)
    .max(200),
  answers: z.record(z.string(), z.array(z.number().int().min(0).max(4)).max(5)),
});

/** Save an attempt. Bank questions are re-scored against the server's answer key. */
export async function POST(req: Request) {
  const gate = await requireTier("member");
  if ("error" in gate) return gate.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid attempt" }, { status: 400 });
  const b = parsed.data;
  const qs = b.questions.map((q) => {
    const bank = q.source !== "ai" ? BANK_BY_ID[q.id] : undefined;
    return { ...q, chapter: bank?.chapter ?? q.chapter, answers: bank?.answers ?? q.answers };
  });
  const answers: Answers = Object.fromEntries(Object.entries(b.answers).map(([k, v]) => [Number(k), v]));
  const s = score(qs, answers);
  const attempt = await (await getStore()).addAttempt(gate.user.id, {
    title: b.title,
    setKey: b.setKey,
    mode: b.mode,
    durationSec: b.durationSec,
    correct: s.correct,
    total: s.total,
    perChapter: s.perChapter,
    answers: qs.flatMap((q, i) => (BANK_BY_ID[q.id] ? [{ questionId: q.id, chosen: answers[i] ?? [] }] : [])),
  });
  return Response.json({ attempt });
}
