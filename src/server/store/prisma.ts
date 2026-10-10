import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Attempt as DbAttempt, type User as DbUser } from "@/generated/prisma/client";
import type { Attempt } from "@/lib/stats";
import type { PerChapter } from "@/lib/questions";
import type { Store, UsageEvent, User } from "./types";

const g = globalThis as unknown as { prisma?: PrismaClient };
const prisma = (g.prisma ??= new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) }));

const toUser = (u: DbUser): User => ({
  id: u.id,
  email: u.email,
  username: u.username,
  name: u.name,
  plan: u.plan,
  proUntil: u.proUntil?.toISOString() ?? null,
  stripeCustomerId: u.stripeCustomerId,
});

const toAttempt = (a: DbAttempt): Attempt => ({
  id: a.id,
  title: a.title,
  setKey: a.setKey,
  mode: a.mode === "mock" ? "mock" : "practice",
  correct: a.correct,
  total: a.total,
  durationSec: a.durationSec,
  perChapter: a.perChapter as PerChapter,
  createdAt: a.createdAt.toISOString(),
});

export const prismaStore: Store = {
  async getUserById(id) {
    const u = await prisma.user.findUnique({ where: { id } });
    return u && toUser(u);
  },
  async getCredentials(username) {
    const u = await prisma.user.findUnique({ where: { username } });
    return u?.passwordHash ? { user: toUser(u), passwordHash: u.passwordHash } : null;
  },
  async createCredentialUser(username, name, passwordHash) {
    try {
      return toUser(await prisma.user.create({ data: { username, name, passwordHash } }));
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") return null; // unique violation: username taken
      throw e;
    }
  },
  async setPasswordHash(userId, passwordHash) {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },
  async listUsernames(prefix) {
    const rows = await prisma.user.findMany({ where: { username: { startsWith: prefix } }, select: { username: true } });
    return rows.flatMap((r) => (r.username ? [r.username] : []));
  },
  async getUserByEmail(email) {
    const u = await prisma.user.findUnique({ where: { email } });
    return u && toUser(u);
  },
  async getUserByStripeCustomer(customerId) {
    const u = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    return u && toUser(u);
  },
  async upsertUser(email, name) {
    return toUser(await prisma.user.upsert({ where: { email }, update: {}, create: { email, name } }));
  },
  async updateUser(id, patch) {
    const data = { ...patch, proUntil: patch.proUntil === undefined ? undefined : patch.proUntil && new Date(patch.proUntil) };
    return toUser(await prisma.user.update({ where: { id }, data }));
  },
  async listAttempts(userId) {
    return (await prisma.attempt.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(toAttempt);
  },
  async addAttempt(userId, { answers, createdAt, ...a }) {
    const row = await prisma.attempt.create({
      data: {
        ...a,
        userId,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        answers: { create: answers },
      },
    });
    return toAttempt(row);
  },
  async listLearned(userId) {
    return (await prisma.learnedTopic.findMany({ where: { userId } })).map((l) => l.nodeId);
  },
  async setLearned(userId, nodeId, learned) {
    if (learned) await prisma.learnedTopic.upsert({ where: { userId_nodeId: { userId, nodeId } }, update: {}, create: { userId, nodeId } });
    else await prisma.learnedTopic.deleteMany({ where: { userId, nodeId } });
  },
  async addEvents(events) {
    await prisma.event.createMany({
      data: events.map(({ t, ts, anon, uid, ...data }) => ({ type: t, ts: new Date(ts), anon, userId: uid ?? null, data: data as object })),
    });
  },
  async listEvents(since) {
    const rows = await prisma.event.findMany({ where: { ts: { gte: since } }, orderBy: { ts: "asc" } });
    return rows.map((r) => ({ ...(r.data as object), t: r.type, ts: r.ts.toISOString(), anon: r.anon, ...(r.userId ? { uid: r.userId } : {}) }) as UsageEvent);
  },
  async compactEvents(keepDays) {
    const cutoff = new Date(Date.now() - keepDays * 864e5);
    await prisma.event.deleteMany({ where: { ts: { lt: cutoff } } });
    return { compacted: [], deletedDays: [] }; // rows are indexed by ts: nothing to merge
  },
};
