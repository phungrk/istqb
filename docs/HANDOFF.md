# Handoff: Testpath — ISTQB CTFL e-learning site

## Overview
Testpath is a study site for the ISTQB Certified Tester Foundation Level (CTFL) v4.0.1 exam. UI language: English. Three user tiers:

| Tier | How | Gets |
| --- | --- | --- |
| Guest | no account | Syllabus mindmap, practice sets, mock exams. Results shown but **not saved** |
| Member | Sign in with Google (Gmail) — free | Everything above + every attempt saved, dashboard (score trend, chapter mastery, attempt history), mindmap "learned" progress |
| Pro | paid ($5/month or $39/year) | Everything above + AI coach: explain wrong answers, chat, 7‑day study plan from weak areas, AI-generated question sets per chapter |

Target repo: `phungrk/istqb` (currently empty — greenfield).

## About the design files
`design/CTFL Learning.dc.html` is a **design reference built in HTML** — a working prototype of look and behavior, not production code. Recreate it in a real stack. No codebase exists yet; recommended:

- **Next.js (App Router) + TypeScript**, CSS variables from `design/_ds/.../styles.css` (or port tokens to Tailwind theme)
- **Auth**: Auth.js (NextAuth) Google provider — Gmail only
- **DB**: Postgres + Prisma (Supabase/Neon fine)
- **Payments**: Stripe Checkout + webhook to set `plan = pro`
- **AI**: Anthropic API (Claude) via server route; never call from the client

To view the prototype: open `design/CTFL Learning.dc.html` in a browser (served over http, e.g. `npx serve design`). A "Preview as Guest / Member / Pro" bar (bottom-right) switches tiers — prototype only, do not ship.

## Fidelity
**High-fidelity.** Colors, type, radii, spacing and copy are final. Recreate pixel-close using the Organic design tokens below.

## Data
- `data/syllabus.json` — 6 chapters (`id, title, q` = exam questions per chapter) + 33 mindmap nodes (`id, parent, title, summary, points[]`). Tree: `root` → `c1..c6` (chapters) → sections (`1.1`…) → some concepts (`ep, bva, dt, st` under `4.2`).
- `data/questions.json` — 15 sample questions (`id, chapter, question, options[4], answerIndex, explanation`). **Placeholder bank** — a real bank (≥ 40/mock, ideally several hundred) is needed. Real exam: 40 Q, 60 min, pass 65% (26/40); per-chapter distribution 8/6/4/11/9/2.

## Screens

Global layout: page bg `--color-bg` #f5ead8, content `max-width:1180px; margin:0 auto; padding:0 28px`. Header row: padding 18px 28px, flex, gap 20px, wraps.

### Header (all screens)
- Brand: 34px circle `--color-accent` with "T" (Caprasimo 18px, color bg) + "Testpath" Caprasimo 21px. Click → Home.
- Nav pills: Mindmap · Practice tests · Dashboard · AI Coach (+ "PRO" tag) · Pricing. 14px/600 Figtree, padding 8px 14px, radius 999px. Active: bg `--color-accent-200`, text `--color-accent-900`. Hover bg `--color-neutral-200`. Exam/Result screens highlight "Practice tests".
- Right: Guest → `.btn.btn-primary` "Sign in with Gmail" (mail icon). Logged-in → 34px avatar circle (bg `--color-accent-2-300`, text `--color-accent-2-900`, initial), email 13px/600, tier label 12px `--color-neutral-700` ("Member · free" / "Pro member"), ghost "Sign out".

### 1. Home
- Hero (flex wrap, gap 48px). Left max 620px: tag `.tag-accent-2` "ISTQB® CTFL · Syllabus v4.0.1"; H1 56px "Pass the Foundation Level exam with a map, not a pile of notes."; body 18px `--color-neutral-800`; CTAs primary "Open the mindmap", secondary "Take a practice test" (16px, padding 12px 22px).
- Right decoration 380×360: circle 300px `--color-accent-200` with "40" (Caprasimo 72px, accent-800) + "questions in 60 minutes"; circle 180px `--color-accent-2-300` with "65%" (40px) + "to pass".
- "Six chapters": grid `repeat(auto-fill,minmax(170px,1fr))` gap 16px. Card = radius 28px, padding 20px, bg chapter tint; 44px numbered circle; title Caprasimo 17px; "{n} exam questions" 13px. Click → Mindmap with that chapter opened & selected. Hover shadow-md.
- "What you get": 3 cards (`.card`, padding 26px) Guest / Member (bg accent-2-100) / Pro (bg accent-100, "See plans" → Pricing).
- Footer note 12px: ISTQB® trademark disclaimer.

Chapter palette: odd chapters use accent ramp (tint 100, mid 200, ink 800, base accent); even chapters use accent‑2 ramp.

