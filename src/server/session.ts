import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { auth, nameFromEmail } from "@/auth";
import { config, isDemoAuth } from "./config";
import { getStore, type User } from "./store";
import type { Attempt } from "@/lib/stats";

const DEMO_COOKIE = "tp_demo";
const secret = () => process.env.AUTH_SECRET || "testpath-demo-only-secret";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export type Tier = "guest" | "member" | "pro";

/** A Pro plan whose paid period has ended counts as member. */
export function tierOf(user: User | null): Tier {
  if (!user) return "guest";
  if (user.plan === "pro" && (!user.proUntil || new Date(user.proUntil) > new Date())) return "pro";
  return "member";
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await getStore();
  if (!isDemoAuth()) {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    return email ? store.getUserByEmail(email) : null;
  }
  const raw = (await cookies()).get(DEMO_COOKIE)?.value;
  if (!raw) return null;
  const [value, mac] = raw.split(".");
  const expected = sign(value);
  if (!mac || mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return store.getUserByEmail(Buffer.from(value, "base64url").toString());
}

/** Gate for API routes. Returns the user or a ready-made error response. */
export async function requireTier(min: "member" | "pro"): Promise<{ user: User } | { error: Response }> {
  const user = await getCurrentUser();
  const tier = tierOf(user);
  if (!user) return { error: Response.json({ error: "Sign in required" }, { status: 401 }) };
  if (min === "pro" && tier !== "pro") return { error: Response.json({ error: "Pro plan required" }, { status: 403 }) };
  return { user };
}

// ── Demo mode only ────────────────────────────────────────────────────────────

export const DEMO_ACCOUNT = { email: "linh.nguyen@gmail.com", name: "Linh Nguyen" };

export async function demoSignIn(email: string): Promise<User> {
  if (!isDemoAuth()) throw new Error("Demo sign-in is disabled when Google sign-in is configured");
  email = email.toLowerCase();
  const domain = config.allowedEmailDomain;
  if (domain && !email.endsWith("@" + domain)) throw new Error("Please use a Gmail address");
  const store = await getStore();
  const isDemoAccount = email === DEMO_ACCOUNT.email;
  const user = await store.upsertUser(email, isDemoAccount ? DEMO_ACCOUNT.name : nameFromEmail(email));
  if (isDemoAccount && !(await store.listAttempts(user.id)).length) {
    for (const a of seedAttempts()) await store.addAttempt(user.id, { ...a, answers: [] });
  }
  const value = Buffer.from(email).toString("base64url");
  (await cookies()).set(DEMO_COOKIE, value + "." + sign(value), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return user;
}

export async function demoSignOut() {
  (await cookies()).delete(DEMO_COOKIE);
}

const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();

/** The prototype's sample history, so the dashboard has something to show. */
function seedAttempts(): Omit<Attempt, "id">[] {
  return [
    { title: "Chapter 1 · Fundamentals of Testing", setKey: "c1", mode: "practice", createdAt: daysAgo(6), correct: 2, total: 3, durationSec: 140, perChapter: { 1: [2, 3] } },
    { title: "Mock Exam A", setKey: "mA", mode: "mock", createdAt: daysAgo(4), correct: 8, total: 15, durationSec: 760, perChapter: { 1: [2, 3], 2: [2, 2], 3: [1, 2], 4: [1, 4], 5: [1, 2], 6: [1, 2] } },
    { title: "Chapter 4 · Test Analysis and Design", setKey: "c4", mode: "practice", createdAt: daysAgo(2), correct: 2, total: 4, durationSec: 300, perChapter: { 4: [2, 4] } },
    { title: "Mock Exam B", setKey: "mB", mode: "mock", createdAt: daysAgo(1), correct: 10, total: 15, durationSec: 690, perChapter: { 1: [3, 3], 2: [1, 2], 3: [2, 2], 4: [2, 4], 5: [1, 2], 6: [1, 2] } },
  ];
}
