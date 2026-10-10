import type { Attempt } from "@/lib/stats";

export type Plan = "member" | "pro";

export type User = {
  id: string;
  /** Google sign-in users have an email; generated accounts have a username. */
  email: string | null;
  username: string | null;
  name: string;
  plan: Plan;
  proUntil: string | null;
  stripeCustomerId: string | null;
};

export type NewAttempt = Omit<Attempt, "id" | "createdAt"> & {
  answers: { questionId: string; chosen: number[] }[];
  createdAt?: string;
};

/** One anonymous usage event (see src/lib/track.ts and /api/events). */
export type UsageEvent = {
  /** Event type, e.g. "page_view", "topic_open", "exam_submit". */
  t: string;
  /** Server time, ISO. */
  ts: string;
  /** Random per-browser id; never an email or IP. */
  anon: string;
  /** Signed-in user, when known. */
  uid?: string;
  [key: string]: unknown;
};

export interface Store {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  /** The user and their password hash, for username sign-in. */
  getCredentials(username: string): Promise<{ user: User; passwordHash: string } | null>;
  /** Creates a username/password account; null when the username is taken. */
  createCredentialUser(username: string, name: string, passwordHash: string): Promise<User | null>;
  listUsernames(prefix: string): Promise<string[]>;
  /** Replaces a username account's password hash (admin reset). */
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
  getUserByStripeCustomer(customerId: string): Promise<User | null>;
  upsertUser(email: string, name: string): Promise<User>;
  updateUser(id: string, patch: Partial<Pick<User, "plan" | "proUntil" | "stripeCustomerId">>): Promise<User>;
  listAttempts(userId: string): Promise<Attempt[]>;
  addAttempt(userId: string, attempt: NewAttempt): Promise<Attempt>;
  listLearned(userId: string): Promise<string[]>;
  setLearned(userId: string, nodeId: string, learned: boolean): Promise<void>;
  /** Appends a batch of usage events (all from the same request). */
  addEvents(events: UsageEvent[]): Promise<void>;
  /** Events with ts >= since, oldest first. */
  listEvents(since: Date): Promise<UsageEvent[]>;
  /**
   * Nightly housekeeping: merge each finished day's event batches into one object and drop
   * days older than `keepDays`. Returns what it did. A no-op for stores that don't need it.
   */
  compactEvents(keepDays: number): Promise<{ compacted: { day: string; batches: number; events: number }[]; deletedDays: string[] }>;
}
