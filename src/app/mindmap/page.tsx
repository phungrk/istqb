"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/components/AppProvider";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import { TopicView, type LoExcerpt } from "@/components/TopicView";
import syllabusLo from "@data/syllabus-lo.json";
import { track } from "@/lib/track";
import { CHAPTERS, KIDS, NODE, NODES, STUDY_IDS, TOPICS, chapterOf, depthOf, palette } from "@/lib/syllabus";

type Row = { id: string; depth: number };

const LO_BY_TOPIC = syllabusLo as Record<string, LoExcerpt[]>;

/** Vietnamese letters the Caprasimo heading font lacks. */
const VIET = /[\u01a0\u01a1\u01af\u01b0\u0110\u0111\u1ea0-\u1ef9]/;

/** Nodes that have children, i.e. everything "Expand all" opens. */
const PARENTS = NODES.filter((n) => KIDS[n.id]).map((n) => n.id);

export default function MindmapPage() {
  const { tier, learned, expanded, setExpanded, selected, setSelected, openNode, toggleLearned, startSet, openLogin } = useApp();
  const logged = tier !== "guest";

  const rows: Row[] = [];
  const walk = (id: string, depth: number) => {
    rows.push({ id, depth });
    if (expanded[id]) (KIDS[id] || []).forEach((k) => walk(k, depth + 1));
  };
  walk("root", 0);

  const sel = NODE[selected];
  const selCh = chapterOf(selected);
  const selDepth = depthOf(selected);
  const kicker = selDepth === 0 ? "Syllabus overview" : selDepth === 1 ? `Chapter ${selCh} · ${CHAPTERS[selCh! - 1].q} exam questions` : `Chapter ${selCh} · ${CHAPTERS[selCh! - 1].title}`;
  const detail = useRef<HTMLElement>(null);
  // On narrow screens the panel sits below the tree: bring it into view.
  const select = (id: string) => {
    setSelected(id);
    if (TOPICS[id]) track("topic_open", { topic: id });
    if (window.matchMedia("(max-width: 900px)").matches) requestAnimationFrame(() => detail.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  // Opening a syllabus LO in the detail panel (the <details> come from TopicView's HTML).
  useEffect(() => {
    const el = detail.current;
    if (!el) return;
    // The first LO starts open and fires one "toggle" on render: that one isn't the learner's doing.
    const auto = new WeakSet<Element>();
    const onToggle = (ev: Event) => {
      const d = ev.target as HTMLDetailsElement;
      if (d.hasAttribute?.("data-auto") && !auto.has(d)) return void auto.add(d);
      const lo = d.classList?.contains("lo") && d.open ? d.querySelector(".lo-id")?.textContent?.replace("FL-", "") : null;
      if (lo && TOPICS[selected]) track("lo_expand", { topic: selected, lo });
    };
    el.addEventListener("toggle", onToggle, true);
    return () => el.removeEventListener("toggle", onToggle, true);
  }, [selected]);
  const allOpen = PARENTS.every((id) => expanded[id]);
  const learnedCount = STUDY_IDS.filter((id) => learned[id]).length;
  const topic = TOPICS[selected];
  const selPal = selCh ? palette(selCh) : null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ margin: "0 0 6px" }}>Syllabus mindmap</h1>
          <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>Open a chapter, then pick a topic to see its memory hook, key terms, illustrations and exam traps.</p>
        </div>
        {logged && <span className="tag tag-accent-2" style={{ fontSize: 13, padding: "6px 14px" }}>{learnedCount} of {STUDY_IDS.length} topics learned</span>}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 400px", minWidth: 0, background: "var(--color-neutral-100)", borderRadius: 32, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Tree controls live inside the tree panel, so it's clear they open and close the chapters below. */}
        <div role="toolbar" aria-label="Syllabus tree" aria-controls="syllabus-tree" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid var(--color-divider)" }}>
          <span style={{ flex: "1 1 auto", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>Syllabus tree</span>
          {/* One toggle: expands everything, or collapses back to the chapters once everything is open. */}
          <button
            className="btn btn-ghost"
            aria-controls="syllabus-tree"
            aria-expanded={allOpen}
            onClick={() => setExpanded(allOpen ? { root: true } : Object.fromEntries(PARENTS.map((id) => [id, true])))}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 12px" }}
          >
            {allOpen ? <ChevronRightIcon /> : <ChevronDownIcon />} {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <div role="tree" id="syllabus-tree" aria-label="Syllabus" style={{ display: "flex", flexDirection: "column" }}>
          {rows.map(({ id, depth: d }) => {
            const n = NODE[id];
            const kids = KIDS[id] || [];
            const open = !!expanded[id];
            const ch = chapterOf(id);
            const p = ch ? palette(ch) : null;
            const st =
              d === 0 ? { bg: "var(--color-text)", fg: "var(--color-bg)", font: "var(--font-heading)", size: 19 }
              : d === 1 ? { bg: p!.mid, fg: p!.ink, font: "var(--font-heading)", size: 17 }
              : d === 2 ? { bg: "var(--color-bg)", fg: "var(--color-text)", font: "var(--font-body)", size: 15 }
              : { bg: p!.tint, fg: p!.ink, font: "var(--font-body)", size: 14 };
            return (
              <div key={id} role="treeitem" aria-expanded={kids.length ? open : undefined} aria-selected={selected === id}
                style={{ marginLeft: d <= 1 ? d * 14 : 14 + (d - 1) * 34, padding: `5px 0 5px ${d === 0 ? 0 : 6}px`, borderLeft: d === 0 ? 0 : "2px solid var(--color-neutral-300)", display: "flex", alignItems: "center", gap: 8 }}>
                {d > 0 && <span style={{ width: 16, height: 2, background: "var(--color-neutral-400)", flex: "none" }} />}
                <button
                  className="hov-toggle"
                  aria-label={open ? "Collapse" : "Expand"}
                  tabIndex={kids.length ? 0 : -1}
                  onClick={() => setExpanded((x) => ({ ...x, [id]: !x[id] }))}
                  style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", border: 0, background: kids.length ? "var(--color-neutral-200)" : "transparent", color: "var(--color-text)", cursor: "pointer", display: "grid", placeItems: "center", visibility: kids.length ? "visible" : "hidden" }}
                >
                  {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </button>
                <button
                  className="hov-shadow-md"
                  onClick={() => select(id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${selected === id ? "var(--color-accent)" : "transparent"}`, background: st.bg, color: st.fg, fontFamily: st.font, fontSize: st.size, padding: "8px 16px", borderRadius: 999, cursor: "pointer", textAlign: "left", lineHeight: 1.25 }}
                >
                  <span>{n.title}</span>
                  {TOPICS[id]?.starred && <span title="Often on the exam" aria-label="Often on the exam" style={{ fontSize: 12 }}>⭐</span>}
                  {logged && learned[id] && <CheckIcon stroke="var(--color-accent-2-700)" />}
                  {kids.length > 0 && !open && <span style={{ fontFamily: "var(--font-body)", fontSize: 12, opacity: 0.75 }}>{kids.length} topics</span>}
                </button>
              </div>
            );
          })}
        </div>
        </div>

        <aside ref={detail} className="mm-detail" style={{ flex: topic ? "1 1 520px" : "0 1 400px", minWidth: 280, borderRadius: 32, scrollMarginTop: 12 }}>
          <div className="card elev-md" style={{ padding: 28, gap: 14, background: "var(--color-surface)" }}>
            <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>{kicker}</span>
            <h3 style={{ margin: 0, ...(VIET.test(sel.title) ? { fontFamily: "var(--font-body)", fontWeight: 700 } : {}) }}>{sel.title}</h3>
            {topic?.starred && <span className="tag tag-accent" style={{ alignSelf: "flex-start" }}>⭐ Often on the exam</span>}
            {topic && selPal ? (
              <TopicView topic={topic} color={selPal.base} ink={selPal.ink} los={LO_BY_TOPIC[topic.id]} />
            ) : (
              <p style={{ margin: 0, fontSize: 15, textWrap: "pretty" }}>{sel.summary}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {sel.points.map((pt) => (
                <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)", marginTop: 7, flex: "none" }} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
            {KIDS[selected] && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {KIDS[selected].map((k) => (
                  <button key={k} className="tag tag-neutral" onClick={() => openNode(k)} style={{ border: 0, cursor: "pointer", fontSize: 12, padding: "5px 12px" }}>{NODE[k].title}</button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {selCh && (
                <button className="btn btn-primary" onClick={() => startSet({ kind: "chapter", chapter: selCh, size: 10 }, "practice")}>Practise this chapter</button>
              )}
              {logged && selDepth >= 2 && (
                <button className="btn btn-secondary" onClick={() => toggleLearned(selected)}>{learned[selected] ? "Learned ✓ (undo)" : "Mark as learned"}</button>
              )}
              {!logged && selDepth >= 2 && (
                <button className="btn btn-ghost" onClick={openLogin}>Sign in to track what you&apos;ve learned</button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
