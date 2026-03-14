# Cursor Rules — Varkly Project

These are the operating rules for every AI session working on this codebase.

---

## Session Start Protocol

At the beginning of every new conversation:

1. **Read `planning.md`** — Understand the current architecture, tech stack decisions, and known risks before touching any code.
2. **Read `tasks.md`** — See what's completed, what's in progress, and what's next. Do not start work that is already done or that conflicts with in-progress work.
3. **Read `PRD.md`** if the task involves a feature, a user flow, or a product decision — confirm your understanding of the requirement before implementing.

---

## Task Management Rules

- **Check `tasks.md` before starting any work.** If your task isn't listed, add it before beginning.
- **Mark tasks complete immediately** when finished — include the completion date in `[YYYY-MM-DD]` format next to the checkbox.
- **Add newly discovered tasks as you go.** If you find a bug, a missing edge case, a tech debt item, or a future improvement while working, add it to the appropriate milestone in `tasks.md` before ending the session.
- **Only work on one task at a time.** Do not begin the next task until the current one is committed, pushed, and marked complete.
- **Update `planning.md`** if you make a meaningful architectural decision, add a new dependency, change a Supabase schema, or deploy a new Edge Function.

---

## Code Rules

### General
- Read every file you plan to edit before making changes.
- Do not remove or rewrite existing logic without understanding why it exists.
- Do not add comments that just describe what the code does — only comment non-obvious intent, trade-offs, or constraints.
- Preserve the existing code style: React functional components, TypeScript strict mode, Tailwind utility classes, Framer Motion for animation.

### TypeScript
- All new components and utilities must be fully typed — no implicit `any`.
- New Supabase schema changes must be reflected in `src/types/supabase.ts`.
- New data shapes used across components must be added to `src/types/index.ts`.

### Styling
- Use Tailwind utility classes exclusively — do not add inline styles or new CSS files unless absolutely necessary.
- Dark mode: always include `dark:` variants for any new text, background, or border colours.
- Follow the existing design tokens: `violet-*` for primary, `indigo-*` for secondary, `emerald-*` for success, `red-*` for error, `gray-*` for neutral.

### State & Data
- Quiz state lives in `QuizContext` + `sessionStorage`. Do not add local component state for quiz data.
- Supabase calls belong in `src/utils/supabase.ts`. Do not call Supabase directly from components.
- Analytics calls belong in `src/utils/analytics.ts`.

### Supabase Edge Functions
- All Edge Functions live in `supabase/functions/<function-name>/index.ts`.
- Every Edge Function must handle CORS preflight (`OPTIONS`) correctly.
- Validate all inputs with Zod before processing.
- Check honeypot fields before reCAPTCHA — it's cheaper.
- Never log sensitive data (email addresses, IP addresses) to the console in production.

### Security
- Never hardcode secrets in source code. Use `Deno.env.get()` in Edge Functions and `import.meta.env.VITE_*` in the frontend.
- The analytics dashboard token (`SECRET123`) is hardcoded and must be moved to an env variable — see tasks.md.
- Always validate honeypot + reCAPTCHA before any DB write that accepts user input.

---

## Git Rules

- Commit after each logical unit of work — do not batch unrelated changes.
- Commit messages must be descriptive: `feat: add AI prompts card to results page`, not `update stuff`.
- Always run `git push -u origin <branch>` after committing.
- Never force push to the main branch.

---

## Current Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.3 |
| Language | TypeScript | 5.5 |
| Build tool | Vite | 5.4 |
| Routing | React Router DOM | 6.22 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 11.18 |
| Icons | Lucide React | 0.344 |
| Charts | Recharts | 2.12 |
| Backend / DB | Supabase (PostgreSQL + Edge Functions) | 2.39 |
| Edge Function runtime | Deno | (managed by Supabase) |
| Email | nodemailer via Gmail SMTP | 6.9 |
| Input validation (Edge) | Zod | 3.22 |
| User-agent parsing | ua-parser-js | 1.0 |
| Spam protection | Google reCAPTCHA v3 + honeypot | — |
| Deployment | Vercel | — |

---

## Environment Variables Reference

### Frontend (Vite)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RECAPTCHA_SITE_KEY
```

### Supabase Edge Functions (Deno.env)
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GMAIL_ADDRESS
GMAIL_APP_PASSWORD
RECAPTCHA_SECRET
```

---

## File Map (Quick Reference)

```
src/
  App.tsx                          All routes
  types/index.ts                   Core types (Question, VarkScores, QuizState, EmailCapture)
  types/supabase.ts                Supabase DB schema types
  types/analytics.ts               Analytics types
  data/questions.ts                13 VARK quiz questions
  contexts/QuizContext.tsx         Quiz state management
  contexts/ThemeContext.tsx        Dark/light mode
  utils/supabase.ts                All Supabase client calls
  utils/analytics.ts               Visitor tracking functions
  components/landing/              LandingPage + email capture modal
  components/quiz/                 QuizContainer, QuizIntro, Question, ProgressBar
  components/results/              ResultsPage, ResultsChart, ResultsExplanation
  components/my-results/           MyResultsPage
  components/analytics/            AnalyticsPage, VisitorTracker
  components/unsubscribe/          UnsubscribePage
  components/shared/               ThemeToggle

supabase/
  functions/send-vark-report/      Email report Edge Function
  functions/enrich-analytics/      IP geolocation enrichment Edge Function
  functions/get-my-results/        Historical results lookup Edge Function
  functions/analytics-data/        Single-site analytics aggregation
  functions/analytics-data-enriched/
  functions/analytics-data-multi-site/
  migrations/                      Ordered SQL migration files
```

---

## Session Summaries

### 2026-03-14 — Project baseline setup
- Read entire codebase
- Generated `README.md`, `PRD.md`, `cursor.md`, `planning.md`, `tasks.md`
- Established project documentation framework and AI Prompts feature spec
