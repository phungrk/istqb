import "server-only";
import { getStore } from "./store";
import { config } from "./config";

export type AdminRow = { username: string; name: string; attempts: number; lastActive: string | null };

/** Every username account except the admin's, with a little activity so the owner can tell them apart. */
export async function listAccounts(): Promise<AdminRow[]> {
  const store = await getStore();
  const names = (await store.listUsernames("")).filter((n) => n !== config.admin?.username).sort();
  const rows = await Promise.all(
    names.map(async (username) => {
      const user = (await store.getCredentials(username))?.user;
      if (!user) return null;
      const attempts = await store.listAttempts(user.id);
      return { username, name: user.name, attempts: attempts.length, lastActive: attempts.at(-1)?.createdAt ?? null };
    }),
  );
  return rows.filter((r): r is AdminRow => !!r);
}
