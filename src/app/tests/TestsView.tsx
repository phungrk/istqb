"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { SIZES, levelDistribution, minutesFor, pad2, specTitle, type LevelCounts, type Mode, type SetSpec } from "@/lib/questions";
import { CHAPTERS, palette } from "@/lib/syllabus";
import { pct } from "@/lib/stats";

const MODES: [Mode, string][] = [["practice", "Practice"], ["mock", "Mock exam"]];

const LEVEL_SUB: Record<number, string> = {
  10: "A quick check across all six chapters.",
  20: "Half an exam, weighted like the real one.",
  40: "Full exam format: 40 questions in the syllabus mix.",
};

const upsell = { display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", border: "2px dashed var(--color-accent-2-300)", borderRadius: 28, padding: "20px 24px" } as const;

export function TestsView({ counts, levels }: { counts: Record<number, number>; levels: LevelCounts }) {
  const router = useRouter();
  const { tier, attempts, mode, setMode, startSet, openLogin, setCoachTab, flags } = useApp();
  const logged = tier !== "guest";
  const pro = tier === "pro";

  const best: Record<string, number> = {};
  for (const a of attempts) best[a.title] = Math.max(best[a.title] || 0, pct(a));
  const bestOf = (spec: SetSpec) => (logged ? best[specTitle(spec)] : undefined);
  const timing = (n: number) => `${n} questions${mode === "mock" ? ` · ${minutesFor(n)} min` : ""}`;
  const mix = (n: number) =>
    Object.entries(levelDistribution(n))
      .filter(([, k]) => k)
      .map(([ch, k]) => `Ch${ch}×${k}`)
      .join(" · ");
  const memberTotal = levels.short + levels.medium + levels.long;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px" }}>
          <h1 style={{ margin: "0 0 6px" }}>Practice tests</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)", maxWidth: 560 }}>
            {mode === "practice"
              ? "Practice mode: no timer, and you see the right answer and explanation after each question."
              : "Mock exam mode: timed like the real exam, answers revealed only when you submit."}{" "}
            {logged ? "Each numbered test keeps the same questions, so you can retake it and see your best score." : "Every start draws a new set from the question bank."}
          </p>
        </div>
        <div role="radiogroup" aria-label="Mode" style={{ display: "flex", background: "var(--color-surface)", borderRadius: 999, padding: 4, gap: 4 }}>
          {MODES.map(([k, label]) => (
            <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)} style={{ border: 0, borderRadius: 999, padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", background: mode === k ? "var(--color-accent)" : "transparent", color: mode === k ? "var(--color-bg)" : "var(--color-text)" }}>{label}</button>
          ))}
        </div>
      </div>

      {!logged && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "var(--color-accent-2-100)", borderRadius: 28, padding: "16px 22px" }}>
          <span style={{ flex: "1 1 300px", fontSize: 14, color: "var(--color-accent-2-900)", textWrap: "pretty" }}>
            You can take any test below now, but results are not saved. Create a free account to track your progress and unlock {memberTotal} level tests.
          </span>
          <button className="btn btn-secondary" onClick={openLogin}>Create a free account</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>By level</h2>
          <p style={{ margin: 0, color: "var(--color-neutral-700)", fontSize: 14 }}>Questions from all six chapters in the real exam&apos;s proportions (8/6/4/11/9/2).</p>
        </div>
        {logged ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {SIZES.map(({ size, label }) => (
              <LevelGroup key={size} size={size} label={label} sub={LEVEL_SUB[size]} levels={levels} best={best} onStart={(spec) => startSet(spec)} />
            ))}
          </div>
        ) : (
        <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {SIZES.map(({ size, label }) => {
            const spec: SetSpec = { kind: "level", size };
            const b = bestOf(spec);
            return (
              <div key={size} className="card" style={{ padding: 24, gap: 10, background: "var(--color-surface)" }}>
                <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Level</span>
                <span className="card-title" style={{ fontSize: 22 }}>{label}</span>
                <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>{LEVEL_SUB[size]}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{mix(size)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: "auto", paddingTop: 10 }}>
                  <span className="tag tag-neutral">{timing(size)}</span>
                  {b !== undefined && <span className="tag tag-accent-2">Best {b}%</span>}
                  <button className="btn btn-primary" onClick={() => startSet(spec)} style={{ marginLeft: "auto" }}>Start</button>
                </div>
              </div>
            );
          })}
          {flags.pro && (
          <div className="card" style={{ padding: 24, gap: 10, background: "var(--color-accent-100)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-800)" }}>Pro · AI generated</span>
            <span className="card-title" style={{ fontSize: 22 }}>A set built from your weak topics</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>The coach writes new questions for the chapters where you score lowest.</span>
            <button
              className="btn btn-primary"
              onClick={() => { if (pro) { setCoachTab("quiz"); router.push("/coach"); } else router.push("/pricing"); }}
              style={{ alignSelf: "flex-start", marginTop: "auto" }}
            >
              {pro ? "Create a set" : "Unlock with Pro"}
            </button>
          </div>
          )}
        </div>
        <div style={upsell}>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--color-accent-2-900)" }}>Want more than three tests?</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-800)", textWrap: "pretty" }}>
              Members get {levels.short} Short, {levels.medium} Medium and {levels.long} full Long tests. Every result is saved, so you can see which chapters are improving.
            </span>
          </div>
          <button className="btn btn-primary" onClick={openLogin}>Create a free account</button>
        </div>
        </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>By chapter</h2>
          <p style={{ margin: 0, color: "var(--color-neutral-700)", fontSize: 14 }}>Pick a chapter and a length. Questions are drawn at random from that chapter.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {CHAPTERS.map((c) => {
            const p = palette(c.id);
            const avail = counts[c.id] ?? 0;
            const bests = SIZES.map(({ size }) => bestOf({ kind: "chapter", chapter: c.id, size })).filter((x): x is number => x !== undefined);
            return (
              <div key={c.id} className="card" style={{ padding: 24, gap: 12, background: p.tint }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", background: p.base, color: "var(--color-bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: 18 }}>{c.id}</span>
                  <span className="card-title" style={{ fontSize: 19, color: p.ink }}>{c.title}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="tag tag-neutral">{avail} questions in the bank</span>
                  <span style={{ fontSize: 12, color: p.ink }}>{c.q} on the exam</span>
                  {bests.length > 0 && <span className="tag tag-accent-2">Best {Math.max(...bests)}%</span>}
                </div>
                <div role="group" aria-label={`Start a Chapter ${c.id} test`} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: "auto" }}>
                  {SIZES.map(({ size, label }) => !logged && size > 10 ? (
                    <button
                      key={size}
                      className="btn btn-ghost"
                      onClick={openLogin}
                      title="Create a free account to unlock"
                      style={{ border: `2px dashed ${p.ink}`, opacity: 0.6, display: "flex", flexDirection: "column", gap: 0, lineHeight: 1.15, padding: "8px 6px", minWidth: 0, color: p.ink }}
                    >
                      <span>{label}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}>Members</span>
                    </button>
                  ) : (
                    <button
                      key={size}
                      className="btn btn-secondary"
                      disabled={avail < size}
                      title={mode === "mock" ? `${minutesFor(size)} minutes` : undefined}
                      onClick={() => startSet({ kind: "chapter", chapter: c.id, size })}
                      style={{ background: "var(--color-bg)", display: "flex", flexDirection: "column", gap: 0, lineHeight: 1.15, padding: "8px 6px", minWidth: 0 }}
                    >
                      <span>{label}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--color-neutral-700)" }}>{size} questions</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {!logged && (
          <div style={upsell}>
            <span style={{ flex: "1 1 320px", fontSize: 14, color: "var(--color-neutral-800)", textWrap: "pretty" }}>
              Guests can take Short chapter tests. Create a free account to unlock Medium and Long tests for every chapter.
            </span>
            <button className="btn btn-primary" onClick={openLogin}>Create a free account</button>
          </div>
        )}
      </div>
    </section>
  );
}

