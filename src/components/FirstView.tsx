"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Phone fit, as a plain-JS body so the same code runs inline during SSR parsing (no flash before
 * hydration) and from the layout effect. Reference: a 393px-wide phone, where the loop is 350px
 * and sits 58px under the title. Fills the screen down to the CTA; when the height runs short it
 * first squeezes the title→loop gap (down to 8px), then shrinks the loop.
 */
const FIT_JS = `
var W = innerWidth, H = innerHeight, st = s.style;
if (W > 767) { st.removeProperty("--fv-z"); st.removeProperty("--fv-gap"); st.removeProperty("--fv-min"); return; }
var t = s.querySelector(".fv-title"), c = s.querySelector(".fv-cta-sm");
if (!t || !c) return;
var k = parseFloat(getComputedStyle(t).fontSize) / 32, y = scrollY;
var top = s.getBoundingClientRect().top + y;
// offsetTop ignores the title's intro translate; title and section share an offsetParent.
var avail = H - (top + t.offsetTop - s.offsetTop + t.offsetHeight) - c.offsetHeight;
var z = Math.min(k, (s.clientWidth - 8) / 350), gap = 58 * k;
if (avail < 350 * z + gap) { gap = Math.max(8, avail - 350 * z); if (avail < 350 * z + gap) z = Math.max(0.5, (avail - gap) / 350); }
st.setProperty("--fv-z", z.toFixed(4));
st.setProperty("--fv-gap", gap.toFixed(1) + "px");
st.setProperty("--fv-min", Math.max(0, H - top) + "px");
`;

/**
 * Home first view, option 1c "Learn → Test → Fix" (design: First View Options #1c, phone #2a).
 * The loop's numbers are a static illustration for visitors, not the learner's own data.
 */
/*
 * Intro animation (CSS, see .fv-anim in app.css). Everything starts dimmed, then:
 * Learn → arc to Test → Test → arc to Fix gaps → Fix gaps → arc back to Learn,
 * and with that last arc the Readiness circle lights up, its bars grow and 48 → 71% counts up.
 * Times are seconds from page load; the resting state (and reduced motion) is fully lit.
 */
const STEP = [0.2, 1.3, 2.4];
const ARC = [0.6, 1.7, 2.8];
const ARC_LEN = 0.75;
const CORE = ARC[2];
const COUNT_AT = CORE + 0.45;
/** Title, description and CTA come in once the loop has finished (count-up ends at COUNT_AT + 0.9). */
const TEXT_AT = COUNT_AT + 0.95;
const d = (t: number) => ({ "--d": `${t}s` }) as React.CSSProperties;

export function FirstView() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const s = ref.current;
    if (!s) return;
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fit = new Function("s", FIT_JS) as (s: HTMLElement) => void;
    const run = () => fit(s);
    run();
    document.fonts?.ready.then(run);
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, []);

  return (
    <section ref={ref} className="fv" aria-labelledby="fv-title" suppressHydrationWarning>
      <div className="fv-copy">
        <span className="tag tag-accent-2 fv-tag">
          <span className="fv-only-lg">ISTQB® CTFL · Syllabus v4.0.1</span>
          <span className="fv-only-sm">ISTQB® CTFL · v4.0.1</span>
        </span>
        <h1 id="fv-title" className="fv-title fv-reveal" style={d(TEXT_AT)}>Learn. Test. Fix the gaps. Repeat until you pass.</h1>
        <p className="fv-desc fv-reveal" style={d(TEXT_AT + 0.25)}>Each round makes your map more complete and your readiness score climb. When it stays above 65%, you are ready to book the exam.</p>
        <div className="fv-cta-lg fv-reveal" style={d(TEXT_AT + 0.5)}>
          <Link href="/mindmap" className="btn btn-primary" style={{ fontSize: 16, padding: "12px 22px" }}>Open Mindmap now</Link>
        </div>
      </div>

      <Loop size="lg" />
      <Loop size="sm" />

      <div className="fv-cta-sm fv-reveal" style={d(TEXT_AT + 0.35)}>
        <Link href="/mindmap" className="btn btn-primary btn-block" style={{ fontSize: 16, minHeight: 48, marginTop: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Open Mindmap now</Link>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `(function(s){${FIT_JS}})(document.currentScript.parentElement)` }} />
    </section>
  );
}

