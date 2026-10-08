import { isDemoAuth } from "@/server/config";
import { getStore } from "@/server/store";
import { DEMO_ACCOUNT, demoSignIn, demoSignOut, getCurrentUser } from "@/server/session";

/** "Preview as" bar: switch between guest, member and pro. Demo mode only. */
export async function POST(req: Request) {
  if (!isDemoAuth()) return Response.json({ error: "Not in demo mode" }, { status: 404 });
  const { tier } = (await req.json().catch(() => ({}))) as { tier?: string };
  if (tier === "guest") {
    await demoSignOut();
    return Response.json({ ok: true });
  }
  if (tier !== "member" && tier !== "pro") return Response.json({ error: "Unknown tier" }, { status: 400 });
  const user = (await getCurrentUser()) ?? (await demoSignIn(DEMO_ACCOUNT.email));
  await (await getStore()).updateUser(user.id, { plan: tier, proUntil: null });
  return Response.json({ ok: true });
}
