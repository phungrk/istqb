"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { CheckIcon } from "@/components/icons";

export default function PricingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { tier, setDialog, setPending } = useApp();
  const logged = tier !== "guest";
  const pro = tier === "pro";

  // Back from Google sign-in started by "Upgrade to Pro".
  useEffect(() => {
    if (params.get("checkout") && tier === "member") setDialog("checkout");
    if (params.get("checkout")) router.replace("/pricing");
  }, [params, router, setDialog, tier]);

  const plans = [
    { kicker: "No account", name: "Guest", price: "Free", per: "", features: ["Syllabus mindmap", "Practice sets and mock exams", "Instant answers and explanations"], cta: tier === "guest" ? "Current plan" : "Included", disabled: true, primary: false, action: () => {}, bg: "var(--color-neutral-100)", shadow: "none" },
    { kicker: "Sign in with Gmail", name: "Member", price: "Free", per: "", features: ["Everything in Guest", "Every attempt saved", "Score trend and chapter mastery", "Mindmap study progress"], cta: tier === "member" ? "Current plan" : logged ? "Included" : "Sign in with Gmail", disabled: logged, primary: false, action: () => setDialog("login"), bg: "var(--color-accent-2-100)", shadow: "none" },
    {
      kicker: "Most help", name: "Pro", price: "$5", per: "/ month",
      features: ["Everything in Member", "AI explanations for wrong answers", "Chat with the AI coach", "Study plan from your weak areas", "AI question sets on weak topics"],
      cta: pro ? "Current plan" : "Upgrade to Pro", disabled: pro, primary: true,
      action: () => { if (logged) setDialog("checkout"); else { setPending("checkout"); setDialog("login"); } },
      bg: "var(--color-accent-100)", shadow: "var(--shadow-md)",
    },
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
      <div style={{ maxWidth: 620 }}>
        <h1 style={{ margin: "0 0 8px" }}>Plans</h1>
        <p style={{ margin: 0, fontSize: 17, color: "var(--color-neutral-800)" }}>Studying is free. Pay only if you want the AI coach.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, alignItems: "stretch" }}>
        {plans.map((p) => (
          <div key={p.name} className="card" style={{ padding: 30, gap: 14, background: p.bg, boxShadow: p.shadow }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>{p.kicker}</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 28 }}>{p.name}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 44, lineHeight: 1 }}>{p.price}</span>
              <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{p.per}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, paddingTop: 6 }}>
              {p.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "flex-start" }}>
                  <CheckIcon size={16} stroke="var(--color-accent-2-700)" style={{ flex: "none", marginTop: 2 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button className={"btn " + (p.primary ? "btn-primary" : "btn-secondary")} onClick={p.action} disabled={p.disabled} style={{ padding: "12px 20px", fontSize: 15 }}>{p.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
