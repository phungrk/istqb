import "server-only";
import { config } from "../config";
import type { Store } from "./types";

export type { Store, User, Plan, NewAttempt } from "./types";

let store: Promise<Store> | null = null;

/** Postgres via Prisma when DATABASE_URL is set, otherwise the local demo file. */
export function getStore(): Promise<Store> {
  store ??= config.db === "postgres"
    ? import("./prisma").then((m) => m.prismaStore)
    : import("./file").then((m) => m.fileStore);
  return store;
}
