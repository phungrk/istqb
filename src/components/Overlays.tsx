"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, type Tier } from "./AppProvider";

const DEMO = { name: "Linh Nguyen", email: "linh.nguyen@gmail.com" };
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

const accountRow = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 999, border: "2px solid var(--color-divider)", background: "var(--color-bg)", cursor: "pointer", textAlign: "left", color: "var(--color-text)" } as const;

function LoginDialog() {
  const { flags, closeDialog, loginDemo, loginGoogle, toast } = useApp();
  const [email, setEmail] = useState("");
  return (
    <Backdrop width={420} onClose={closeDialog}>
      <span className="dialog-title" style={{ fontSize: 24 }}>Sign in with Gmail</span>
      <span className="dialog-body">Choose a Google account to continue to Testpath. We only read your name and email address.</span>
      {flags.auth === "google" ? (
        <>
          <button className="hov-border-accent" onClick={loginGoogle} style={accountRow}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-900)", display: "grid", placeItems: "center", fontWeight: 700 }}>G</span>
            <span style={{ fontWeight: 600 }}>Continue with Google</span>
          </button>
          <div className="dialog-actions">
            <button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <button className="hov-border-accent" onClick={() => loginDemo(DEMO.email)} style={accountRow}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-900)", display: "grid", placeItems: "center", fontWeight: 700 }}>L</span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
              <span style={{ fontWeight: 600 }}>{DEMO.name}</span>
              <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{DEMO.email}</span>
            </span>
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = email.trim();
              if (!/^[^@\s]+@gmail\.com$/i.test(v)) return toast("Please enter a Gmail address");
              void loginDemo(v.toLowerCase());
              setEmail("");
            }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div className="field">
              <label htmlFor="login-email">Use another Gmail address</label>
              <input id="login-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" style={{ minHeight: 44 }} />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>
              <button className="btn btn-primary" type="submit">Continue</button>
            </div>
          </form>
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
  const { tier, setDemoTier } = useApp();
  const tiers: [Tier, string][] = [["guest", "Guest"], ["member", "Member"], ["pro", "Pro"]];
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
      {dialog === "checkout" && <CheckoutDialog />}
      {dialog === "upgrade" && <UpgradeDialog />}
      {toastText && (
        <div role="status" style={{ position: "fixed", left: "50%", top: 20, transform: "translateX(-50%)", background: "var(--color-neutral-900)", color: "var(--color-bg)", borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 600, zIndex: 60, boxShadow: "var(--shadow-lg)" }}>{toastText}</div>
      )}
      {/* Tier switcher exists only while sign-in runs in demo mode. */}
      {flags.auth === "demo" && <DemoBar />}
    </>
  );
}
