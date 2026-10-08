import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { config } from "./config";

const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

/**
 * One Claude call. Returns null when AI is not configured or the call fails,
 * so every caller has a canned fallback (same behaviour as the prototype).
 */
async function complete(
  system: string,
  messages: Anthropic.Beta.BetaMessageParam[],
  format?: Anthropic.Beta.BetaJSONOutputFormat,
): Promise<string | null> {
  if (config.ai !== "live") return null;
  try {
    const res = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", ...(format ? { format } : {}) },
      system,
      messages,
    });
    if (res.stop_reason === "refusal") return null;
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    return text || null;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn("[ai] rate limited");
    else if (err instanceof Anthropic.APIError) console.error(`[ai] API error ${err.status}:`, err.message);
    else console.error("[ai] request failed:", err);
    return null;
  }
}

export type ChatTurn = { role: "user" | "ai"; text: string };

export async function coachChat(history: ChatTurn[], weakText: string): Promise<string> {
  // Last 8 messages, and the conversation must start with the learner.
  let recent = history.slice(-8);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  const r = await complete(
    `You are a friendly, precise ISTQB CTFL v4.0.1 exam coach. Answer in plain text, no markdown, under 140 words. Refer to syllabus sections when useful. The learner's weakest chapters: ${weakText}.`,
    recent.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
  );
  return r ?? "I could not reach the AI service just now. In short: check the syllabus section for this topic in the mindmap, then try the question again.";
}

export async function studyPlan(masteryTable: string, fallback: string): Promise<string> {
  const r = await complete(
    "You are an ISTQB CTFL v4.0.1 coach.",
    [
      {
        role: "user",
        content: `Build a 7-day study plan for this learner. Plain text, no markdown symbols. One line per day, starting "Day 1 —". Each line: what to study (syllabus sections) and one practice action. Weight time towards weak chapters and chapters with many exam questions.\n\nMastery:\n${masteryTable}`,
      },
    ],
  );
  return r ?? fallback;
}

const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        q: z.string().min(1),
        o: z.array(z.string().min(1)).length(4),
        a: z.number().int().min(0).max(3),
        e: z.string(),
      }),
    )
    .min(1),
});

export type AiQuestion = z.infer<typeof QuizSchema>["questions"][number];

export async function generateQuiz(chapter: number, title: string): Promise<AiQuestion[] | null> {
  const r = await complete(
    "You write ISTQB CTFL v4.0.1 exam-style multiple-choice questions.",
    [
      {
        role: "user",
        content: `Write 5 new exam-style questions on Chapter ${chapter} "${title}". Each item: "q" the question, "o" exactly 4 options, "a" the index 0-3 of the single correct option, "e" a one or two sentence explanation.`,
      },
    ],
    {
      type: "json_schema",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["questions"],
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["q", "o", "a", "e"],
              properties: {
                q: { type: "string" },
                o: { type: "array", items: { type: "string" } },
                a: { type: "integer" },
                e: { type: "string" },
              },
            },
          },
        },
      },
    },
  );
  if (!r) return null;
  try {
    const parsed = QuizSchema.safeParse(JSON.parse(r));
    return parsed.success ? parsed.data.questions : null;
  } catch {
    return null;
  }
}
