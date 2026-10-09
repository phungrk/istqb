import { endSession } from "@/server/session";

export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}
