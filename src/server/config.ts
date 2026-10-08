import "server-only";

/**
 * Each integration switches on when its env vars are present. Without them the
 * app runs in demo mode so every screen works locally with no accounts.
 */
export const config = {
  auth: process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? ("google" as const) : ("demo" as const),
  db: process.env.DATABASE_URL ? ("postgres" as const) : ("file" as const),
  payments: process.env.STRIPE_SECRET_KEY ? ("stripe" as const) : ("demo" as const),
  ai: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? ("live" as const) : ("demo" as const),
  /** Sign-in is limited to this domain. Empty string allows any Google account. */
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? "gmail.com",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
};

export const isDemoAuth = () => config.auth === "demo";
