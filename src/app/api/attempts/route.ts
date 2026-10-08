import { z } from "zod";
import { BANK_BY_ID, score, type Question } from "@/lib/questions";
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
        answerIndex: z.number().int().min(0).max(3),
        source: z.enum(["bank", "ai"]).optional(),
      }),
    )
    .min(1)
    .max(200),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
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
    return { ...q, chapter: bank?.chapter ?? q.chapter, answerIndex: bank?.answerIndex ?? q.answerIndex } as Question;
  });
  const answers: Record<number, number> = Object.fromEntries(Object.entries(b.answers).map(([k, v]) => [Number(k), v]));
  const s = score(qs, answers);
  const attempt = await (await getStore()).addAttempt(gate.user.id, {
    title: b.title,
    setKey: b.setKey,
    mode: b.mode,
    durationSec: b.durationSec,
    correct: s.correct,
    total: s.total,
    perChapter: s.perChapter,
    answers: qs.filter((q) => BANK_BY_ID[q.id]).map((q) => ({ questionId: q.id, chosenIndex: answers[qs.indexOf(q)] ?? null })),
  });
  return Response.json({ attempt });
}
