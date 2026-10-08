import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Attempt } from "@/lib/stats";
import type { NewAttempt, Store, User } from "./types";

/** Demo-mode store: one JSON file under .data/. Not for production. */
type Db = { users: User[]; attempts: (Attempt & { userId: string })[]; learned: { userId: string; nodeId: string }[] };

const FILE = path.join(process.cwd(), ".data", "demo-db.json");

// Read the file on every call: Next.js bundles routes separately, so an
// in-memory copy would go stale between the API routes and the pages.
async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    return { users: [], attempts: [], learned: [] };
  }
}

async function save(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// Serialise read-modify-write cycles across the whole process.
const g = globalThis as unknown as { demoDbLock?: Promise<unknown> };
function write<T>(fn: (db: Db) => T): Promise<T> {
  const run = (g.demoDbLock ?? Promise.resolve()).then(async () => {
    const db = await load();
    const out = fn(db);
    await save(db);
    return out;
  });
  g.demoDbLock = run.catch(() => {});
  return run;
}

const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const fileStore: Store = {
  async getUserByEmail(email) {
    return (await load()).users.find((u) => u.email === email) ?? null;
  },
  async getUserByStripeCustomer(customerId) {
    return (await load()).users.find((u) => u.stripeCustomerId === customerId) ?? null;
  },
  upsertUser(email, name) {
    return write((db) => {
      let u = db.users.find((x) => x.email === email);
      if (!u) {
        u = { id: uid("u"), email, name, plan: "member", proUntil: null, stripeCustomerId: null };
        db.users.push(u);
      }
      return u;
    });
  },
  updateUser(id, patch) {
    return write((db) => {
      const u = db.users.find((x) => x.id === id);
      if (!u) throw new Error("User not found");
      return Object.assign(u, patch);
    });
  },
  async listAttempts(userId) {
    return (await load()).attempts
      .filter((a) => a.userId === userId)
      .map(({ userId: _u, ...a }) => a)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },
  addAttempt(userId, { answers: _answers, createdAt, ...a }: NewAttempt) {
    return write((db) => {
      const attempt: Attempt = { ...a, id: uid("a"), createdAt: createdAt ?? new Date().toISOString() };
      db.attempts.push({ ...attempt, userId });
      return attempt;
    });
  },
  async listLearned(userId) {
    return (await load()).learned.filter((l) => l.userId === userId).map((l) => l.nodeId);
  },
  setLearned(userId, nodeId, learned) {
    return write((db) => {
      db.learned = db.learned.filter((l) => !(l.userId === userId && l.nodeId === nodeId));
      if (learned) db.learned.push({ userId, nodeId });
    });
  },
};
