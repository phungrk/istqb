import { z } from "zod";
import { getStore } from "@/server/store";
import { adminSignIn, startSession, verifyPassword } from "@/server/session";
import { config } from "@/server/config";

const Body = z.object({ username: z.string().trim().toLowerCase().min(1).max(64), password: z.string().min(1).max(200) });

// Best-effort brake on password guessing: 5 failures per username lock it for 10 minutes (per server instance).
const failures = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter your username and password" }, { status: 400 });
  const { username, password } = parsed.data;

  const f = failures.get(username);
  if (f && f.until > Date.now()) return Response.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const creds =
    config.admin && username === config.admin.username
      ? await adminSignIn(username, password).then((user) => user && { user })
      : await (await getStore()).getCredentials(username).then(async (c) => (c && (await verifyPassword(password, c.passwordHash)) ? c : null));
  if (!creds) {
    const n = (f && f.until > Date.now() - 600_000 ? f.n : 0) + 1;
    failures.set(username, { n, until: n >= 5 ? Date.now() + 600_000 : 0 });
    return Response.json({ error: "Wrong username or password" }, { status: 401 });
  }
  failures.delete(username);
  await startSession(creds.user.id);
  return Response.json({ ok: true, name: creds.user.name, username: creds.user.username });
}
