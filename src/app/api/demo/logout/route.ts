import { isDemoAuth } from "@/server/config";
import { demoSignOut } from "@/server/session";

export async function POST() {
  if (!isDemoAuth()) return Response.json({ error: "Not in demo mode" }, { status: 404 });
  await demoSignOut();
  return Response.json({ ok: true });
}
