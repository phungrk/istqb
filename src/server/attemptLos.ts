import "server-only";
import type { Attempt } from "@/lib/stats";
import { BANK_BY_ID } from "./bank";
import type { Store } from "./store";

/** Sorted syllabus LOs of the bank questions answered wrong. */
export function missedLos(items: { id: string; ok: boolean }[]) {
  const los = new Set(items.flatMap((x) => (!x.ok && BANK_BY_ID[x.id]?.lo ? [BANK_BY_ID[x.id].lo!] : [])));
  return [...los].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** An exam_submit event is matched to an attempt saved within this window of it. */
const WINDOW_MS = 30 * 60_000;

type Submit = { ts: string; uid?: string; set?: string; items?: { q: string; ok: boolean }[] };

/**
 * Attempts saved before missedLos existed get it from the user's exam_submit usage events
 * (same set, submitted just before the save, per-question results scored server-side).
 * Runs once per attempt: the result, or null when no event matches, is written back.
 */
export async function withMissedLos(store: Store, userId: string, attempts: Attempt[]): Promise<Attempt[]> {
  const todo = attempts.filter((a) => a.missedLos === undefined);
  if (!todo.length || !store.setMissedLos) return attempts;
  try {
    const since = new Date(Math.min(...todo.map((a) => Date.parse(a.createdAt))) - WINDOW_MS);
    const submits = ((await store.listEvents(since)) as Submit[]).filter((e) => e.uid === userId && (e as { t?: string }).t === "exam_submit" && Array.isArray(e.items));
    const used = new Set<Submit>();
    const byId: Record<string, string[] | null> = {};
    for (const a of todo) {
      const at = Date.parse(a.createdAt);
      const best = submits
        .filter((e) => !used.has(e) && e.set === a.setKey && e.items!.length === a.total && Math.abs(at - Date.parse(e.ts)) <= WINDOW_MS)
        .sort((x, y) => Math.abs(at - Date.parse(x.ts)) - Math.abs(at - Date.parse(y.ts)))[0];
      if (best) used.add(best);
      byId[a.id] = best ? missedLos(best.items!.map((i) => ({ id: i.q, ok: i.ok }))) : null;
    }
    await store.setMissedLos(userId, byId);
    return attempts.map((a) => (a.id in byId ? { ...a, missedLos: byId[a.id] } : a));
  } catch (err) {
    console.error("[attempts] missedLos backfill failed:", err);
    return attempts;
  }
}
