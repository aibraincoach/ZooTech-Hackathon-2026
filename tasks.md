# Tasks — Varkly

**Last updated:** 2026-03-14

Tasks are organised by milestone. Check off items as they are completed and add the date: `[x] Task description [2026-03-14]`.

---

## Milestone 0 — Project Setup & Documentation

- [x] Create repository and initial Vite + React + TypeScript scaffold [pre-2026]
- [x] Configure Tailwind CSS v3 [pre-2026]
- [x] Configure React Router v6 [pre-2026]
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

---

## Milestone 3 — Landing Page

- [x] Build `LandingPage` with hero, VARK style grid, and CTA [pre-2026]
- [x] Add Enter key shortcut to start quiz from landing page [pre-2026]

---

## Milestone 4 — Stateless Refactor (remove email, DB, and analytics)

Remove all code that depends on Supabase, email delivery, or server-side persistence. The app must function with zero network calls.

- [ ] Remove email capture modal from `LandingPage.tsx` entirely
- [ ] Remove "My results" link from the landing page nav
- [ ] Remove `EmailCapture` type and all email-related fields from `src/types/index.ts`
- [ ] Remove email capture state (`emailCapture`, `setEmailCapture`) from `QuizContext.tsx`
- [ ] Remove save status banner (saving / saved / error) from `ResultsPage.tsx`
- [ ] Remove email status banner (sending / sent / error) from `ResultsPage.tsx`
- [ ] Remove all Supabase calls from `ResultsPage.tsx` (`updateQuizResponse`, `saveQuizResponse`, `sendVarkReport`)
- [ ] Delete `src/utils/supabase.ts`
- [ ] Delete `src/utils/analytics.ts`
- [ ] Delete `src/types/supabase.ts`
- [ ] Delete `src/types/analytics.ts`
- [ ] Delete `src/components/my-results/MyResultsPage.tsx`
- [ ] Delete `src/components/unsubscribe/UnsubscribePage.tsx`
- [ ] Delete `src/components/analytics/VisitorTracker.tsx`
- [ ] Delete `src/components/analytics/AnalyticsPage.tsx`
- [ ] Remove `/my-results`, `/u/:id`, and `/analytics` routes from `App.tsx`
- [ ] Remove `VisitorTracker` from `App.tsx`
- [ ] Remove `@supabase/supabase-js` from `package.json`
- [ ] Remove `ua-parser-js` and `@types/ua-parser-js` from `package.json`
- [ ] Remove reCAPTCHA script loading and all `grecaptcha` references from `LandingPage.tsx`
- [ ] Update `cursor.md` tech stack table to reflect removed dependencies
- [ ] Update `README.md` to reflect stateless architecture and simplified setup

---

## Milestone 5 — AI Prompts Feature

- [ ] Define system prompt and conversation prompt template strings for each VARK style (V, A, R, K)
- [ ] Define multimodal prompt templates for all two-style combinations
- [ ] Define broad multimodal prompt template for three-or-more-style ties
- [ ] Create `generateAIPrompts(scores: VarkScores): { systemPrompt: string; conversationPrompt: string }` in `src/utils/aiPrompts.ts`
- [ ] Write unit tests for `generateAIPrompts` covering all 4 pure styles + key multimodal combinations (Vitest)
- [ ] Build `AIPromptsCard` component with clearly labelled System Prompt and Conversation Prompt blocks
- [ ] Add one-click copy button to each prompt block
- [ ] Add copy-with-feedback state: button text changes to "Copied!" for 2 seconds after click
- [ ] Add explanatory text above each prompt block explaining what it is and when to use it
- [ ] Insert `AIPromptsCard` in `ResultsPage` between `ResultsExplanation` and "Retake Quiz" card
- [ ] Confirm `AIPromptsCard` renders correctly on the shareable `/r/:hash` results page
- [ ] Add full dark mode styling to `AIPromptsCard`
- [ ] Test System Prompt manually with ChatGPT, Claude, and Gemini — confirm AI behaviour matches VARK style
- [ ] Test Conversation Prompt manually in a live session — confirm mid-session reorientation works
- [ ] Update `PRD.md` with final approved prompt copy once wording is confirmed

---

## Milestone 6 — Quality & Polish

- [ ] Add Vitest + React Testing Library — unit tests for `calculateScores` and `generateAIPrompts`
- [ ] Add proper 404 page for unmatched routes
- [ ] Add `<meta>` Open Graph tags to `index.html` for better social sharing previews on the `/r/:hash` URL
- [ ] Audit and remove all `console.log` statements from production code
- [ ] Verify no residual Supabase imports or dead code remain after Milestone 4 cleanup
- [ ] Add E2E test for the full quiz → results → copy prompt flow with Playwright (good-to-have)
