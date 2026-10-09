import { config } from "@/server/config";
import { generateAccount, getCurrentUser, startSession } from "@/server/session";

/** Creates the next free account (user001…user100) with an 8-digit password and signs it in. */
export async function POST() {
  if (await getCurrentUser()) return Response.json({ error: "You are already signed in" }, { status: 409 });
  const made = await generateAccount();
  if (!made) return Response.json({ error: `All ${config.generatedAccounts.max} accounts have been handed out` }, { status: 409 });
  await startSession(made.user.id);
  return Response.json({ username: made.user.username, password: made.password, name: made.user.name });
}
