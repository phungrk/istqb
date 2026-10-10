import "server-only";
import { createHmac, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { config } from "./config";
import { getStore, type User } from "./store";
import type { Attempt } from "@/lib/stats";
import { nameFromHandle } from "@/lib/names";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "tp_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set in production");
  return "testpath-dev-only-secret";
}
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export type Tier = "guest" | "member" | "pro";

/** A Pro plan whose paid period has ended counts as member. Pro is off unless ENABLE_PRO=1. */
export function tierOf(user: User | null): Tier {
  if (!user) return "guest";
  if (config.pro && user.plan === "pro" && (!user.proUntil || new Date(user.proUntil) > new Date())) return "pro";
  return "member";
}

/** Username/password session first, then Google (Auth.js) when configured. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await getStore();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (raw) {
    const [id, mac] = raw.split(".");
    const expected = sign(id);
    if (mac && mac.length === expected.length && timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) {
      const user = await store.getUserById(Buffer.from(id, "base64url").toString());
      if (user) return user;
    }
  }
  if (config.google) {
    const email = (await auth())?.user?.email?.toLowerCase();
    if (email) return store.getUserByEmail(email);
  }
  return null;
}

/** Gate for API routes. Returns the user or a ready-made error response. */
export async function requireTier(min: "member" | "pro"): Promise<{ user: User } | { error: Response }> {
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Sign in required" }, { status: 401 }) };
  if (min === "pro" && tierOf(user) !== "pro") return { error: Response.json({ error: "Pro plan required" }, { status: 403 }) };
  return { user };
}

export async function startSession(userId: string) {
  const id = Buffer.from(userId).toString("base64url");
  (await cookies()).set(COOKIE, id + "." + sign(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

// ── Passwords ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64url")}$${(await scrypt(password, salt, 32)).toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const actual = await scrypt(password, Buffer.from(salt, "base64url"), 32);
  const expected = Buffer.from(hash, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const newPassword = () => String(randomInt(0, 100_000_000)).padStart(8, "0");

// ── Admin ─────────────────────────────────────────────────────────────────────

export const isAdmin = (user: User | null) => !!(config.admin && user?.username && user.username === config.admin.username);

/** Checks the owner's credentials (ADMIN_USERNAME / ADMIN_PASSWORD) and returns their account, created on first sign-in. */
export async function adminSignIn(username: string, password: string): Promise<User | null> {
  const admin = config.admin;
  if (!admin || username !== admin.username) return null;
  const digest = (s: string) => createHmac("sha256", "admin").update(s).digest();
  if (!timingSafeEqual(digest(password.trim()), digest(admin.password))) return null;
  const store = await getStore();
  const existing = (await store.getCredentials(username))?.user;
  // The stored hash is never used for the admin: the environment is the source of truth.
  return existing ?? (await store.createCredentialUser(username, "Admin", await hashPassword(randomBytes(16).toString("hex"))));
}

/** Gives a username account a new 8-digit password. Null when there is no such account. */
export async function resetPassword(username: string): Promise<string | null> {
  const store = await getStore();
  const creds = await store.getCredentials(username);
  if (!creds || isAdmin(creds.user)) return null;
  const password = newPassword();
  await store.setPasswordHash(creds.user.id, await hashPassword(password));
  return password;
}

/** Next free userNNN, an 8-digit password, stored hashed. Null when all are taken. */
export async function generateAccount(): Promise<{ user: User; password: string } | null> {
  const store = await getStore();
  const { prefix, max } = config.generatedAccounts;
  const taken = new Set(await store.listUsernames(prefix));
  for (let n = 1; n <= max; n++) {
    const username = prefix + String(n).padStart(3, "0");
    if (taken.has(username)) continue;
    const password = newPassword();
    const user = await store.createCredentialUser(username, nameFromHandle(username), await hashPassword(password));
    if (user) return { user, password }; // null = taken by a concurrent request; try the next number
  }
  return null;
}

// ── Local preview only ────────────────────────────────────────────────────────

const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();

/** Signs in a seeded "preview" account so every screen has data. Dev only. */
export async function previewSignIn(): Promise<User> {
  if (!config.devTools) throw new Error("Preview is only available locally");
  const store = await getStore();
  let user = (await store.getCredentials("preview"))?.user ?? null;
  if (!user) {
    user = await store.createCredentialUser("preview", "Linh Nguyen", await hashPassword(randomBytes(12).toString("hex")));
    if (!user) throw new Error("Could not create the preview account");
    for (const a of seedAttempts()) await store.addAttempt(user.id, { ...a, answers: [] });
  }
  await startSession(user.id);
  return user;
}

/** The prototype's sample history, so the dashboard has something to show. */
function seedAttempts(): Omit<Attempt, "id">[] {
  return [
    { title: "Chapter 1 · Short (10)", setKey: "ch1-10", mode: "practice", createdAt: daysAgo(6), correct: 7, total: 10, durationSec: 540, perChapter: { 1: [7, 10] } },
    { title: "Medium test · 20 questions", setKey: "lvl-20", mode: "mock", createdAt: daysAgo(4), correct: 11, total: 20, durationSec: 1620, perChapter: { 1: [3, 4], 2: [2, 3], 3: [1, 2], 4: [2, 6], 5: [2, 4], 6: [1, 1] } },
    { title: "Chapter 4 · Short (10)", setKey: "ch4-10", mode: "practice", createdAt: daysAgo(2), correct: 5, total: 10, durationSec: 780, perChapter: { 4: [5, 10] } },
    { title: "Long test · 40 questions", setKey: "lvl-40", mode: "mock", createdAt: daysAgo(1), correct: 27, total: 40, durationSec: 3300, perChapter: { 1: [7, 8], 2: [4, 6], 3: [3, 4], 4: [6, 11], 5: [6, 9], 6: [1, 2] } },
  ];
}
