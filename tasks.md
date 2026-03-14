# Tasks — Varkly

**Last updated:** 2026-03-14

Tasks are organised by milestone. Check off items as they are completed and add the date: `[x] Task description [2026-03-14]`.

---

## Milestone 0 — Project Setup & Documentation

- [x] Create repository and initial Vite + React + TypeScript scaffold [pre-2026]
- [x] Configure Tailwind CSS v3 [pre-2026]
- [x] Configure React Router v6 [pre-2026]
- [x] Set up Supabase project and connect client [pre-2026]
- [x] Configure Vercel deployment with SPA rewrites (`vercel.json`) [pre-2026]
- [x] Add Google Fonts (Inter) and base HTML meta tags [pre-2026]
- [x] Add dark/light mode with flash-prevention inline script [pre-2026]
- [x] Write `README.md` [2026-03-14]
- [x] Write `PRD.md` [2026-03-14]
- [x] Write `cursor.md` [2026-03-14]
- [x] Write `planning.md` [2026-03-14]
- [x] Write `tasks.md` [2026-03-14]

---

## Milestone 1 — Core Quiz

- [x] Write 13 VARK quiz questions with humorous scenario framing [pre-2026]
- [x] Implement `QuizContext` with full state management (answers, navigation, scoring) [pre-2026]
- [x] Persist quiz state to `sessionStorage` (survive accidental refresh) [pre-2026]
- [x] Build `QuizIntro` screen (question index `-1`) [pre-2026]
- [x] Build `Question` component with multi-select answer support [pre-2026]
- [x] Build `ProgressBar` component [pre-2026]
- [x] Build `QuizContainer` orchestration with back / forward / skip controls [pre-2026]
- [x] Implement `calculateScores()` — tally V/A/R/K counts from selected options [pre-2026]
- [x] Navigate to `/results` on quiz completion [pre-2026]

---

## Milestone 2 — Results Page

- [x] Build `ResultsPage` component [pre-2026]
- [x] Implement shareable URL encoding: `btoa("V-A-R-K")` → `/r/:hash` [pre-2026]
- [x] Implement hash decoding on `/r/:hash` with validation and redirect-to-home on invalid hash [pre-2026]
- [x] Build `ResultsChart` — VARK score bar chart with Recharts [pre-2026]
- [x] Build `ResultsExplanation` — per-style descriptions, tips, and RayRayRay quote [pre-2026]
- [x] Add copy-to-clipboard button for results URL [pre-2026]
- [x] Add Web Share API integration with clipboard fallback [pre-2026]
- [x] Add "Retake Quiz" button [pre-2026]
- [x] Show loading spinner while initialising results [pre-2026]
- [x] Show save status banner (saving / saved / error) [pre-2026]
- [x] Show email status banner (sending / sent / error) [pre-2026]

---

## Milestone 3 — Landing Page & Email Capture

- [x] Build `LandingPage` with hero, VARK style grid, and CTA [pre-2026]
- [x] Build email capture modal (first name, email, reason, custom reason) [pre-2026]
- [x] Add honeypot field (`hp_field`) to email capture form [pre-2026]
- [x] Integrate reCAPTCHA v3 on email capture form [pre-2026]
- [x] Immediately INSERT placeholder `quiz_responses` row on form submit [pre-2026]
- [x] Carry record ID through quiz context to UPDATE on completion [pre-2026]
- [x] Add rotating playful loading messages while saving to DB [pre-2026]
- [x] Add Enter key shortcut to start quiz from landing page [pre-2026]
- [x] Add "My results" link in nav [pre-2026]

---

## Milestone 4 — Database & Backend

- [x] Create `quiz_responses` table with initial schema [pre-2026]
- [x] Add `ip_address` and `user_agent` columns to `quiz_responses` [pre-2026]
- [x] Add `unsubscribed` column to `quiz_responses` [pre-2026]
- [x] Create `emails` table for email audit log [pre-2026]
- [x] Create `visitor_analytics` table [pre-2026]
- [x] Set up RLS policies on all tables [pre-2026]
- [x] Add performance indexes on all tables [pre-2026]
- [x] Implement `saveEmailCapture()` in `utils/supabase.ts` [pre-2026]
- [x] Implement `updateQuizResponse()` in `utils/supabase.ts` [pre-2026]
- [x] Implement `saveQuizResponse()` for anonymous completions [pre-2026]
- [x] Implement `sendVarkReport()` calling the Edge Function [pre-2026]
- [x] Implement `getMyResults()` calling the Edge Function [pre-2026]
- [x] Fetch user IP from `api.ipify.org` before DB writes [pre-2026]

---

## Milestone 5 — Email & Edge Functions

