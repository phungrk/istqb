"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppProvider";
import { NAV, PRO_NAV } from "@/lib/nav";
import { ChevronRightIcon, MenuIcon, XIcon } from "./icons";

/** Phones: a ☰ button that opens a full-screen menu (design: First View Options 2b). */
export function MobileMenu({ active }: { active: string }) {
  const { user, flags, openLogin, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const items: (readonly [string, string])[] = [
    ["/", "Home"],
    ...NAV,
    ...(flags.pro ? PRO_NAV : []),
    ...(user?.admin ? ([["/admin", "Admin"]] as const) : []),
  ];
  const current = active === "/exam" || active === "/result" ? "/tests" : active;
  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => burger.current?.focus());
  };

  // While open: lock the page, close on Escape, move focus into the menu, close if the screen grows.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const mq = window.matchMedia("(max-width: 767px)");
    const onMq = () => !mq.matches && setOpen(false);
    addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={burger}
        type="button"
        className="btn btn-ghost hdr-burger"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>
      {open && (
        <div id="mobile-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className="mm-menu">
          <span className="mm-menu-blob mm-menu-blob-a" aria-hidden />
          <span className="mm-menu-blob mm-menu-blob-b" aria-hidden />
          <div className="mm-menu-head">
            <Link href="/" onClick={() => close(false)} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--color-text)" }}>
              <span className="mm-logo">T</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>Testpath</span>
            </Link>
            <button type="button" className="btn btn-secondary mm-menu-close" aria-label="Close menu" onClick={() => close()} data-autofocus>
              <XIcon size={22} />
            </button>
          </div>
          <nav aria-label="Main" className="mm-menu-nav">
            {items.map(([href, label]) => {
              const on = current === href;
              return (
                <Link key={href} href={href} onClick={() => close(false)} aria-current={on ? "page" : undefined} className={`mm-menu-item${on ? " is-current" : ""}`}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span>{label}</span>
                    {href === "/coach" && <span className="tag tag-accent" style={{ fontSize: 10, padding: "1px 8px", fontFamily: "var(--font-body)" }}>PRO</span>}
                  </span>
                  {on ? <span className="mm-menu-dot" aria-hidden /> : <ChevronRightIcon size={20} style={{ color: "var(--color-neutral-600)" }} />}
                </Link>
              );
            })}
          </nav>
          <div className="mm-menu-foot">
            {!user ? (
              <div className="mm-menu-card">
                <span style={{ fontSize: 14, lineHeight: 1.45, color: "var(--color-neutral-800)" }}>Sign in to save every attempt and see your readiness.</span>
                <button className="btn btn-primary btn-block" style={{ fontSize: 16, minHeight: 48, marginTop: 0 }} onClick={() => { close(false); openLogin(); }}>
                  Sign in
                </button>
              </div>
            ) : (
              <div className="mm-menu-card" style={{ flexDirection: "row", alignItems: "center" }}>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: "var(--color-accent-2-300)", color: "var(--color-accent-2-900)", display: "grid", placeItems: "center", fontWeight: 700 }}>{user.name[0]}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{user.handle}</span>
                <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => { close(false); void signOut(); }}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
