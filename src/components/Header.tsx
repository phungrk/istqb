"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { savedPassword, useApp } from "./AppProvider";
import { EyeIcon, EyeOffIcon } from "./icons";

const NAV = [
  ["/mindmap", "Mindmap"],
  ["/tests", "Practice tests"],
  ["/dashboard", "Dashboard"],
] as const;
/** Shown only when pricing and the AI coach are enabled (ENABLE_PRO=1). */
const PRO_NAV = [
  ["/coach", "AI Coach"],
  ["/pricing", "Pricing"],
] as const;

export function Header() {
  const { user, tier, flags, openLogin, signOut } = useApp();
  const pathname = usePathname();
  // Read after mount: the password lives in this browser only, not in the server render.
  const [pw, setPw] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  useEffect(() => {
    setPw(user ? savedPassword(user.handle) : null);
    setShowPw(false);
  }, [user]);
  // Exam and Result belong to Practice tests.
  const active = pathname === "/exam" || pathname === "/result" ? "/tests" : pathname;

  return (
    <header style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)" }}>
        <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-accent)", display: "grid", placeItems: "center", color: "var(--color-bg)", fontFamily: "var(--font-heading)", fontSize: 18 }}>T</span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>Testpath</span>
      </Link>
      <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", marginLeft: 12, flex: "1 1 auto", minWidth: 0 }}>
        {[...NAV, ...(flags.pro ? PRO_NAV : []), ...(user?.admin ? ([["/admin", "Admin"]] as const) : [])].map(([href, label]) => {
          const on = active === href;
          return (
            <Link
              key={href}
              href={href}
              className="hov-nav"
              style={{ display: "flex", alignItems: "center", gap: 6, background: on ? "var(--color-accent-200)" : "transparent", color: on ? "var(--color-accent-900)" : "var(--color-text)", borderRadius: 999, padding: "8px 14px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            >
              <span>{label}</span>
              {href === "/coach" && <span className="tag tag-accent" style={{ padding: "1px 8px", fontSize: 10 }}>PRO</span>}
            </Link>
          );
        })}
      </nav>
      {!user ? (
        <button className="btn btn-primary" onClick={openLogin}>Sign in</button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-900)", display: "grid", placeItems: "center", fontWeight: 700 }}>{user.name[0]}</span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.handle}</span>
            {pw ? (
              <span style={{ fontSize: 12, color: "var(--color-neutral-600)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "ui-monospace, monospace" }}>pw:&nbsp;{showPw ? pw : "••••••••"}</span>
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--color-neutral-600)", display: "flex", alignItems: "center" }}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{user.admin ? "Admin" : tier === "pro" ? "Pro member" : flags.pro ? "Member · free" : "Member"}</span>
            )}
          </div>
          <button className="btn btn-ghost" onClick={signOut} style={{ fontSize: 13 }}>Sign out</button>
        </div>
      )}
    </header>
  );
}
