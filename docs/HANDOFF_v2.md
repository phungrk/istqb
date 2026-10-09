# Handoff v2: CTFL Learning — sync from design prototype

## Overview
This is the second handoff from the **Testpath / CTFL Learning** design prototype (`CTFL Learning.dc.html`). It replaces the v1 handoff. The prototype is a high-fidelity, fully clickable reference built with the Organic design system (cream/terracotta/sage palette, Caprasimo headings, Figtree body).

The design file is an **HTML prototype for reference only** — not production code. Recreate every screen in your Next.js/React codebase using existing patterns and libraries.

---

## What changed since v1

### 1. Login — username + password (no Gmail)
- "Sign in with Gmail" replaced with a plain **username + password** form.
- Demo credentials shown in the dialog: `testpath` / `ctfl2025`.
- Any username is accepted; display name derived from it (`testpath` → "Testpath").
- No OAuth, no Google SDK dependency.

### 2. Practice tests screen — By level + By chapter
- **Removed**: Mock Exam A and Mock Exam B.
- **By level** section: three cards — Short (10 q), Medium (20 q), Long (40 q) — with the real exam's 8/6/4/11/9/2 chapter weighting. Each card shows the chapter mix (e.g. Ch1×2 · Ch2×2…) and timing.
- **By chapter** section: six chapter cards, each with three size buttons (Short/Medium/Long) that disable when the question bank is too small. Shows "N in bank" count.
- Mode toggle (Practice / Mock exam) applies to both sections.

### 3. Exam screen — multi-select and 5 options
- Answers are now **arrays** (`answers: number[]`) — a question can require selecting 2+ options.
- A **"Select N answers"** tag appears when `answers.length > 1`.
- Option badge is a **circle** for single-select, **10px rounded rect** for multi-select.
- Letters go up to **E** (5-option questions supported).
- Reveal in practice mode waits until exactly N options are chosen.

### 4. Mindmap — full rebuild
#### Tree
- Structure: root → 6 chapters → 36 study topics (3 levels).
- Old nested 1.1 / 1.2 / EP / BVA concept nodes removed.
- Topic pills: `emoji + Vietnamese label`, ⭐ on 22/36 starred topics.
- Default expanded: root, Chapter 1, Chapter 4.
- Helper text: "Open a chapter, then pick a topic to see its memory hook, key terms, illustrations and exam traps."

#### Topic detail panel
When a **topic** is selected the panel widens (flex `1 1 520px`) and shows, in order:
1. Kicker `Chapter N · title`, h3 topic title (Figtree bold if Vietnamese), ⭐ tag if starred.
2. **"Remember it as"** hook — 5 px left bar in chapter colour, 18 px bold text.
3. **KEY TERMS** — chapter-coloured pill chips.
4. **📘 Syllabus · learning objectives** box (NEW):
   - One collapsible `<details>` row per LO; first one open.
   - Summary: chevron `›` (rotates open), `FL-1.1.1` bold in chapter ink, K-level pill, LO statement semibold.
   - Body (indented 16 px): section heading uppercase 11 px, quoted syllabus excerpt with `<mark>` highlights at 28% chapter colour.
   - Footer: "Quoted from the ISTQB® CTFL Syllabus v4.0.1. Highlighted: this topic's keywords."
   - Data source: `data/syllabus-lo.json` keyed by topic ID.
5. Remaining content blocks: flow chips (→), icon rows, A-vs-B grids, sample work product box (dashed border), paragraphs, SVG illustrations.
6. Sample question box (left bar in chapter colour) with `<details>` "Show answer".
7. 🪤 Exam trap box (accent-100 bg, accent-300 border).
8. Buttons: Practise this chapter / Mark as learned / Sign in to track.

Root/chapter selected: unchanged — summary, bullet points, child chips.

#### Progress
- "x of 36 topics learned" (was based on the old sub-section count).

#### CSS additions
All `.topic`, `.b-syl`, `.lo-*`, `mark`, `.mm-detail` rules are in `app.css` (already in repo). The prototype embeds them inline; the real app already loads them via `app.css`.

### 5. Pricing removed
- Pricing screen, nav link, checkout dialog, AI-upsell dialog, and Pro upgrade CTA on the Home screen all removed.
- `isPricing`, `goPricing`, `plans`, `billingOpts`, `pay` no longer needed.

### 6. AI features hidden
- AI Coach nav link removed.
- AI-generated test card removed from Practice tests.
- "Ask the AI coach" buttons removed from exam feedback and result review.
- Coach screen replaced with a "Coming soon" placeholder.
- Dashboard AI coach card simplified to "Coming soon".
- All Pro-gated AI prompts removed.

---

## Screens still in scope

| Screen | Notes |
|--------|-------|
| Home | Pro card removed |
| Mindmap | Rebuilt — see §4 above |
| Practice tests | By level + By chapter — see §2 |
| Exam | Multi-select — see §3 |
| Result | Ask-AI button removed |
| Dashboard | AI card → "Coming soon" |
| Sign-in dialog | Username + password — see §1 |

---

## Question bank format change
`q.a` is now **`number[]`** (array of correct answer indices) instead of `number`.  
`isCorrect(q, chosen)` = `chosen.length === q.a.length && q.a.every(x => chosen.includes(x))`.  
The `data/questions.json` bank already uses this format; make sure any local migration is applied.

---

## Design tokens (Organic system — unchanged)
```
--color-bg:          #f5ead8
--color-text:        #201e1d
--color-accent:      #c67139   (odd chapters)
--color-accent-2:    #7a8a5e   (even chapters)
--font-heading:      Caprasimo  (no Vietnamese glyphs — use Figtree bold for VN text)
--font-body:         Figtree
--radius-lg:         16px
```

---

## Files in this package
| File | Purpose |
|------|---------|
| `CTFL Learning.dc.html` | Full high-fidelity prototype — all screens, all logic |
| `README_v2.md` | This document |

Source files in the repo:
- `src/app/mindmap/page.tsx` — mindmap page
- `src/components/TopicView.tsx` — topic block renderer
- `src/app/app.css` — all `.topic` / `.b-syl` / `.mm-detail` CSS
- `data/mindmap.json` — 36 topic bodies
- `data/syllabus-lo.json` — LO data keyed by topic ID
- `data/questions.json` — 915 questions (answers as `number[]`)