### 2. Mindmap
- Title "Syllabus mindmap", helper text; Member shows tag "{x} of 30 topics learned"; buttons "Expand all" / "Collapse".
- Two columns (wrap): tree panel (flex 1 1 460px, bg neutral-100, radius 32px, padding 24px) + sticky detail card (flex 0 1 380px).
- Tree = flattened visible rows. Row: left border `2px solid neutral-300` (not on root), 16px connector line, 26px round toggle (chevron-right closed / chevron-down open; hidden for leaves), node pill (radius 999px, padding 8px 16px, 2px ring `--color-accent` when selected).
  - Depth 0 root: bg text color, fg bg, Caprasimo 19px
  - Depth 1 chapter: bg chapter mid, fg ink, Caprasimo 17px
  - Depth 2 section: bg `--color-bg`, Figtree 15px
  - Depth 3 concept: bg chapter tint, fg ink, 14px
  - Indent: depth ≤1 → depth×14px; deeper → 14 + (depth−1)×34px
  - Collapsed parents show "{n} topics"; learned nodes show sage check.
- Default expanded: root, c1, c4. Selected: root.
- Detail card: kicker (overview / "Chapter N · X exam questions" / "Chapter N · title"), H3 title, summary 15px, bullet points (8px accent dots), child chips (`.tag-neutral`, click → select & expand), actions: "Practise this chapter" (starts chapter set in Practice mode), Member: "Mark as learned" toggle (sections/concepts only), Guest: ghost "Sign in to track what you've learned".

### 3. Practice tests
- Mode segmented pill (bg surface, padding 4px): Practice | Mock exam (active bg accent, fg bg). Helper text changes with mode.
- Guest banner (bg accent-2-100, radius 28px): "You can take any test now. Results are not saved until you sign in." + Sign in.
- Grid `minmax(300px,1fr)`: Mock Exam A (syllabus order), Mock Exam B (mixed order), Chapter 1–6 sets. Card: kicker, title 20px, sub, tag "{n} questions[ · {min} min]", Member: tag "Best {x}%", primary "Start".
- Extra Pro card (bg accent-100): "A set built from your weak topics" → Coach "Custom set" tab (non-Pro → Pricing, label "Unlock with Pro").

### 4. Exam
- Top: ghost "Leave test", H3 title, tag mode label, Mock: timer pill (clock icon, mm:ss tabular; bg accent-200 when < 2 min). Auto-submit at 0.
- Main (flex 1 1 560px): question panel bg neutral-100 radius 32px padding 32px. "Question i of n" + chapter tag; stem 20px/1.45. Options = pill buttons (radius 999px, 2px border, 34px letter circle).
  - Unselected: bg `--color-bg`, border divider
  - Mock selected: bg accent-100, border accent, letter circle accent
  - Practice after answering (locked): correct → bg accent-2-100 / border accent-2-600; chosen wrong → accent-100 / accent-600
- Practice feedback box (radius 24px): "Correct" (sage) / "Not quite" (terracotta), explanation, ghost "Ask the AI coach to explain" (non-Pro → upgrade dialog).
- Footer: Previous (disabled on first) · Next question / Submit test on last.
- Side navigator (bg surface, radius 32px): "{a} of {n} answered", 5-col grid of round number buttons (current = dark; practice correct accent-2-300, wrong accent-300; mock answered accent-200; unanswered neutral-200), "Submit now".

### 5. Result
- 220px score circle (pass: accent-2-200 / accent-2-900, fail: accent-200 / accent-900): "{pct}%" Caprasimo 64px + "{c} / {n} correct".
- Kicker "{title} · {mode}", H1 "You passed this set" / "Not yet at the pass mark", sub with pass mark + time. Buttons: Try again (same set + mode), All tests, Member: Open dashboard.
- Guest banner: "This result is not saved…" + "Save my result" → login; after login the result is saved automatically.
- Member: tag "Saved to your dashboard".
- By-chapter bars (10px, radius 999px; ≥ pass mark sage, else accent) + Review list (every question: ✓/✗ badge, your vs correct letter; wrong ones show explanation + "Explain with AI coach").

### 6. Dashboard (Member+)
- Guest: gate — H1 "Your progress lives here", copy, "Sign in with Gmail".
- H1 "Hi {first name}, here's where you stand" + readiness line based on last mock vs pass mark.
- 4 stat tiles (radius 28px): Attempts, Average score, Best score (accent-2-100), Last mock exam (accent-100). Value Caprasimo 38px.
- Score trend: last 8 attempts as bars (height = pct × 1.6px, top radius 999px), dashed pass-mark line (`2px dashed accent-2-600`). Pass bars accent-2-500, below accent-400.
- Mastery by chapter: aggregated correct/total across all attempts.
- Recent attempts `.table`: Date · Test · Mode · Score · Result tag (Pass sage / Below terracotta). Latest 8.
- Side: Mindmap progress card; AI coach card showing weakest chapter + "Get a study plan" (Pro) / "Unlock with Pro".

