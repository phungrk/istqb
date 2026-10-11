"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { term: string; sub?: string; slug: string; chapter: number; lead: string };
type Labels = { search: string; searchLabel: string; allChapters: string; chapter: string; ch: string; jump: string; none: string };

/** Searchable A–Z list. Server-rendered with every term so crawlers see the full list. */
export function GlossaryList({ items, chapters, base, labels }: { items: Item[]; chapters: { id: number; title: string }[]; base: string; labels: Labels }) {
  const [q, setQ] = useState("");
  const [ch, setCh] = useState(0);
  const needle = q.trim().toLowerCase();
  const shown = items.filter((i) => (!ch || i.chapter === ch) && (!needle || i.term.toLowerCase().includes(needle) || !!i.sub?.toLowerCase().includes(needle) || i.lead.toLowerCase().includes(needle)));
  const groups = new Map<string, Item[]>();
  for (const i of shown) {
    const L = i.term[0].toUpperCase();
    (groups.get(L) ?? groups.set(L, []).get(L)!).push(i);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="search"
          className="input"
          placeholder={labels.search}
          aria-label={labels.searchLabel}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: "1 1 260px", minHeight: 44 }}
        />
        <select className="input" aria-label={labels.chapter} value={ch} onChange={(e) => setCh(Number(e.target.value))} style={{ flex: "0 1 260px", minHeight: 44 }}>
          <option value={0}>{labels.allChapters}</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{labels.chapter} {c.id} · {c.title}</option>)}
        </select>
      </div>

      <nav aria-label={labels.jump} style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {[...groups.keys()].map((L) => (
          <a key={L} href={`#letter-${L}`} className="tag tag-accent" style={{ minWidth: 36, minHeight: 32, fontSize: "var(--fs-14)", fontWeight: 600, justifyContent: "center", textDecoration: "none" }}>{L}</a>
        ))}
      </nav>

      {shown.length === 0 && <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>{labels.none} &ldquo;{q}&rdquo;.</p>}

      {[...groups].map(([L, list]) => (
        <section key={L} id={`letter-${L}`} aria-labelledby={`h-${L}`} style={{ display: "flex", flexDirection: "column", gap: 8, scrollMarginTop: 80 }}>
          <h2 id={`h-${L}`} style={{ margin: "8px 0 0", fontSize: "var(--fs-22)" }}>{L}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 10 }}>
            {list.map((i) => (
              <li key={i.slug}>
                <Link href={`${base}/${i.slug}`} className="card gl-item" style={{ padding: "14px 16px", gap: 4, textDecoration: "none", color: "inherit", height: "100%" }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                    <strong style={{ fontSize: "var(--fs-17)" }}>
                      {i.term}
                      {i.sub && <span style={{ fontWeight: 400, color: "var(--color-neutral-700)", fontSize: "var(--fs-14)" }}> · {i.sub}</span>}
                    </strong>
                    <span style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>{labels.ch} {i.chapter}</span>
                  </span>
                  <span style={{ fontSize: "var(--fs-14)", color: "var(--color-neutral-800)", lineHeight: 1.45 }}>{i.lead}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