const SHOWN = 12;

/** Member view of one level: numbered tests as tiles, the next untaken one a click away. */
function LevelGroup({ size, label, sub, levels, best, onStart }: { size: 10 | 20 | 40; label: string; sub: string; levels: LevelCounts; best: Record<string, number>; onStart: (spec: SetSpec) => void }) {
  const [open, setOpen] = useState(false);
  const isLong = size === 40;
  const count = isLong ? levels.long : size === 10 ? levels.short : levels.medium;
  const tests = Array.from({ length: count }, (_, i) => {
    const spec: SetSpec = isLong ? { kind: "long", n: i + 1 } : { kind: "numbered", size, n: i + 1 };
    const title = specTitle(spec);
    return { n: pad2(i + 1), spec, title, best: best[title] as number | undefined };
  });
  const done = tests.filter((t) => t.best !== undefined).length;
  const next = tests.find((t) => t.best === undefined) ?? tests[0];
  const shown = open ? tests : tests.slice(0, SHOWN);

  return (
    <div className="card" style={{ padding: 24, gap: 18, background: "var(--color-surface)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Level · {size} questions</span>
          <span className="card-title" style={{ fontSize: 24 }}>{label}</span>
          <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>{sub}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 28, lineHeight: 1 }}>
            {count} <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-neutral-700)" }}>tests</span>
          </span>
          <span className="tag tag-neutral">{isLong ? `${count} tests set by admin` : `${levels.bankTotal} in bank ÷ ${size} = ${count}`}</span>
          <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{done} of {count} taken</span>
        </div>
      </div>
      {count > 0 && (
        <>
          <div role="list" aria-label={`${label} tests`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))", gap: 8 }}>
            {shown.map((t) => {
              const has = t.best !== undefined;
              return (
                <button
                  key={t.n}
                  role="listitem"
                  className="hov-border-accent"
                  onClick={() => onStart(t.spec)}
                  title={t.title}
                  aria-label={`${t.title}${has ? `, best ${t.best}%` : ", not taken yet"}`}
                  style={{ border: `2px solid ${has ? "var(--color-accent-2-300)" : "transparent"}`, background: has ? "var(--color-accent-2-100)" : "var(--color-bg)", borderRadius: 20, padding: "10px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "var(--font-body)", color: "var(--color-text)" }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>{t.n}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: has ? "var(--color-accent-2-800)" : "var(--color-neutral-700)" }}>{has ? `Best ${t.best}%` : `${size}q`}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => onStart(next.spec)}>Start test {next.n}</button>
            {count > SHOWN && <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Show fewer" : `Show all ${count}`}</button>}
          </div>
        </>
      )}
    </div>
  );
}
