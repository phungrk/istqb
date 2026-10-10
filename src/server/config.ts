import "server-only";

/** Integrations switch on when their env vars are present. */
/** An env value as typed into a dashboard: surrounding spaces and quotes ("x" or 'x') are not part of it. */
function envValue(name: string): string | undefined {
  const v = process.env[name]?.trim().replace(/^(["'])(.*)\1$/, "$2").trim();
  return v || undefined;
}

export const config = {
  /** Google sign-in is offered next to username/password when its keys are set. */
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  /** Postgres when DATABASE_URL is set, else Cloudflare R2 when its keys are set, else a local JSON file. */
  db: process.env.DATABASE_URL
    ? ("postgres" as const)
    : process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && (process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT)
      ? ("r2" as const)
      : ("file" as const),
  payments: process.env.STRIPE_SECRET_KEY ? ("stripe" as const) : ("demo" as const),
  ai: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? ("live" as const) : ("demo" as const),
  /** Pricing and the AI coach are hidden for now; ENABLE_PRO=1 turns their APIs back on. */
  pro: process.env.ENABLE_PRO === "1",
  /** Local tools ("Preview as" bar, seeded preview account). Never on the live site. */
  devTools: process.env.NODE_ENV !== "production",
  /** Sign-in with Google is limited to this domain. Empty string allows any Google account. */
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? "gmail.com",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  /** Where the Contact page sends people (forgotten passwords, questions). */
  contactEmail: process.env.CONTACT_EMAIL?.trim() || "phungnc@gmail.com",
  /** The site owner's sign-in for /admin. Both must be set; the password lives only in the environment. */
  admin:
    envValue("ADMIN_USERNAME") && envValue("ADMIN_PASSWORD")
      ? { username: envValue("ADMIN_USERNAME")!.toLowerCase(), password: envValue("ADMIN_PASSWORD")! }
      : null,
  /** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; without it the cron route refuses. */
  cronSecret: envValue("CRON_SECRET") ?? null,
  /** Usage events older than this are deleted by the nightly compaction. */
  eventRetentionDays: Number(process.env.EVENT_RETENTION_DAYS) || 365,
  /** Generated accounts: user001 … user100. */
  generatedAccounts: { prefix: "user", max: Number(process.env.GENERATED_ACCOUNT_LIMIT ?? 100) },
};

/** 404 for features that are switched off. */
export const notFound = () => Response.json({ error: "Not found" }, { status: 404 });
