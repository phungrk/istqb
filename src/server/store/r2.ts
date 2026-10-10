import "server-only";
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import type { Attempt } from "@/lib/stats";
import type { NewAttempt, Store, UsageEvent, User } from "./types";

/*
 * Cloudflare R2 (S3-compatible object storage) used as a small document store:
 *
 *   users/{id}.json                 the user (+ passwordHash for username accounts)
 *   index/email/{email}.json        { id }   lookup for Google sign-in
 *   index/username/{name}.json      { id }   lookup for username sign-in
 *   index/stripe/{customer}.json    { id }   lookup for the Stripe webhook
 *   attempts/{userId}.json          Attempt[]
 *   learned/{userId}.json           string[] of mindmap topic ids
 *   events/{YYYY-MM-DD}/{ts}-{rand}.ndjson   one batch of usage events (append-only)
 *
 * Writes are conditional: an index is created with If-None-Match: * (so a username
 * can't be claimed twice), and read-modify-write updates use If-Match on the ETag
 * and retry when another request got there first.
 */

const bucket = process.env.R2_BUCKET as string;
const g = globalThis as unknown as { r2?: S3Client };
const s3 = (g.r2 ??= new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID as string, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string },
  forcePathStyle: !!process.env.R2_ENDPOINT,
}));

type Doc<T> = { value: T; etag: string } | null;
type StoredUser = User & { passwordHash?: string };

const status = (e: unknown) => (e instanceof S3ServiceException ? e.$metadata.httpStatusCode : undefined);
const enc = (s: string) => encodeURIComponent(s.toLowerCase());

async function get<T>(key: string): Promise<Doc<T>> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return { value: JSON.parse(await res.Body!.transformToString()) as T, etag: res.ETag as string };
  } catch (e) {
    if (status(e) === 404 || (e as { name?: string }).name === "NoSuchKey") return null;
    throw e;
  }
}

