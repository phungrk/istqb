import { config } from "@/server/config";
import { generateAccount, getCurrentUser } from "@/server/session";

/** Creates the next free account (user001…user100) with an 8-digit password.
 * It does not sign in: the dialog fills the form and the user presses "Sign in". */
export async function POST() {
  if (await getCurrentUser()) return Response.json({ error: "You are already signed in" }, { status: 409 });
  const made = await generateAccount();
  if (!made) return Response.json({ error: `All ${config.generatedAccounts.max} accounts have been handed out` }, { status: 409 });
  return Response.json({ username: made.user.username, password: made.password, name: made.user.name });
}
