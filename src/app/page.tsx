"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { CHAPTERS, palette } from "@/lib/syllabus";

export default function HomePage() {
  const router = useRouter();
  const { openNode, flags } = useApp();
  const list = { display: "flex", flexDirection: "column", gap: 8, fontSize: 14 } as const;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 72, paddingTop: 40 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
        <div style={{ flex: "1 1 480px", maxWidth: 620 }}>
          <span className="tag tag-accent-2">ISTQB® CTFL · Syllabus v4.0.1</span>
          <h1 style={{ fontSize: 56, margin: "18px 0 18px", textWrap: "pretty" }}>Pass the Foundation Level exam with a map, not a pile of notes.</h1>
          <p style={{ fontSize: 18, color: "var(--color-neutral-800)", maxWidth: 520, textWrap: "pretty" }}>
            Study the whole syllabus as a mindmap, then test yourself on practice sets and timed mock exams. No account needed to start.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <button className="btn btn-primary" onClick={() => router.push("/mindmap")} style={{ fontSize: 16, padding: "12px 22px" }}>Open the mindmap</button>
            <button className="btn btn-secondary" onClick={() => router.push("/tests")} style={{ fontSize: 16, padding: "12px 22px" }}>Take a practice test</button>
          </div>
        </div>
        <div aria-hidden style={{ flex: "0 1 380px", position: "relative", height: 360, minWidth: 300 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 300, borderRadius: "50%", background: "var(--color-accent-200)" }} />
          <div style={{ position: "absolute", right: 0, bottom: 0, width: 180, height: 180, borderRadius: "50%", background: "var(--color-accent-2-300)" }} />
          <div style={{ position: "absolute", left: 48, top: 70, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 72, lineHeight: 1, color: "var(--color-accent-800)" }}>40</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-accent-900)" }}>questions in 60 minutes</span>
          </div>
          <div style={{ position: "absolute", right: 36, bottom: 56, display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 40, lineHeight: 1, color: "var(--color-accent-2-900)" }}>65%</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent-2-900)" }}>to pass</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ margin: 0 }}>Six chapters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 16 }}>
          {CHAPTERS.map((c) => {
            const p = palette(c.id);
            return (
              <button key={c.id} className="hov-shadow-md" onClick={() => openNode("c" + c.id)} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", padding: 20, border: 0, borderRadius: 28, background: p.tint, cursor: "pointer", color: "var(--color-text)" }}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", background: p.base, color: "var(--color-bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 20 }}>{c.id}</span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.2, color: p.ink }}>{c.title}</span>
                <span style={{ fontSize: 13, color: p.ink }}>{c.q} exam questions</span>
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
            <span className="card-title" style={{ fontSize: 22 }}>Learn and practise</span>
            <span style={list}>
              <span>Interactive syllabus mindmap</span>
              <span>Practice sets and mock exams</span>
            </span>
          </div>
          <div className="card" style={{ padding: 26, gap: 12, background: "var(--color-accent-2-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-2-800)" }}>Sign in · free</span>
            <span className="card-title" style={{ fontSize: 22 }}>Track your results</span>
            <span style={list}>
              <span>Every attempt saved</span>
              <span>Score trend and mastery per chapter</span>
              <span>Mindmap study progress</span>
            </span>
          </div>
          {flags.pro && (
          <div className="card" style={{ padding: 26, gap: 12, background: "var(--color-accent-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>Pro · $5 / month</span>
            <span className="card-title" style={{ fontSize: 22 }}>AI exam coach</span>
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
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
        ISTQB® is a registered trademark of the International Software Testing Qualifications Board. Testpath is an independent study tool.
      </p>
    </section>
  );
}
