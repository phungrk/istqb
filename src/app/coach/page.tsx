"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp, type CoachTab } from "@/components/AppProvider";
import { SendIcon } from "@/components/icons";
import { CHAPTERS } from "@/lib/syllabus";

const TABS: [CoachTab, string][] = [["chat", "Chat"], ["plan", "Study plan"], ["quiz", "Custom set"]];
const userBubble = { background: "var(--color-accent-200)", borderRadius: "24px 24px 6px 24px" };
const coachBubble = { background: "var(--color-surface)", borderRadius: "24px 24px 24px 6px" };

export default function CoachPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { tier, flags, weak, chat, busy, plan, coachTab, setCoachTab, quizCh, setQuizCh, sendChat, makePlan, makeQuiz, toast } = useApp();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  // Back from Stripe Checkout.
  useEffect(() => {
    if (params.get("upgraded")) {
      toast("Welcome to Pro. Your AI coach is ready.");
      router.replace("/coach");
    }
  }, [params, router, toast]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [chat, busy]);

  if (!flags.pro)
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 14, padding: "40px 0" }}>
          <span className="tag tag-accent" style={{ alignSelf: "flex-start" }}>Coming soon</span>
          <h1 style={{ margin: 0 }}>AI exam coach</h1>
          <p style={{ margin: 0, fontSize: "var(--fs-17)", color: "var(--color-neutral-800)" }}>
            The AI coach will explain wrong answers, chat about any syllabus topic, plan your study week and generate questions for your weak chapters. It is under development and will be available soon.
          </p>
        </div>
      </section>
    );

  if (tier !== "pro")
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 24 }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center", padding: "30px 0" }}>
          <div style={{ flex: "1 1 420px", maxWidth: 600, display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="tag tag-accent" style={{ alignSelf: "flex-start" }}>Pro</span>
            <h1 style={{ margin: 0 }}>An exam coach that knows where you slip</h1>
            <p style={{ margin: 0, fontSize: "var(--fs-17)", color: "var(--color-neutral-800)" }}>It reads your results, explains each wrong answer, answers your questions about the syllabus, plans your week and writes new questions for your weakest chapters.</p>
            <button className="btn btn-primary" onClick={() => router.push("/pricing")} style={{ alignSelf: "flex-start", fontSize: "var(--fs-16)", padding: "12px 22px" }}>Upgrade to Pro</button>
          </div>
          <div aria-hidden style={{ flex: "0 1 340px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ ...userBubble, alignSelf: "flex-end", padding: "12px 16px", fontSize: "var(--fs-14)", maxWidth: 280 }}>Why is 17 a boundary value for ages 18–65?</span>
            <span style={{ ...coachBubble, alignSelf: "flex-start", padding: "12px 16px", fontSize: "var(--fs-14)", maxWidth: 300 }}>With 2-value BVA you test each boundary and its nearest neighbour outside the range. 17 is the closest invalid value below 18…</span>
          </div>
        </div>
      </section>
    );

  const qch = quizCh ?? weak[0].id;
  const suggestions = [`Explain the hardest idea in Chapter ${weak[0].id}`, "Confirmation vs regression testing?", "How do I approach K3 questions?"];
  const panel = { background: "var(--color-neutral-100)", borderRadius: 32, padding: 28, display: "flex", flexDirection: "column", gap: 16, maxWidth: 820 } as const;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ margin: "0 0 6px" }}>AI coach</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>
            Weakest chapters from your results: {weak.map((c) => `${c.id} · ${c.title}${c.pct !== null ? ` (${c.pct}%)` : ""}`).join(", ")}
          </p>
        </div>
        <div role="tablist" style={{ display: "flex", background: "var(--color-surface)", borderRadius: 999, padding: 4, gap: 4 }}>
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={coachTab === k} onClick={() => setCoachTab(k)} style={{ border: 0, borderRadius: 999, padding: "9px 18px", fontWeight: 600, fontSize: "var(--fs-14)", cursor: "pointer", background: coachTab === k ? "var(--color-accent)" : "transparent", color: coachTab === k ? "var(--color-bg)" : "var(--color-text)" }}>{label}</button>
          ))}
        </div>
      </div>

      {coachTab === "chat" && (
        <div style={{ background: "var(--color-neutral-100)", borderRadius: 32, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div ref={scroller} aria-live="polite" style={{ minHeight: 320, maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {!chat.length && !busy && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-22)" }}>Ask anything about the CTFL syllabus</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map((t) => (
                    <button key={t} className="tag tag-accent" onClick={() => sendChat(t)} style={{ border: 0, cursor: "pointer", fontSize: "var(--fs-13)", padding: "7px 14px" }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{ ...(m.role === "user" ? userBubble : coachBubble), alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "78%", padding: "12px 16px", fontSize: "var(--fs-15)", whiteSpace: "pre-wrap" }}>{m.text}</div>
            ))}
            {busy && <div style={{ alignSelf: "flex-start", background: "var(--color-surface)", borderRadius: 24, padding: "12px 16px", fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>Coach is thinking…</div>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void sendChat(input); setInput(""); }} style={{ display: "flex", gap: 10 }}>
            <input className="input" aria-label="Message" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. What's the difference between confirmation and regression testing?" style={{ flex: 1, minHeight: 44 }} />
            <button className="btn btn-primary btn-icon" type="submit" style={{ width: 44, height: 44 }} aria-label="Send"><SendIcon /></button>
          </form>
        </div>
      )}

      {coachTab === "plan" && (
        <div style={panel}>
          <h3 style={{ margin: 0 }}>Study plan from your weak areas</h3>
          <p style={{ margin: 0, color: "var(--color-neutral-800)" }}>The coach looks at your mastery per chapter and builds a 7-day plan, heavier on the chapters where you lose most points.</p>
          <button className="btn btn-primary" onClick={makePlan} disabled={busy} style={{ alignSelf: "flex-start" }}>{busy ? "Building your plan…" : plan ? "Rebuild plan" : "Build my 7-day plan"}</button>
          {plan && <div style={{ background: "var(--color-surface)", borderRadius: 24, padding: 22, whiteSpace: "pre-wrap", fontSize: "var(--fs-15)", lineHeight: 1.6 }}>{plan}</div>}
        </div>
      )}

      {coachTab === "quiz" && (
        <div style={panel}>
          <h3 style={{ margin: 0 }}>Custom question set</h3>
          <p style={{ margin: 0, color: "var(--color-neutral-800)" }}>Pick a chapter. The coach writes 5 new exam-style questions with explanations, in practice mode.</p>
          <div role="radiogroup" aria-label="Chapter" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CHAPTERS.map((c) => {
              const on = qch === c.id;
              return (
                <button key={c.id} role="radio" aria-checked={on} onClick={() => setQuizCh(c.id)} style={{ border: `2px solid ${on ? "var(--color-accent)" : "var(--color-divider)"}`, background: on ? "var(--color-accent-100)" : "var(--color-bg)", borderRadius: 999, padding: "8px 16px", cursor: "pointer", fontSize: "var(--fs-14)", fontWeight: 600, color: "var(--color-text)" }}>
                  {c.id} · {c.title}{weak[0].id === c.id ? " (weakest)" : ""}
                </button>
              );
            })}
          </div>
          <button className="btn btn-primary" onClick={makeQuiz} disabled={busy} style={{ alignSelf: "flex-start" }}>{busy ? "Writing questions…" : "Generate 5 questions"}</button>
        </div>
      )}
    </section>
  );
}