### 7. AI Coach (Pro)
- Non-Pro: upsell hero + sample chat bubbles + "Upgrade to Pro".
- Pro: subtitle lists 2 weakest chapters (lowest mastery; default Ch4, Ch5 if no data). Tabs: Chat · Study plan · Custom set.
  - **Chat**: panel 320–480px scroll. Empty: 3 suggestion chips. Bubbles: user right bg accent-200 radius `24 24 6 24`; coach left bg surface radius `24 24 24 6`; "Coach is thinking…". Input pill + 44px send icon button.
  - "Explain" buttons elsewhere open Chat and auto-send: question, chosen answer, correct answer.
  - **Study plan**: "Build my 7-day plan" → plain-text, one line per day, weighted by mastery and exam weight.
  - **Custom set**: chapter pills (weakest preselected, marked "(weakest)") → "Generate 5 questions" → starts a Practice-mode exam "AI set · Chapter N".
- Prompts used (server-side in production):
  - Chat: "friendly, precise ISTQB CTFL v4.0.1 exam coach… plain text, under 140 words… weakest chapters: …" + last 8 messages.
  - Plan: mastery table → 7 lines "Day 1 — …".
  - Quiz: return ONLY JSON array `[{q, o[4], a, e}]`; validate shape; fall back to bank questions for that chapter.

### 8. Pricing
- 3 plan cards (`.card`, padding 30px): Guest Free / Member Free (accent-2-100) / Pro $5 per month (accent-100, shadow-md). Feature list with sage check icons. CTA states: "Current plan" (disabled), "Included", "Sign in with Gmail", "Upgrade to Pro".
- Upgrade while Guest → login dialog first, then checkout.

### Dialogs (`.dialog-backdrop` + `.dialog`, bg neutral-100)
- **Sign in with Gmail**: account row button + "Use another Gmail address" input (validate `^[^@\s]+@gmail\.com$`), Cancel / Continue. Production: real Google OAuth; restrict to gmail.com if required.
- **Checkout**: Monthly $5 / Yearly $39 ("save 35%") option cards; card fields; "Pay $5|$39". Production: Stripe Checkout.
- **Upgrade gate**: "Explanations by the AI coach are a Pro feature" → See plans.
- **Toast**: top-center dark pill, 2.6s ("Signed in as …", "Signed out", "Welcome to Pro…").

## State / data model (production)
```
User(id, email, name, plan: 'member'|'pro', proUntil?)
Attempt(id, userId, title, setKey, mode: 'practice'|'mock', correct, total, durationSec, perChapter JSON {chapterId: [correct,total]}, createdAt)
AttemptAnswer(attemptId, questionId, chosenIndex)
LearnedTopic(userId, nodeId)
Question(id, chapter, question, options[4], answerIndex, explanation, source: 'bank'|'ai')
ChatMessage(userId, role, text, createdAt)
```
- Guest results live client-side only; on sign-in, persist the pending result.
- Mastery = Σcorrect/Σtotal per chapter across attempts. Weak = 2 lowest.
- Pass mark configurable (default 65%).
- Gating must be enforced server-side (dashboard API: member; AI routes: pro).

## Design tokens (Organic)
Colors: bg #f5ead8 · surface #ebddc5 · text #201e1d · accent #c67139 · accent-2 #7a8a5e · divider = text 16%.
Ramps (100→900):
- neutral: #f9f4ed #eee7db #dcd3c4 #c0b6a5 #a19786 #82796a #645c50 #474238 #2e2b25
- accent: #fff2eb #ffe1d0 #ffc6a5 #f6a06b #d67f48 #b2622d #8c491a #643312 #402310
- accent-2: #f0fae1 #e1eecc #ccdbb2 #aebf92 #8fa073 #728157 #56633f #3d472b #272e1b

Type: headings Caprasimo 400 (h1 42 default; hero 56; h2 32; h3 25; h4 20), body Figtree 400/600/700, base 15px/1.55. Buttons use Caprasimo 14px.
Spacing: 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2px. Radii: 8 / 16 / 28px; cards & dialogs 32px; buttons, tags, inputs 999px; panels 28–32px.
Shadows: sm `0 1px 2px #2e2b25 14%`, md `0 3px 10px #2e2b25 16%`, lg `0 12px 32px #2e2b25 22%`.
Focus: `outline 2px solid accent; offset 2px`. Disabled: opacity .45.
Body text in accent must use accent-700 for contrast.

## Assets
- Icons: Lucide (stroke-width 2.75): mail, chevron-right, chevron-down, check, x, clock, sparkles, send. Use `lucide-react`.
- Fonts: Google Fonts Caprasimo + Figtree.
- No images.

## Files
- `design/CTFL Learning.dc.html` — full prototype (template + logic; data constants at the top of the script)
- `design/support.js` — runtime needed to open the prototype
- `design/_ds/.../styles.css` — Organic token sheet + component classes (`.btn`, `.tag`, `.card`, `.input`, `.table`, `.dialog`)
- `data/syllabus.json`, `data/questions.json` — seed data extracted from the prototype
