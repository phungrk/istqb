"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, type Tier } from "./AppProvider";

const stop = (e: React.MouseEvent) => e.stopPropagation();

function Backdrop({ children, width, onClose }: { children: React.ReactNode; width?: number; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={stop} style={{ width: width ? `min(${width}px,100%)` : undefined, background: "var(--color-neutral-100)" }}>
        {children}
      </div>
    </div>
  );
}

const googleRow = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 16px", borderRadius: 999, border: "2px solid var(--color-divider)", background: "var(--color-bg)", cursor: "pointer", color: "var(--color-text)", fontWeight: 600, fontSize: 14 } as const;

function GenerateBox() {
  const { generateAccount, toast } = useApp();
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const box = { background: "var(--color-accent-2-100)", borderRadius: 20, padding: "12px 16px", fontSize: 13, color: "var(--color-accent-2-900)", display: "flex", flexDirection: "column", gap: 8 } as const;

  if (creds)
    return (
      <div style={box} role="status">
        <span style={{ fontWeight: 700 }}>Your account is ready and you are signed in.</span>
        <span style={{ fontSize: 15 }}>
          Username: <strong>{creds.username}</strong> · Password: <strong style={{ fontVariantNumeric: "tabular-nums", letterSpacing: ".04em" }}>{creds.password}</strong>
        </span>
        <span>Save it now: the password can&apos;t be shown again.</span>
        <button
          className="btn btn-secondary"
          style={{ alignSelf: "flex-start", background: "var(--color-bg)" }}
          onClick={() => navigator.clipboard?.writeText(`Username: ${creds.username}\nPassword: ${creds.password}`).then(() => toast("Copied"), () => toast("Copy failed"))}
        >
          Copy username & password
        </button>
      </div>
    );
  return (
    <div style={{ ...box, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 180px" }}>New here? Get a free account in one click.</span>
      <button
        className="btn btn-secondary"
        disabled={busy}
        style={{ background: "var(--color-bg)" }}
        onClick={async () => {
          setBusy(true);
          setCreds(await generateAccount());
          setBusy(false);
        }}
      >
        {busy ? "Creating…" : "Generate account"}
      </button>
    </div>
  );
}

function LoginDialog() {
  const { flags, user, closeDialog, loginPassword, loginGoogle, toast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Backdrop width={420} onClose={closeDialog}>
      <span className="dialog-title" style={{ fontSize: 24 }}>Sign in</span>
      <GenerateBox />
      {user ? (
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={closeDialog}>Done</button>
        </div>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!username.trim() || !password) return toast("Enter your username and password");
              void loginPassword(username.trim(), password);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div className="field">
              <label htmlFor="login-user">Username</label>
              <input id="login-user" className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" style={{ minHeight: 44 }} />
            </div>
            <div className="field">
              <label htmlFor="login-pass">Password</label>
              <input id="login-pass" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" style={{ minHeight: 44 }} />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>
              <button className="btn btn-primary" type="submit">Sign in</button>
            </div>
          </form>
          {flags.google && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--color-neutral-700)" }}>
                <span style={{ flex: 1, height: 1, background: "var(--color-divider)" }} />or<span style={{ flex: 1, height: 1, background: "var(--color-divider)" }} />
              </div>
              <button className="hov-border-accent" onClick={loginGoogle} style={googleRow}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--color-accent)" }}>G</span>
                Continue with Google
              </button>
            </>
          )}
        </>
      )}
    </Backdrop>
  );
}

