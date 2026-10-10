"use client";

import { useApp } from "@/components/AppProvider";
import { MailIcon } from "@/components/icons";

const steps = [
  ["Write to the address below", "From any email account."],
  ["Say which username you use", "For example user007. That's all we need to find your account."],
  ["Get a new password by reply", "Your progress and results stay as they are."],
] as const;

export function ContactView({ email, username }: { email: string; username: string | null }) {
  const { toast } = useApp();
  const subject = "Testpath: forgot my password";
  const body = `Hi,\n\nI can't sign in to Testpath. My username is: ${username ?? "user___"}\n\nPlease send me a new password.\n\nThanks!`;
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start", paddingTop: 32 }}>
      <div style={{ flex: "1 1 380px", maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Contact</span>
        <h1 style={{ margin: 0 }}>Forgot your password?</h1>
        <p style={{ margin: 0, fontSize: 17, color: "var(--color-neutral-800)" }}>
          Send me an email and I&apos;ll reset it for you. Questions or a mistake in a question? Same address.
        </p>
        <ol style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map(([title, text], i) => (
            <li key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-bg)", display: "grid", placeItems: "center", fontWeight: 700 }}>{i + 1}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
                <strong>{title}</strong>
                <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card" style={{ flex: "0 1 400px", minWidth: 0, padding: 28, gap: 14, background: "var(--color-accent-2-100)" }}>
        <span className="card-kicker" style={{ color: "var(--color-accent-2-800)" }}>Email</span>
        <a href={`mailto:${email}`} style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent-2-900)", wordBreak: "break-all" }}>{email}</a>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href={mailto} style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <MailIcon /> Write an email
          </a>
          <button
            className="btn btn-secondary"
            style={{ background: "var(--color-bg)" }}
            onClick={() => navigator.clipboard?.writeText(email).then(() => toast("Email address copied"), () => toast("Copy failed"))}
          >
            Copy address
          </button>
        </div>
        <span style={{ fontSize: 13, color: "var(--color-accent-2-900)" }}>
          &ldquo;Write an email&rdquo; opens your mail app with the subject and{username ? ` your username (${username})` : " a template"} filled in.
        </span>
      </div>
    </section>
  );
}
