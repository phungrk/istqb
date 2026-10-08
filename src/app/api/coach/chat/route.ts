import { z } from "zod";
import { coachChat } from "@/server/ai";
import { coachContext } from "@/server/coach-context";
import { requireTier } from "@/server/session";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "ai"]), text: z.string().max(4000) })).min(1).max(50),
});

export async function POST(req: Request) {
  const gate = await requireTier("pro");
  if ("error" in gate) return gate.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { weakText } = await coachContext(gate.user);
  return Response.json({ text: (await coachChat(parsed.data.messages, weakText)).trim() });
}
