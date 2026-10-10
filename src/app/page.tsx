"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { FirstView } from "@/components/FirstView";
import { CHAPTERS, palette } from "@/lib/syllabus";

export default function HomePage() {
  const router = useRouter();
  const { openNode, flags } = useApp();
  const list = { display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-14)" } as const;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 72, paddingBottom: 24 }}>
      <FirstView />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ margin: 0 }}>Six chapters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 16 }}>
          {CHAPTERS.map((c) => {
            const p = palette(c.id);
            return (
              <button key={c.id} className="hov-shadow-md" onClick={() => openNode("c" + c.id)} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", padding: 20, border: 0, borderRadius: 28, background: p.tint, cursor: "pointer", color: "var(--color-text)" }}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", background: p.base, color: "var(--color-bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: "var(--fs-20)" }}>{c.id}</span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-17)", lineHeight: 1.2, color: p.ink }}>{c.title}</span>
                <span style={{ fontSize: "var(--fs-13)", color: p.ink }}>{c.q} exam questions</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ margin: 0 }}>What you get</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          <div className="card" style={{ padding: 26, gap: 12 }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Without an account</span>
            <span className="card-title" style={{ fontSize: "var(--fs-22)" }}>Learn and practise</span>
            <span style={list}>
              <span>Interactive syllabus mindmap</span>
              <span>Practice sets and mock exams</span>
            </span>
          </div>
          <div className="card" style={{ padding: 26, gap: 12, background: "var(--color-accent-2-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-2-800)" }}>Sign in · free</span>
            <span className="card-title" style={{ fontSize: "var(--fs-22)" }}>Track your results</span>
            <span style={list}>
              <span>Every attempt saved</span>
              <span>Score trend and mastery per chapter</span>
              <span>Mindmap study progress</span>
            </span>
          </div>
          {flags.pro && (
          <div className="card" style={{ padding: 26, gap: 12, background: "var(--color-accent-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>Pro · $5 / month</span>
            <span className="card-title" style={{ fontSize: "var(--fs-22)" }}>AI exam coach</span>
            <span style={list}>
              <span>Explains every wrong answer</span>
              <span>Chat about any syllabus topic</span>
              <span>Study plan from your weak areas</span>
              <span>Custom question sets on weak topics</span>
            </span>
            <button className="btn btn-primary" onClick={() => router.push("/pricing")} style={{ alignSelf: "flex-start", marginTop: 6 }}>See plans</button>
          </div>
          )}
        </div>
      </div>
      <p style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)" }}>
        ISTQB® is a registered trademark of the International Software Testing Qualifications Board. Testpath is an independent study tool.
      </p>
    </section>
  );
}
