import { z } from "zod";
import { NODE } from "@/lib/syllabus";
import { getStore } from "@/server/store";
import { requireTier } from "@/server/session";

const Body = z.object({ nodeId: z.string(), learned: z.boolean() });

export async function POST(req: Request) {
  const gate = await requireTier("member");
  if ("error" in gate) return gate.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !NODE[parsed.data.nodeId]) return Response.json({ error: "Invalid topic" }, { status: 400 });
  await (await getStore()).setLearned(gate.user.id, parsed.data.nodeId, parsed.data.learned);
  return Response.json({ ok: true });
}
