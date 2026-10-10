import { createHash, timingSafeEqual } from "crypto";
import { config } from "@/server/config";
import { getStore } from "@/server/store";
import { getCurrentUser, isAdmin } from "@/server/session";

export const maxDuration = 60;

const same = (a: string, b: string) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

async function run() {
  const started = Date.now();
  const result = await (await getStore()).compactEvents(config.eventRetentionDays);
  return Response.json({ ...result, ms: Date.now() - started });
}

/** Nightly Vercel Cron (see vercel.json): merges each finished day's event batches into one object. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!config.cronSecret || !same(auth, `Bearer ${config.cronSecret}`)) return new Response("Unauthorized", { status: 401 });
  return run();
}

/** "Compact now" from /admin → Insights. */
export async function POST() {
  if (!isAdmin(await getCurrentUser())) return new Response("Not found", { status: 404 });
  return run();
}
