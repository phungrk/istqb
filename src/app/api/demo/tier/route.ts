import { config, notFound } from "@/server/config";
import { getStore } from "@/server/store";
import { endSession, previewSignIn } from "@/server/session";

/** "Preview as" bar: switch between guest, member and (when enabled) pro. Local only. */
export async function POST(req: Request) {
  if (!config.devTools) return notFound();
  const { tier } = (await req.json().catch(() => ({}))) as { tier?: string };
  if (tier === "guest") {
    await endSession();
    return Response.json({ ok: true });
  }
  if (tier !== "member" && tier !== "pro") return Response.json({ error: "Unknown tier" }, { status: 400 });
  const user = await previewSignIn();
  await (await getStore()).updateUser(user.id, { plan: tier, proUntil: null });
  return Response.json({ ok: true });
}