- [x] Deploy `send-vark-report` Edge Function [pre-2026]
- [x] Implement Zod schema validation in `send-vark-report` [pre-2026]
- [x] Implement honeypot check in `send-vark-report` [pre-2026]
- [x] Implement reCAPTCHA verification in `send-vark-report` [pre-2026]
- [x] Build personalised HTML email template (`generateEmailContent`) [pre-2026]
- [x] Build context-aware message based on user's stated reason [pre-2026]
- [x] Add per-style personalised learning tips to email [pre-2026]
- [x] Add unsubscribe link to email footer [pre-2026]
- [x] Log every email attempt to `emails` table [pre-2026]
- [x] Deploy `get-my-results` Edge Function [pre-2026]

---

## Milestone 6 — Analytics

- [x] Build `VisitorTracker` invisible component [pre-2026]
- [x] Implement `trackVisitor()` with full device/browser/UTM/referrer capture [pre-2026]
- [x] Implement `trackPageView()` for SPA route changes [pre-2026]
- [x] Skip analytics tracking in development and for bots [pre-2026]
- [x] Track time-on-page via `beforeunload` and `visibilitychange` [pre-2026]
- [x] Deploy `enrich-analytics` Edge Function with IPinfo integration [pre-2026]
- [x] Deploy `analytics-data-multi-site` Edge Function [pre-2026]
- [x] Build `AnalyticsPage` admin dashboard [pre-2026]
- [x] Add visitors-per-day LineChart [pre-2026]
- [x] Add device-type PieChart [pre-2026]
- [x] Add top IPs table with DNS lookup links [pre-2026]
- [x] Add top ISPs/orgs table [pre-2026]
- [x] Add top referral domains table [pre-2026]
- [x] Add top cities table [pre-2026]
- [x] Add raw visit log with all fields [pre-2026]
- [x] Add multi-site filter [pre-2026]

---

## Milestone 7 — Secondary Pages

- [x] Build `MyResultsPage` with email lookup form [pre-2026]
- [x] Build `UnsubscribePage` with reason-specific humorous copy [pre-2026]
- [x] Implement one-click unsubscribe (UPDATE `unsubscribed = true`) [pre-2026]
- [x] Implement re-subscribe flow (UPDATE `unsubscribed = false`) [pre-2026]
- [x] Handle all edge cases: loading, not-found, error, already-unsubscribed, re-subscribed [pre-2026]

---

## Milestone 8 — AI Prompts Feature (Planned)

- [ ] Define system prompt and redirect prompt template strings for each VARK style (V, A, R, K)
- [ ] Define multimodal prompt templates for all two-style and three-style combinations
- [ ] Create `generateAIPrompts(scores: VarkScores): { systemPrompt: string; redirectPrompt: string }` utility function in `src/utils/aiPrompts.ts`
- [ ] Write unit tests for `generateAIPrompts` covering all 4 pure styles + key multimodal combinations
- [ ] Build `AIPromptsCard` component with two labelled prompt blocks and individual copy buttons
- [ ] Add copy-with-feedback state (button text changes to "Copied!" for 2 seconds) to each copy button
- [ ] Insert `AIPromptsCard` in `ResultsPage` between `ResultsExplanation` and "Want to try again?" card
- [ ] Ensure `AIPromptsCard` renders correctly on shareable `/r/:hash` results page (not just fresh completions)
- [ ] Add dark mode styling to `AIPromptsCard`
- [ ] Test prompts manually with ChatGPT, Claude, and Gemini to confirm they produce correct behaviour
- [ ] Add AI prompts section to the email report HTML template (`send-vark-report`)
- [ ] Update `PRD.md` with final prompt wording once copy is approved

---

## Milestone 9 — Security Hardening

- [ ] Move admin analytics dashboard token out of `AnalyticsPage.tsx` source code into an environment variable
- [ ] Move IPinfo API token out of `enrich-analytics/index.ts` source code into `Deno.env.get('IPINFO_TOKEN')`
- [ ] Update `unsubscribeUrl` in `send-vark-report` to use an env var for the deployed domain instead of hardcoded Netlify URL
- [ ] Update logo URL in email template to use env var or permanent CDN URL
- [ ] Review and tighten Supabase RLS policies — consider adding insert rate limiting on `quiz_responses`
- [ ] Audit all Edge Functions for accidental sensitive data logging

---

## Milestone 10 — Quality & Polish

- [ ] Add Vitest + React Testing Library for unit tests on critical paths (scoring, URL encoding/decoding, prompt generation)
- [ ] Fix TypeScript `any` on `scores` field in `src/types/supabase.ts` — replace with `VarkScores`
- [ ] Add proper 404 page for unmatched routes
- [ ] Add `<meta>` Open Graph tags to `index.html` for better social sharing previews
- [ ] Add loading skeleton states to `MyResultsPage` and `AnalyticsPage`
- [ ] Audit and clean up all `console.log` statements in production code
- [ ] Investigate migrating email to Resend or SendGrid if Gmail SMTP limits become a problem
- [ ] Add E2E test for the full quiz flow with Playwright (optional, good-to-have)
