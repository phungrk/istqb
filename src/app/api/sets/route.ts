import { z } from "zod";
import { drawSet } from "@/server/bank";

const Spec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("chapter"), chapter: z.coerce.number().int().min(1).max(6), size: z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(40)])) }),
  z.object({ kind: z.literal("level"), size: z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(40)])) }),
]);

/** Draw a random practice set. Open to guests. */
export async function GET(req: Request) {
  const parsed = Spec.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Unknown set" }, { status: 400 });
  return Response.json(drawSet(parsed.data), { headers: { "Cache-Control": "no-store" } });
}
