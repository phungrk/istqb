import "server-only";
import { mastery, weakest } from "@/lib/stats";
import { getStore, type User } from "./store";

/** Mastery and weak chapters computed from the user's saved attempts. */
export async function coachContext(user: User) {
  const attempts = await (await getStore()).listAttempts(user.id);
  const weak = weakest(attempts);
  return {
    weak,
    weakText: weak.map((c) => `Chapter ${c.id} ${c.title}${c.pct !== null ? ` (${c.pct}%)` : ""}`).join(", "),
    masteryTable: mastery(attempts)
      .map((c) => `Ch${c.id} ${c.title}: ${c.pct === null ? "no data" : c.pct + "%"} (${c.q} exam questions)`)
      .join("\n"),
  };
}
