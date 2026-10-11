"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { term: string; slug: string; chapter: number; lead: string };

/** Searchable A–Z list. Server-rendered with every term so crawlers see the full list. */
export function GlossaryList({ items, chapters }: { items: Item[]; chapters: { id: number; title: string }[] }) {
  const [q, setQ] = useState("");
  const [ch, setCh] = useState(0);
  const needle = q.trim().toLowerCase();
  const shown = items.filter((i) => (!ch || i.chapter === ch) && (!needle || i.term.toLowerCase().includes(needle) || i.lead.toLowerCase().includes(needle)));
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
          placeholder="Search a term, e.g. regression"
          aria-label="Search the glossary"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: "1 1 260px", minHeight: 44 }}
        />
        <select className="input" aria-label="Filter by chapter" value={ch} onChange={(e) => setCh(Number(e.target.value))} style={{ flex: "0 1 260px", minHeight: 44 }}>
          <option value={0}>All chapters</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>Chapter {c.id} · {c.title}</option>)}
        </select>
      </div>

      <nav aria-label="Jump to letter" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {[...groups.keys()].map((L) => (
          <a key={L} href={`#letter-${L}`} className="tag tag-accent" style={{ minWidth: 36, minHeight: 32, fontSize: "var(--fs-14)", fontWeight: 600, justifyContent: "center", textDecoration: "none" }}>{L}</a>
        ))}
      </nav>

      {shown.length === 0 && <p style={{ margin: 0, color: "var(--color-neutral-700)" }}>No term matches &ldquo;{q}&rdquo;.</p>}

      {[...groups].map(([L, list]) => (
        <section key={L} id={`letter-${L}`} aria-labelledby={`h-${L}`} style={{ display: "flex", flexDirection: "column", gap: 8, scrollMarginTop: 80 }}>
          <h2 id={`h-${L}`} style={{ margin: "8px 0 0", fontSize: "var(--fs-22)" }}>{L}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 10 }}>
            {list.map((i) => (
              <li key={i.slug}>
                <Link href={`/glossary/${i.slug}`} className="card gl-item" style={{ padding: "14px 16px", gap: 4, textDecoration: "none", color: "inherit", height: "100%" }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                    <strong style={{ fontSize: "var(--fs-17)" }}>{i.term}</strong>
                    <span style={{ fontSize: "var(--fs-12)", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>Ch {i.chapter}</span>
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
