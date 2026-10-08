# Testpath — ISTQB CTFL study site

Study the ISTQB® Certified Tester Foundation Level v4.0.1 syllabus as a mindmap, then practise with chapter sets and timed mock exams.

| Tier | How | Gets |
| --- | --- | --- |
| Guest | no account | Mindmap, practice sets, mock exams. Results shown, not saved |
| Member | Sign in with Google (Gmail), free | Saved attempts, dashboard, mindmap "learned" progress |
| Pro | $5/month or $39/year | AI coach: explain wrong answers, chat, 7-day study plan, AI question sets |

Built from the Claude Design handoff in [`docs/HANDOFF.md`](docs/HANDOFF.md). The original prototype is in [`docs/design/`](docs/design).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `.env` everything runs in **demo mode**, so every screen works locally:

| Integration | Turns on when set | Demo-mode fallback |
| --- | --- | --- |
| Google sign-in (Auth.js) | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Fake Gmail dialog + "Preview as Guest / Member / Pro" bar |
| Postgres (Prisma) | `DATABASE_URL` | JSON file at `.data/demo-db.json` |
| Stripe Checkout | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` | Demo card form upgrades instantly |
| AI coach (Claude) | `ANTHROPIC_API_KEY` | Canned answers, fallback plan, bank questions |

Copy `.env.example` to `.env` and fill in the groups you want. The "Preview as" bar only appears while sign-in is in demo mode.

### Going live

1. **Google:** create an OAuth client (Web), redirect URI `https://<host>/api/auth/callback/google`. Sign-in is limited to `@gmail.com` unless you change `ALLOWED_EMAIL_DOMAIN`.
2. **Database:** set `DATABASE_URL`, then `npm run db:push` to create the tables (`prisma/schema.prisma`).
3. **Stripe:** create two recurring prices ($5/month, $39/year). Point a webhook at `https://<host>/api/stripe/webhook` with `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
4. **Claude:** set `ANTHROPIC_API_KEY`. The coach uses `claude-opus-5-5` at low effort with server-side refusal fallbacks (`src/server/ai.ts`).

## How it fits together

- `src/app/*` — one route per screen: `/`, `/mindmap`, `/tests`, `/exam`, `/result`, `/dashboard`, `/coach`, `/pricing`.
- `src/components/AppProvider.tsx` — client state (exam in progress, result, dialogs, coach chat). The exam and the last result live in `sessionStorage`, so a guest's result survives the Google sign-in redirect and is saved automatically once they're signed in.
- `src/app/api/*` — all tier gating is server-side: attempts and learned topics need a member, `/api/coach/*` needs Pro. Bank questions are re-scored on the server when an attempt is saved.
- `src/server/store` — one `Store` interface with a Prisma and a demo-file implementation.
- `data/syllabus.json`, `data/questions.json` — the mindmap and question bank.

## Question bank

`data/questions.json` holds the **15 sample questions** from the prototype. Mock exams use every question at the real exam's pace (1.5 min each). Once every chapter has at least as many questions as the real exam asks (8/6/4/11/9/2), mock exams switch to the real format automatically: 40 questions in 60 minutes.

ISTQB® is a registered trademark of the International Software Testing Qualifications Board. Testpath is an independent study tool.
