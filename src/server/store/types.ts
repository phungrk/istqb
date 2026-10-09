import type { Attempt } from "@/lib/stats";

export type Plan = "member" | "pro";

export type User = {
  id: string;
  email: string;
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
  getUserByEmail(email: string): Promise<User | null>;
  getUserByStripeCustomer(customerId: string): Promise<User | null>;
  upsertUser(email: string, name: string): Promise<User>;
  updateUser(id: string, patch: Partial<Pick<User, "plan" | "proUntil" | "stripeCustomerId">>): Promise<User>;
  listAttempts(userId: string): Promise<Attempt[]>;
  addAttempt(userId: string, attempt: NewAttempt): Promise<Attempt>;
  listLearned(userId: string): Promise<string[]>;
  setLearned(userId: string, nodeId: string, learned: boolean): Promise<void>;
}
