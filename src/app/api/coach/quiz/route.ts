import { z } from "zod";
import { escapeHtml, type Question } from "@/lib/questions";
import { sampleChapter } from "@/server/bank";
import { CHAPTERS } from "@/lib/syllabus";
import { generateQuiz } from "@/server/ai";
import { requireTier } from "@/server/session";

const Body = z.object({ chapter: z.number().int().min(1).max(6) });

/** Five new questions for a chapter, or five bank questions from it if generation fails. */
export async function POST(req: Request) {
  const gate = await requireTier("pro");
  if ("error" in gate) return gate.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid chapter" }, { status: 400 });
  const ch = CHAPTERS[parsed.data.chapter - 1];
  const ai = await generateQuiz(ch.id, ch.title);
  const stamp = Date.now().toString(36);
  const questions: Question[] = ai
    ? ai.map((x, i) => ({
        id: `ai-${stamp}-${i}`,
        chapter: ch.id,
        stem: `<p>${escapeHtml(x.q)}</p>`,
        options: x.o.map(escapeHtml),
        answers: [x.a],
        explanation: `<p>${escapeHtml(x.e)}</p>`,
        source: "ai",
      }))
    : sampleChapter(ch.id, 5);
  return Response.json({ questions, generated: !!ai });
}
