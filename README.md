# Testpath — ISTQB CTFL study site

Study the ISTQB® Certified Tester Foundation Level v4.0.1 syllabus as a mindmap, then practise with chapter sets and timed mock exams.

| Tier | How | Gets |
| --- | --- | --- |
| Guest | no account | Mindmap, practice sets, mock exams. Results shown, not saved |
| Member | Sign in (free) | Saved attempts, dashboard, mindmap "learned" progress |

**Sign-in:** the dialog has a **Generate account** button that creates the next free username `user001` … `user100` with a random 8-digit password, shows it once and signs the user in. Those accounts then sign in with username + password (passwords are stored as scrypt hashes; 5 wrong tries lock a username for 10 minutes). If Google keys are set, "Continue with Google" is offered too.

**Pricing and the AI coach are hidden** (design v2): no Pricing page, nav link or Pro upgrade; the AI Coach page says "Coming soon"; the checkout, Stripe webhook and `/api/coach/*` routes return 404. The code is kept — set `ENABLE_PRO=1` to turn it all back on.

Built from the Claude Design handoffs in [`docs/HANDOFF.md`](docs/HANDOFF.md) and [`docs/HANDOFF_v2.md`](docs/HANDOFF_v2.md). The latest prototype is in [`docs/design/`](docs/design).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `.env` it runs locally with a JSON file as the database (`.data/demo-db.json`) and a **Preview as Guest / Member** bar (development only, never in production).

| Integration | Turns on when set | Without it |
| --- | --- | --- |
| Session signing | `AUTH_SECRET` (**required in production**) | dev-only fallback secret |
| Postgres (Prisma) | `DATABASE_URL` (**required on Vercel**, its filesystem is read-only) | JSON file at `.data/demo-db.json` |
| Google sign-in (optional) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | username/password only |
| Pricing, Stripe, AI coach | `ENABLE_PRO=1` (+ Stripe and Anthropic keys) | hidden, APIs return 404 |

Copy `.env.example` to `.env` and fill in what you need.

### Going live

1. **Database:** set `DATABASE_URL`, then `npm run db:push` to create or update the tables (`prisma/schema.prisma`). Run it again after pulling schema changes (v2 added `username` and `passwordHash` to `User`).
2. **Secret:** set `AUTH_SECRET` (`npx auth secret`).
3. **Google (optional):** create an OAuth client (Web), redirect URI `https://<host>/api/auth/callback/google`. Sign-in is limited to `@gmail.com` unless you change `ALLOWED_EMAIL_DOMAIN`.
4. **Stripe (only with `ENABLE_PRO=1`):** create two recurring prices ($5/month, $39/year). Point a webhook at `https://<host>/api/stripe/webhook` with `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
5. **Claude (only with `ENABLE_PRO=1`):** set `ANTHROPIC_API_KEY`. The coach uses `claude-opus-5-5` at low effort with server-side refusal fallbacks (`src/server/ai.ts`).

## How it fits together

- `src/app/*` — one route per screen: `/`, `/mindmap`, `/tests`, `/exam`, `/result`, `/dashboard`, `/coach`, `/pricing`.
- `src/components/AppProvider.tsx` — client state (exam in progress, result, dialogs, coach chat). The exam and the last result live in `sessionStorage`, so a guest's result survives the Google sign-in redirect and is saved automatically once they're signed in.
- `src/app/api/*` — all gating is server-side: attempts and learned topics need a signed-in user, `/api/coach/*` needs Pro (and `ENABLE_PRO=1`). `/api/account/*` handles username sign-in, sign-out and account generation. Bank questions are re-scored on the server when an attempt is saved.
- `src/server/store` — one `Store` interface with a Prisma and a demo-file implementation.
- `data/syllabus.json`, `data/questions.json` — the mindmap and question bank (server-only; sets are drawn by `src/server/bank.ts`).

## Mindmap

The mindmap is root → six chapters → **36 study topics** imported from the "Mindmap CTFL — nhớ bằng hình" artifact into `data/mindmap.json`. Each topic has a memory hook, key terms, flows/comparisons, sample work products, illustrations (diagrams, keyword maps, tables), a sample question with its answer and the usual exam trap; ⭐ marks topics that often come up in the exam. The content is in Vietnamese with English syllabus terms. Members can mark each topic as learned.

To refresh it after editing the artifact, save the page and run `node scripts/import-mindmap.mjs <file>.html .`. The chapter and root nodes still come from `data/syllabus.json`.

Each topic also has a **Syllabus · learning objectives** block: the CTFL v4.0.1 LOs it covers (code, K-level, statement) and the syllabus sentences that contain the topic's keywords, with those keywords highlighted. It is built by `python3 scripts/import-syllabus.py <ISTQB_CTFL_Syllabus_v4.0.1.pdf> .` (needs `pdftotext`) into `data/syllabus-lo.json`. The topic → LO mapping is the `MAP` table at the top of that script; keywords are the syllabus's official chapter keywords found in the topic plus the English terms of its key-term chips.

## Practice tests and the question bank

`data/questions.json` holds **915 questions** imported from the "Quiz 1–25 – ISTQB CTFL" artifacts (Quiz 6 and 7 don't exist; duplicates across quizzes are kept once, and one Quiz 25 question whose figure is missing is skipped). Per chapter: 183 / 138 / 92 / 250 / 206 / 46. Images live in `public/q/`.

The Practice tests page has two parts, each in Short (10), Medium (20) or Long (40) questions:

- **By level:** questions from all six chapters in the real exam's proportions (8/6/4/11/9/2), in syllabus order. Long = the real exam format.
- **By chapter:** questions from one chapter only.

Every start draws a fresh random set on the server (`GET /api/sets`), and "Try again" draws a new one. Mock exam mode allows 1.5 minutes per question (60 min for 40). Questions can have 5 options or 2 correct answers ("Select 2 answers"); they are only marked correct when every right option is chosen.

To rebuild the bank after editing the quizzes, save each quiz page and run `scripts/import-quizzes.mjs` (usage at the top of the file).

ISTQB® is a registered trademark of the International Software Testing Qualifications Board. Testpath is an independent study tool.
