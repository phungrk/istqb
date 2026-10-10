"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Flag, Insights, QuestionStat } from "@/server/insights";

const FLAG: Record<Flag, { label: string; tip: string; strong?: boolean }> = {
  "wrong-key": { label: "Check answer key", tip: "A wrong option is picked more often than a correct one", strong: true },
  "neg-disc": { label: "Misleads strong learners", tip: "People who do well on the rest of the test get this one wrong more often", strong: true },
  "too-hard": { label: "Very hard", tip: "Fewer than 25% answer correctly" },
  "too-easy": { label: "Very easy", tip: "More than 95% answer correctly" },
  "dead-distractor": { label: "Unused option", tip: "A wrong option nobody picks" },
};

const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
const num = (n: number) => n.toLocaleString();

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--color-neutral-100)", borderRadius: 24, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-heading)", fontSize: 30, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{sub}</span>}
    </div>
  );
}

/** A horizontal meter: one hue, value labelled in text, hover title for the exact numbers. */
function Meter({ share, title, tone = "accent" }: { share: number; title: string; tone?: "accent" | "good" | "muted" }) {
  const fill = tone === "good" ? "var(--color-accent-2)" : tone === "muted" ? "var(--color-neutral-400)" : "var(--color-accent)";
  return (
    <span title={title} style={{ display: "block", height: 10, borderRadius: 4, background: "var(--color-neutral-200)", overflow: "hidden" }}>
      <span style={{ display: "block", height: "100%", width: `${Math.max(share > 0 ? 2 : 0, share * 100)}%`, background: fill, borderRadius: 4 }} />
    </span>
  );
}

const section = { display: "flex", flexDirection: "column", gap: 12 } as const;
const card = { background: "var(--color-neutral-100)", borderRadius: 28, padding: "16px 20px" } as const;

