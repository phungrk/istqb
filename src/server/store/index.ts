import "server-only";
import { config } from "../config";
import type { Store } from "./types";

export type { Store, User, Plan, NewAttempt, UsageEvent } from "./types";

let store: Promise<Store> | null = null;

/** Postgres (Prisma), Cloudflare R2, or the local JSON file — see config.db. */
export function getStore(): Promise<Store> {
  store ??=
    config.db === "postgres" ? import("./prisma").then((m) => m.prismaStore)
    : config.db === "r2" ? import("./r2").then((m) => m.r2Store)
    : import("./file").then((m) => m.fileStore);
  return store;
}