/** Conditional PUT. Returns false when the condition failed (someone else wrote first). */
async function put(key: string, value: unknown, cond: { ifMatch?: string; ifNoneMatch?: "*" } = {}): Promise<boolean> {
  try {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: JSON.stringify(value), ContentType: "application/json", IfMatch: cond.ifMatch, IfNoneMatch: cond.ifNoneMatch }));
    return true;
  } catch (e) {
    if (status(e) === 412 || status(e) === 409) return false;
    throw e;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Optimistic read-modify-write on one document, retrying with jittered backoff when another write won. */
async function update<T, R>(key: string, initial: T, fn: (v: T) => R): Promise<R> {
  for (let i = 0; i < 12; i++) {
    const doc = await get<T>(key);
    const value = doc ? doc.value : structuredClone(initial);
    const out = fn(value);
    if (await put(key, value, doc ? { ifMatch: doc.etag } : { ifNoneMatch: "*" })) return out;
    await sleep(Math.random() * 40 * (i + 1));
  }
  throw new Error(`R2: too much contention on ${key}`);
}

const pub = (u: StoredUser | null | undefined): User | null => {
  if (!u) return null;
  const { passwordHash: _h, ...rest } = u;
  return { ...rest, username: rest.username ?? null, email: rest.email ?? null };
};
const uid = () => "u" + Date.now().toString(36) + crypto.randomUUID().replace(/-/g, "").slice(0, 10);

async function userById(id: string) {
  return (await get<StoredUser>(`users/${id}.json`))?.value ?? null;
}
async function userByIndex(kind: "email" | "username" | "stripe", key: string) {
  const ref = await get<{ id: string }>(`index/${kind}/${enc(key)}.json`);
  return ref ? userById(ref.value.id) : null;
}

export const r2Store: Store = {
  async getUserById(id) {
    return pub(await userById(id));
  },
  async getUserByEmail(email) {
    return pub(await userByIndex("email", email));
  },
  async getUserByStripeCustomer(customerId) {
    return pub(await userByIndex("stripe", customerId));
  },
  async getCredentials(username) {
    const u = await userByIndex("username", username);
    return u?.passwordHash ? { user: pub(u)!, passwordHash: u.passwordHash } : null;
  },
  async createCredentialUser(username, name, passwordHash) {
    const id = uid();
    // Claim the username first; a second request for the same name gets null.
    if (!(await put(`index/username/${enc(username)}.json`, { id }, { ifNoneMatch: "*" }))) return null;
    const user: StoredUser = { id, email: null, username, name, plan: "member", proUntil: null, stripeCustomerId: null, passwordHash };
    await put(`users/${id}.json`, user);
    return pub(user);
  },
  async listUsernames(prefix) {
    const out: string[] = [];
    let token: string | undefined;
    do {
      const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `index/username/${enc(prefix)}`, ContinuationToken: token }));
      for (const o of res.Contents ?? []) out.push(decodeURIComponent(o.Key!.slice("index/username/".length, -".json".length)));
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    return out;
  },
  async upsertUser(email, name) {
    const existing = await userByIndex("email", email);
    if (existing) return pub(existing)!;
    const user: StoredUser = { id: uid(), email, username: null, name, plan: "member", proUntil: null, stripeCustomerId: null };
    await put(`users/${user.id}.json`, user);
    if (await put(`index/email/${enc(email)}.json`, { id: user.id }, { ifNoneMatch: "*" })) return pub(user)!;
    return pub(await userByIndex("email", email))!; // lost a race: use the account created first
  },
  async setPasswordHash(userId, passwordHash) {
    await update<StoredUser | null, void>(`users/${userId}.json`, null, (u) => {
      if (!u) throw new Error("User not found");
      u.passwordHash = passwordHash;
    });
  },
  async updateUser(id, patch) {
    const user = await update<StoredUser | null, StoredUser>(`users/${id}.json`, null, (u) => {
      if (!u) throw new Error("User not found");
      return Object.assign(u, patch);
    });
    if (patch.stripeCustomerId) await put(`index/stripe/${enc(patch.stripeCustomerId)}.json`, { id });
    return pub(user)!;
  },
  async listAttempts(userId) {
    const list = (await get<Attempt[]>(`attempts/${userId}.json`))?.value ?? [];
    return list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },
  async addAttempt(userId, { answers: _answers, createdAt, ...a }: NewAttempt) {
    const attempt: Attempt = { ...a, id: "a" + Date.now().toString(36) + crypto.randomUUID().slice(0, 6), createdAt: createdAt ?? new Date().toISOString() };
    await update<Attempt[], void>(`attempts/${userId}.json`, [], (list) => void list.push(attempt));
    return attempt;
  },
  async listLearned(userId) {
    return (await get<string[]>(`learned/${userId}.json`))?.value ?? [];
  },
  async setLearned(userId, nodeId, learned) {
    await update<string[], void>(`learned/${userId}.json`, [], (list) => {
      const i = list.indexOf(nodeId);
      if (learned && i < 0) list.push(nodeId);
      if (!learned && i >= 0) list.splice(i, 1);
    });
  },
  async addEvents(events) {
    if (!events.length) return;
    const day = events[0].ts.slice(0, 10);
    const key = `events/${day}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.ndjson`;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: events.map((e) => JSON.stringify(e)).join("\n"), ContentType: "application/x-ndjson" }));
  },
  async listEvents(since) {
    const keys: string[] = [];
    for (let d = new Date(since.toISOString().slice(0, 10)); d <= new Date(); d = new Date(d.getTime() + 864e5)) {
      let token: string | undefined;
      do {
        const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `events/${d.toISOString().slice(0, 10)}/`, ContinuationToken: token }));
        for (const o of res.Contents ?? []) keys.push(o.Key!);
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token);
    }
    const out: UsageEvent[] = [];
    for (let i = 0; i < keys.length; i += 32) {
      const bodies = await Promise.all(
        keys.slice(i, i + 32).map(async (Key) => (await s3.send(new GetObjectCommand({ Bucket: bucket, Key }))).Body!.transformToString()),
      );
      for (const b of bodies) for (const l of b.split("\n")) if (l) out.push(JSON.parse(l) as UsageEvent);
    }
    const from = since.toISOString();
    return out.filter((e) => e.ts >= from).sort((a, b) => (a.ts < b.ts ? -1 : 1));
  },
};
