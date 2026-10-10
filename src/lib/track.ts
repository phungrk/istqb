"use client";

/**
 * Anonymous usage tracking for /admin → Insights. Events are queued and sent in
 * batches (every 60 seconds, and with sendBeacon when the page is hidden).
 * The id is random and stays in this browser; nothing is sent when Do Not Track is on.
 */
type Event = { t: string; [key: string]: unknown };

const ANON_KEY = "tp_anon";
const queue: (Event & { at: number })[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

function anonId(): string {
  try {
    let v = localStorage.getItem(ANON_KEY);
    if (!v) localStorage.setItem(ANON_KEY, (v = crypto.randomUUID()));
    return v;
  } catch {
    return "nostorage-" + Math.random().toString(36).slice(2, 12);
  }
}

const disabled = () => typeof navigator === "undefined" || navigator.doNotTrack === "1" || (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

function flush(beacon = false) {
  if (!queue.length) return;
  const now = Date.now();
  const batch = queue.splice(0, 50).map(({ at, ...e }) => ({ ...e, ago: Math.max(0, now - at) }));
  const body = JSON.stringify({ anon: anonId(), events: batch });
  if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  else void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  if (queue.length) flush(beacon);
}

export function track(t: string, data: Record<string, unknown> = {}) {
  if (disabled()) return;
  queue.push({ t, ...data, at: Date.now() });
  if (!timer) {
    timer = setInterval(() => flush(), 60000);
    addEventListener("pagehide", () => flush(true));
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush(true));
  }
  if (queue.length >= 20) flush();
}

/** Send what's queued right away (e.g. before navigating to a result page). */
export const flushNow = () => flush();