const Dot = ({ on, d }: { on: boolean; d: number }) => (
  <span style={{ width: d, height: d, borderRadius: "50%", background: on ? "var(--color-accent-2-500)" : "var(--color-neutral-300)" }} />
);

function Badge({ n, sage, d }: { n: number; sage?: boolean; d: number }) {
  return (
    <span style={{ width: d, height: d, flex: "none", borderRadius: "50%", background: sage ? "var(--color-accent-2-500)" : "var(--color-accent)", color: "var(--color-bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontSize: d > 26 ? 16 : 13 }}>{n}</span>
  );
}

/** Point on the loop circle; 0° is 3 o'clock, angles grow clockwise (SVG y points down). */
const at = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
};

/** Counts from `from` to `to` once the reveal reaches it; renders the final value on the server. */
function CountUp({ from, to, delay }: { from: number; to: number; delay: number }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(from);
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / 900));
      setN(Math.round(from + (to - from) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, delay]);
  return <>{n}</>;
}

/** The learning loop: dashed circle, readiness in the middle, three step cards. */
function Loop({ size }: { size: "lg" | "sm" }) {
  const lg = size === "lg";
  const g = lg
    ? { w: 600, h: 540, cx: 300, cy: 270, r: 200, dash: "4 10", arrows: ["M468 172 l-3 -17 -13 10 z", "M220 453 l16 -6 -2 17 z", "M122 172 l9 18 -18 0 z"], core: 200, bar: 14, bars: [22, 32, 44, 56], big: 30, card: 28, pad: "16px", badge: 30, title: 18, small: 12.5, dot: 18 }
    : { w: 350, h: 350, cx: 175, cy: 180, r: 128, dash: "4 9", arrows: ["M281 112 l-2 -14 -11 9 z", "M150 308 l13 -6 0 13 z", "M57 122 l9 18 -18 0 z"], core: 132, bar: 9, bars: [12, 18, 26, 34], big: 20, card: 22, pad: "11px 12px", badge: 24, title: 16, small: 11.5, dot: 14 };
  const card = { position: "absolute", background: "var(--color-surface)", borderRadius: g.card, padding: g.pad, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: lg ? 8 : 5, boxShadow: "var(--shadow-md)" } as const;
  const head = (n: number, label: string, sage?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: lg ? 8 : 7 }}>
      <Badge n={n} sage={sage} d={g.badge} />
      <span style={{ fontFamily: "var(--font-heading)", fontSize: g.title }}>{label}</span>
    </div>
  );
  const small = { fontSize: g.small, color: "var(--color-neutral-800)", lineHeight: lg ? 1.4 : 1.3 } as const;
  const tagSm = lg ? {} : { fontSize: 10.5, padding: "2px 8px" };

  return (
    <div className={`fv-loop fv-loop-${size}`} role="img" aria-label="The study loop: 1 Learn on the mindmap, 2 Test with a mock exam, 3 Fix the gaps you missed. Readiness climbs each round, for example from 48% to 71% over four rounds." style={{ width: g.w, height: g.h }}>
      <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <circle cx={g.cx} cy={g.cy} r={g.r} fill="none" stroke="var(--color-neutral-400)" strokeWidth={3} strokeDasharray={g.dash} strokeLinecap="round" opacity={0.45} />
        {[[-90, 30], [30, 150], [150, 270]].map(([a, b], i) => {
          const arc = `M ${at(g.cx, g.cy, g.r, a)} A ${g.r} ${g.r} 0 0 1 ${at(g.cx, g.cy, g.r, b)}`;
          const id = `fv-arc-${size}-${i}`;
          return (
            <g key={id}>
              {/* The lit arc keeps the dashes; a solid copy in a mask draws it in. */}
              <mask id={id} maskUnits="userSpaceOnUse">
                <path className="fv-draw" style={d(ARC[i])} d={arc} pathLength={1} fill="none" stroke="#fff" strokeWidth={12} />
              </mask>
              <path d={arc} fill="none" stroke={i === 2 ? "var(--color-accent-2-500)" : "var(--color-accent)"} strokeWidth={3.5} strokeDasharray={g.dash} strokeLinecap="round" mask={`url(#${id})`} />
              <path className="fv-arrow" style={d(ARC[i] + ARC_LEN - 0.15)} d={g.arrows[i]} fill={i === 2 ? "var(--color-accent-2-700)" : "var(--color-accent-700)"} />
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="fv-lit" style={{ ...d(CORE), position: "absolute", left: "50%", top: g.cy, transform: "translate(-50%,-50%)", width: g.core, height: g.core, borderRadius: "50%", background: "var(--color-accent-2-200)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: lg ? 4 : 3 }}>
        <span style={{ fontSize: lg ? 12 : 11, fontWeight: 700, color: "var(--color-accent-2-900)" }}>Readiness</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: lg ? 6 : 4, height: g.bars[3] + (lg ? 4 : 0) }}>
          {g.bars.map((h, i) => (
            <div key={h} className="fv-bar" style={{ ...d(CORE + 0.2 + i * 0.12), width: g.bar, height: h, borderRadius: 999, background: ["var(--color-accent-2-400)", "var(--color-accent-2-400)", "var(--color-accent-2-500)", "var(--color-accent-2-700)"][i] }} />
          ))}
        </div>
        <span className="fv-fade" style={{ ...d(COUNT_AT), fontFamily: "var(--font-heading)", fontSize: g.big, lineHeight: 1, color: "var(--color-accent-2-900)", fontVariantNumeric: "tabular-nums" }}>
          48 → <CountUp from={48} to={71} delay={COUNT_AT} />%
        </span>
        {lg && <span className="fv-fade" style={{ ...d(COUNT_AT + 0.3), fontSize: 11, fontWeight: 600, color: "var(--color-accent-2-800)" }}>over 4 rounds</span>}
      </div>

      <div aria-hidden className="fv-lit" style={{ ...card, ...d(STEP[0]), left: "50%", top: 0, transform: "translateX(-50%)", width: lg ? 200 : 150 }}>
        {head(1, "Learn")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[1, 1, 1, 1, 0, 0].map((on, i) => <Dot key={i} on={!!on} d={g.dot} />)}
        </div>
        <span style={small}>{lg ? "Mindmap: 4 of 6 chapters studied" : "Mindmap · 4/6 chapters"}</span>
      </div>

      <div aria-hidden className="fv-lit" style={{ ...card, ...d(STEP[1]), right: 0, bottom: lg ? 40 : 0, width: lg ? 210 : 140 }}>
        {head(2, "Test")}
        <span style={small}>{lg ? "Mock exam · 40 Q · 60 min" : "40 Q · 60 min"}</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: lg ? "baseline" : "center" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: lg ? 26 : 20, color: "var(--color-accent-800)" }}>27/40</span>
          <span className="tag tag-accent-2" style={tagSm}>Pass</span>
        </div>
      </div>

      <div aria-hidden className="fv-lit" style={{ ...card, ...d(STEP[2]), left: 0, bottom: lg ? 40 : 0, width: lg ? 210 : 140 }}>
        {head(3, "Fix gaps", true)}
        {lg && <span style={small}>Missed most in:</span>}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="tag tag-accent" style={{ alignSelf: "flex-start", whiteSpace: "nowrap", ...tagSm }}>{lg ? "Ch 4 · Test design" : "Ch 4 · Design"}</span>
          <span className="tag tag-accent" style={{ alignSelf: "flex-start", ...tagSm }}>Ch 5 · Risk</span>
        </div>
      </div>
    </div>
  );
}