export function InsightsView({ data }: { data: Insights }) {
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [q, setQ] = useState("");
  const shown = useMemo(
    () => data.questions.filter((s) => (!flaggedOnly || s.flags.length) && (!chapter || s.chapter === chapter) && (!q || s.id.includes(q) || s.stem.toLowerCase().includes(q.toLowerCase()))),
    [data.questions, flaggedOnly, chapter, q],
  );
  const flagged = data.questions.filter((s) => s.flags.length).length;
  const top = Math.max(1, data.funnel[0].n);
  const dayMax = Math.max(1, ...data.daily.map((d) => d.visitors));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ margin: "0 0 6px" }}>Insights</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>
            Anonymous usage from the last {data.days} days · {num(data.events)} events. Visitors with Do Not Track on are not counted.
          </p>
        </div>
        <div role="group" aria-label="Time range" style={{ display: "flex", background: "var(--color-surface)", borderRadius: 999, padding: 4, gap: 4 }}>
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin?tab=insights&days=${d}`} aria-current={d === data.days ? "true" : undefined}
              style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: "none", background: d === data.days ? "var(--color-text)" : "transparent", color: d === data.days ? "var(--color-bg)" : "var(--color-text)" }}>
              {d} days
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Tile label="Visitors" value={num(data.tiles.visitors)} sub={`${num(data.tiles.returning)} came back another day`} />
        <Tile label="Tests finished" value={num(data.tiles.submitted)} sub={`of ${num(data.tiles.started)} started`} />
        <Tile label="Completion" value={pct(data.tiles.completion)} sub="finished ÷ started" />
        <Tile label="New accounts" value={num(data.tiles.signups)} />
        <Tile label="Flagged questions" value={num(flagged)} sub={`of ${num(data.questions.length)} with answers`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div style={{ ...card, ...section }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Funnel</h2>
          {data.funnel.map((f) => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 54px 44px", gap: 10, alignItems: "center", fontSize: 14 }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <span>{f.label}</span>
                <Meter share={f.n / top} title={`${f.label}: ${f.n} of ${data.funnel[0].n} visitors`} />
              </span>
              <span style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{num(f.n)}</span>
              <span style={{ textAlign: "right", fontSize: 12, color: "var(--color-neutral-700)", fontVariantNumeric: "tabular-nums" }}>{pct(f.n / top)}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card, ...section }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Visitors per day</h2>
          <div role="img" aria-label="Visitors per day" style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>
            {data.daily.map((d) => (
              <span key={d.day} title={`${d.day}: ${d.visitors} visitors, ${d.submitted} tests finished`} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end" }}>
                <span style={{ width: "100%", height: `${(d.visitors / dayMax) * 100}%`, minHeight: d.visitors ? 3 : 0, background: "var(--color-accent)", borderRadius: "4px 4px 0 0" }} />
              </span>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-neutral-700)" }}>
            <span>{data.daily[0]?.day.slice(5)}</span>
            <span>{data.daily.at(-1)?.day.slice(5)}</span>
          </div>
          <details>
            <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--color-neutral-700)" }}>Show as table</summary>
            <table className="table" style={{ width: "100%", fontSize: 13, marginTop: 8 }}>
              <thead><tr><th style={{ textAlign: "left" }}>Day</th><th style={{ textAlign: "right" }}>Visitors</th><th style={{ textAlign: "right" }}>Tests finished</th></tr></thead>
              <tbody>{data.daily.map((d) => <tr key={d.day}><td>{d.day}</td><td style={{ textAlign: "right" }}>{d.visitors}</td><td style={{ textAlign: "right" }}>{d.submitted}</td></tr>)}</tbody>
            </table>
          </details>
        </div>
      </div>

      <div style={section}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Questions</h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-neutral-700)" }}>
              From finished tests, re-scored on the server. Flags need at least 10 answers. <strong>Correct</strong> = share answering right; <strong>Discrimination</strong> &gt; 0.2 is healthy, below 0 means strong learners miss it.
            </p>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} /> Flagged only
          </label>
          <select className="input" value={chapter} onChange={(e) => setChapter(Number(e.target.value))} aria-label="Chapter" style={{ minHeight: 38, width: 140 }}>
            <option value={0}>All chapters</option>
            {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>Chapter {c}</option>)}
          </select>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id or text" aria-label="Search questions" style={{ minHeight: 38, width: 200 }} />
        </div>
        {shown.length === 0 ? (
          <p style={{ ...card, margin: 0, color: "var(--color-neutral-700)" }}>{data.questions.length ? "No questions match." : "No finished tests yet in this period. Item statistics appear as people take tests."}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shown.slice(0, 200).map((s) => <QuestionRow key={s.id} s={s} />)}
            {shown.length > 200 && <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Showing 200 of {shown.length}. Narrow the filter to see more.</p>}
          </div>
        )}
      </div>

      <div style={section}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Mindmap topics</h2>
        <div style={{ ...card, overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", minWidth: 520, fontSize: 14 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Topic</th><th style={{ textAlign: "right" }}>Opened</th><th style={{ textAlign: "right" }}>Marked learned</th><th style={{ textAlign: "right" }}>Syllabus LOs opened</th></tr></thead>
            <tbody>
              {data.topics.map((t) => (
                <tr key={t.id}><td>{t.label}</td><td style={{ textAlign: "right" }}>{t.opens}</td><td style={{ textAlign: "right" }}>{t.learned}</td><td style={{ textAlign: "right" }}>{t.loExpands}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function QuestionRow({ s }: { s: QuestionStat }) {
  const strong = s.flags.some((f) => FLAG[f].strong);
  return (
    <details style={{ background: "var(--color-neutral-100)", borderRadius: 20, padding: "12px 16px", border: strong ? "2px solid var(--color-accent-400)" : "2px solid transparent" }}>
      <summary style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
            <strong style={{ color: "var(--color-text)" }}>{s.id}</strong> · Ch {s.chapter}{s.lo ? ` · LO ${s.lo}` : ""}
          </span>
          <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.stem}</span>
          {s.flags.length > 0 && (
            <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {s.flags.map((f) => (
                <span key={f} title={FLAG[f].tip} className={FLAG[f].strong ? "tag tag-accent" : "tag tag-neutral"} style={{ fontSize: 11, padding: "2px 9px" }}>
                  {FLAG[f].strong ? "⚠ " : ""}{FLAG[f].label}
                </span>
              ))}
            </span>
          )}
        </span>
        <span style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "0 16px", fontSize: 12, textAlign: "right", color: "var(--color-neutral-700)" }}>
          <span>Answers</span><span>Correct</span><span>Discrim.</span>
          <strong style={{ fontSize: 15, color: "var(--color-text)" }}>{s.n}</strong>
          <strong style={{ fontSize: 15, color: "var(--color-text)" }}>{pct(s.p)}</strong>
          <strong style={{ fontSize: 15, color: "var(--color-text)" }}>{s.r === null ? "—" : s.r.toFixed(2)}</strong>
        </span>
      </summary>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        <p style={{ margin: 0, fontSize: 14 }}>{s.stem}</p>
        {s.options.map((o, i) => {
          const right = s.correct.includes(i);
          const share = s.n ? s.picks[i] / s.n : 0;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 120px 70px", gap: 10, alignItems: "center", fontSize: 13 }}>
              <span>
                <strong>{"ABCDE"[i]}.</strong> {o} {right && <span className="tag tag-accent-2" style={{ fontSize: 10, padding: "1px 7px" }}>✓ correct</span>}
              </span>
              <Meter share={share} tone={right ? "good" : "muted"} title={`${"ABCDE"[i]}: picked by ${s.picks[i]} of ${s.n}`} />
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.picks[i]} · {pct(share)}</span>
            </div>
          );
        })}
        <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
          Left blank: {s.blank} · Median time: {s.medianSec === null ? "—" : `${Math.round(s.medianSec)}s`}
        </span>
      </div>
    </details>
  );
}
