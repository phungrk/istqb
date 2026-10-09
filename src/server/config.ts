import "server-only";

/** Integrations switch on when their env vars are present. */
export const config = {
  /** Google sign-in is offered next to username/password when its keys are set. */
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  db: process.env.DATABASE_URL ? ("postgres" as const) : ("file" as const),
  payments: process.env.STRIPE_SECRET_KEY ? ("stripe" as const) : ("demo" as const),
  ai: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? ("live" as const) : ("demo" as const),
  /** Pricing and the AI coach are hidden for now; ENABLE_PRO=1 turns their APIs back on. */
  pro: process.env.ENABLE_PRO === "1",
  /** Local tools ("Preview as" bar, seeded preview account). Never on the live site. */
  devTools: process.env.NODE_ENV !== "production",
  /** Sign-in with Google is limited to this domain. Empty string allows any Google account. */
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? "gmail.com",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  /** Generated accounts: user001 … user100. */
  generatedAccounts: { prefix: "user", max: Number(process.env.GENERATED_ACCOUNT_LIMIT ?? 100) },
};

/** 404 for features that are switched off. */
export const notFound = () => Response.json({ error: "Not found" }, { status: 404 });