function CheckoutDialog() {
  const { flags, closeDialog, upgrade } = useApp();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [paying, setPaying] = useState(false);
  const opts = [
    ["monthly", "Monthly", "$5 / month"],
    ["yearly", "Yearly", "$39 / year · save 35%"],
  ] as const;
  const stripe = flags.payments === "stripe";
  return (
    <Backdrop width={460} onClose={closeDialog}>
      <span className="dialog-title" style={{ fontSize: 24 }}>Upgrade to Pro</span>
      <div style={{ display: "flex", gap: 10 }}>
        {opts.map(([k, label, price]) => {
          const on = billing === k;
          return (
            <button key={k} onClick={() => setBilling(k)} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, textAlign: "left", padding: "14px 16px", borderRadius: 24, border: `2px solid ${on ? "var(--color-accent)" : "var(--color-divider)"}`, background: on ? "var(--color-accent-100)" : "var(--color-bg)", cursor: "pointer", color: "var(--color-text)" }}>
              <span style={{ fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{price}</span>
            </button>
          );
        })}
      </div>
      {stripe ? (
        <span className="dialog-body">You&apos;ll enter your card on Stripe&apos;s secure checkout page.</span>
      ) : (
        <>
          <div className="field"><label>Card number</label><input className="input" defaultValue="4242 4242 4242 4242" style={{ minHeight: 44 }} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label>Expiry</label><input className="input" defaultValue="12 / 28" style={{ minHeight: 44 }} /></div>
            <div className="field" style={{ flex: 1 }}><label>CVC</label><input className="input" defaultValue="123" style={{ minHeight: 44 }} /></div>
          </div>
        </>
      )}
      <div className="dialog-actions">
        <button className="btn btn-ghost" onClick={closeDialog}>Cancel</button>
        <button
          className="btn btn-primary"
          disabled={paying}
          onClick={async () => {
            setPaying(true);
            await upgrade(billing);
            setPaying(false);
          }}
        >
          {stripe ? "Continue to payment" : billing === "monthly" ? "Pay $5" : "Pay $39"}
        </button>
      </div>
    </Backdrop>
  );
}

function UpgradeDialog() {
  const { closeDialog } = useApp();
  const router = useRouter();
  return (
    <Backdrop onClose={closeDialog}>
      <span className="dialog-title" style={{ fontSize: 24 }}>Explanations by the AI coach are a Pro feature</span>
      <span className="dialog-body">Pro adds a coach that explains why your answer was wrong, chats about any topic, plans your study week and writes questions for your weak chapters.</span>
      <div className="dialog-actions">
        <button className="btn btn-ghost" onClick={closeDialog}>Not now</button>
        <button className="btn btn-primary" onClick={() => { closeDialog(); router.push("/pricing"); }}>See plans</button>
      </div>
    </Backdrop>
  );
}

function DemoBar() {
  const { tier, setDemoTier, flags } = useApp();
  const tiers: [Tier, string][] = [["guest", "Guest"], ["member", "Member"], ...(flags.pro ? [["pro", "Pro"] as [Tier, string]] : [])];
  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, display: "flex", alignItems: "center", gap: 6, background: "var(--color-neutral-900)", color: "var(--color-bg)", borderRadius: 999, padding: "6px 6px 6px 16px", zIndex: 40, boxShadow: "var(--shadow-lg)" }}>
      <span style={{ fontSize: 12, fontWeight: 600, marginRight: 4 }}>Preview as</span>
      {tiers.map(([k, label]) => (
        <button key={k} onClick={() => setDemoTier(k)} style={{ border: 0, borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: tier === k ? "var(--color-accent)" : "transparent", color: "var(--color-bg)" }}>{label}</button>
      ))}
    </div>
  );
}

export function Overlays() {
  const { dialog, toastText, flags } = useApp();
  return (
    <>
      {dialog === "login" && <LoginDialog />}
      {/* Pricing and the AI coach are hidden unless ENABLE_PRO=1. */}
      {flags.pro && dialog === "checkout" && <CheckoutDialog />}
      {flags.pro && dialog === "upgrade" && <UpgradeDialog />}
      {toastText && (
        <div role="status" style={{ position: "fixed", left: "50%", top: 20, transform: "translateX(-50%)", background: "var(--color-neutral-900)", color: "var(--color-bg)", borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 600, zIndex: 60, boxShadow: "var(--shadow-lg)" }}>{toastText}</div>
      )}
      {/* Tier switcher for local development only. */}
      {flags.devTools && <DemoBar />}
    </>
  );
}
