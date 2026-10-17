import { z } from "zod";
import { listAccounts } from "@/server/admin";
import { withMissedLos } from "@/server/attemptLos";
import { notFound } from "@/server/config";
import { getCurrentUser, isAdmin } from "@/server/session";
import { getStore } from "@/server/store";

const Username = z.string().trim().toLowerCase().min(1).max(64);

/**
 * Admin only: view another learner's dashboard (read-only).
 *   GET                      → { accounts }: every username account, for the picker
 *   GET ?username=user001    → { username, name, attempts, learned } of that account
 * Anyone else gets the same 404 as an unknown route, so the endpoint isn't advertised.
 */
export async function GET(req: Request) {
  if (!isAdmin(await getCurrentUser())) return notFound();
  const raw = new URL(req.url).searchParams.get("username");
  if (raw === null) return Response.json({ accounts: await listAccounts() }, { headers: { "Cache-Control": "no-store" } });

  const username = Username.safeParse(raw);
  if (!username.success) return Response.json({ error: "Bad username" }, { status: 400 });
  const store = await getStore();
  const user = (await store.getCredentials(username.data))?.user;
  if (!user || isAdmin(user)) return Response.json({ error: "No such account" }, { status: 404 });
  const [attempts, learned] = await Promise.all([store.listAttempts(user.id).then((a) => withMissedLos(store, user.id, a)), store.listLearned(user.id)]);
  return Response.json({ username: username.data, name: user.name, attempts, learned }, { headers: { "Cache-Control": "no-store" } });
}
