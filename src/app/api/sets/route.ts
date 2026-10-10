import { z } from "zod";
import { drawSet, levelCounts } from "@/server/bank";
import { requireTier } from "@/server/session";

const size = z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(40)]));
const Spec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("chapter"), chapter: z.coerce.number().int().min(1).max(6), size }),
  z.object({ kind: z.literal("level"), size }),
  z.object({ kind: z.literal("numbered"), size: z.coerce.number().pipe(z.union([z.literal(10), z.literal(20)])), n: z.coerce.number().int().min(1) }),
  z.object({ kind: z.literal("long"), n: z.coerce.number().int().min(1) }),
]);

/**
 * Draw a practice set. Guests get the three random level tests and Short chapter tests;
 * numbered level tests, Long tests and Medium/Long chapter tests are for members.
 */
export async function GET(req: Request) {
  const parsed = Spec.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Unknown set" }, { status: 400 });
  const spec = parsed.data;

  const membersOnly = spec.kind === "numbered" || spec.kind === "long" || (spec.kind === "chapter" && spec.size > 10);
  if (membersOnly) {
    const gate = await requireTier("member");
    if ("error" in gate) return gate.error;
  }
  const counts = levelCounts();
  const max = spec.kind === "long" ? counts.long : spec.kind === "numbered" ? (spec.size === 10 ? counts.short : counts.medium) : Infinity;
  if ("n" in spec && spec.n > max) return Response.json({ error: "No such test" }, { status: 404 });

  return Response.json(drawSet(spec), { headers: { "Cache-Control": "no-store" } });
}
