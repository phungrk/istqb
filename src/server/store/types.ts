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

export interface Store {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  /** The user and their password hash, for username sign-in. */
  getCredentials(username: string): Promise<{ user: User; passwordHash: string } | null>;
  /** Creates a username/password account; null when the username is taken. */
  createCredentialUser(username: string, name: string, passwordHash: string): Promise<User | null>;
  listUsernames(prefix: string): Promise<string[]>;
  getUserByStripeCustomer(customerId: string): Promise<User | null>;
  upsertUser(email: string, name: string): Promise<User>;
  updateUser(id: string, patch: Partial<Pick<User, "plan" | "proUntil" | "stripeCustomerId">>): Promise<User>;
  listAttempts(userId: string): Promise<Attempt[]>;
  addAttempt(userId: string, attempt: NewAttempt): Promise<Attempt>;
  listLearned(userId: string): Promise<string[]>;
  setLearned(userId: string, nodeId: string, learned: boolean): Promise<void>;
}
