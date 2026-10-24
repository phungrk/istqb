import { z } from "zod";
import { getStore } from "@/server/store";

/** The running total of likes on the "Bí kíp phòng thi" modal. Open to guests and members alike. */
const TIPS_LIKES = "tips-likes";

const Body = z.object({ count: z.number().int().min(1).max(50) });

// Best-effort brake on scripted spam (per server instance): a person can't click 300 times a minute.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 300;
const seen = new Map<string, { n: number; start: number }>();

function allowed(req: Request, add: number) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const w = seen.get(ip);
  if (!w || now - w.start > WINDOW_MS) {
    if (seen.size > 5000) seen.clear();
    seen.set(ip, { n: add, start: now });
    return true;
  }
  w.n += add;
  return w.n <= MAX_PER_WINDOW;
}

export async function GET() {
  return Response.json({ likes: await (await getStore()).getCounter(TIPS_LIKES) }, { headers: { "Cache-Control": "no-store" } });
}

/** Body { count }: the likes clicked since the last request (the page batches rapid clicks). 1 click = 1 like. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  if (!allowed(req, parsed.data.count)) return Response.json({ error: "Too many likes, slow down" }, { status: 429 });
  const likes = await (await getStore()).incrementCounter(TIPS_LIKES, parsed.data.count);
  return Response.json({ likes }, { headers: { "Cache-Control": "no-store" } });
}
