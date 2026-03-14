# PRD — Varkly: VARK Learning Style Quiz

**Version:** 1.0  
**Last updated:** 2026-03-14  
**Status:** Active development

---

## 1. Product Overview

Varkly is a web-based VARK learning style assessment tool. Users answer 13 scenario-based, humorous multiple-choice questions and instantly receive a personalised results page showing their Visual, Auditory, Read/Write, and Kinesthetic (VARK) scores, dominant style explanations, and coaching tips. An optional email capture delivers a detailed coaching report. Results are shareable via a unique URL that encodes the scores — no login required.

The app is built for the **AI Brain Coach** brand and features a recurring humorous persona named **RayRayRay** throughout the UI and emails.

---

## 2. User Personas

### Persona A — The Self-Improver
- Age 25–45, professional or student
- Interested in personal development, productivity, and understanding how they think
- Has heard of learning styles before but never formally assessed themselves
- Primary motivation: "I want to learn faster and stop wasting time on methods that don't work for me"

### Persona B — The Coaching Client
- Onboarding as an AI Brain Coach client
- Needs their learning style assessed as part of a coaching intake workflow
- Will use results to personalise their coaching sessions

### Persona C — The Coach / Tool Explorer
- Educator, coach, HR professional, or parent
- Exploring tools to use with students, clients, or children
- Wants to understand the methodology before recommending it

### Persona D — The Casual Curious
- Arrived via social share, friend recommendation, or search
- Low commitment — will take the quiz for fun
- May or may not provide an email

---

## 3. User Stories

### Core Quiz Flow
- As a user, I can take the 13-question VARK quiz without creating an account so that the barrier to entry is zero.
- As a user, I can select multiple answers per question so that I can honestly reflect my mixed preferences.
- As a user, I can skip a question so that I'm not forced to choose an answer that doesn't fit.
- As a user, I can go back to a previous question so that I can change my answer.
- As a user, my quiz progress is saved if I accidentally refresh the page so that I don't lose my answers.
- As a user, I see a progress indicator while taking the quiz so that I know how far along I am.

### Results
- As a user, I see my VARK scores displayed immediately after completing the quiz so that I get instant gratification.
- As a user, I receive an explanation of my dominant learning style(s) and specific tips so that I know how to act on the results.
- As a user, I receive a unique shareable URL for my results so that I can share them with others or return to them later.
- As a user, I can copy the shareable URL to my clipboard or use the native share sheet.
- As a user, I can retake the quiz from the results page.

### Email & Report
- As a user who provided an email, I receive a personalised HTML coaching report by email after completing the quiz.
- As a user, I can optionally provide my name, email, and reason for taking the quiz before starting — or skip and take the quiz anonymously.
- As a subscribed user, I can unsubscribe from Varkly emails via a unique link in every email.
- As an unsubscribed user, I can re-subscribe from the unsubscribe page.

### My Results
- As a returning user, I can look up all my past quiz attempts by entering my email on the `/my-results` page.

### AI Prompts (Planned Feature)
- As a user, after completing the quiz I can see two generated AI prompts on my results page:
  1. A **system prompt** I can paste into any AI assistant (ChatGPT, Claude, etc.) to configure it to always communicate in a way that matches my VARK learning style.
  2. A **conversation starter prompt** — a short, reusable line I can drop into any existing AI chat mid-session to redirect the AI's communication style to suit how I learn.
- As a user, I can copy either prompt with a single click.
- The goal is to eliminate the cognitive load of explaining how I learn to an AI ever again.

---

## 4. Existing Routes & Features

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero, VARK style grid, email capture CTA, "Start Quiz" button |
| `/quiz` | `QuizContainer` | 13-question quiz with multi-select, skip, back navigation, and progress bar |
| `/results` | `ResultsPage` | Live quiz result: chart, explanation, share URL, email status |
| `/r/:hash` | `ResultsPage` | Shareable result: scores decoded from base64 hash in URL |
| `/my-results` | `MyResultsPage` | Email-based historical results lookup |
| `/u/:id` | `UnsubscribePage` | Unsubscribe / re-subscribe email preferences |
| `/analytics` | `AnalyticsPage` | Token-protected admin analytics dashboard |

### Landing Page (`/`)
- Sticky nav with logo, "My results" link, and theme toggle
- Hero headline and subheading
- "Why is your brain ignoring half of what you learn?" copy section
- Optional email capture modal (first name, email, reason, honeypot, reCAPTCHA v3)
- 4-style grid (Visual, Auditory, Read/Write, Kinesthetic)
- Primary CTA: "Start Your Free Quiz (Press Enter)"
- Enter key shortcut to start quiz

### Email Capture Modal
- Fields: first name (optional), email (required), reason (required dropdown), custom reason (conditional text input, 127 char limit)
- Hidden honeypot field
- reCAPTCHA v3 token attached to submission
- Immediately inserts a placeholder `quiz_responses` row (with zeros) when submitted — record ID is carried through quiz to be updated on completion
- Rotating playful loading messages while saving

### Quiz (`/quiz`)
- `QuizProvider` context manages all state in `sessionStorage`
- Index `-1` = intro screen; `0–12` = questions; completion triggers `/results` navigate
- Multi-select per question (answers stored as `Record<number, string[]>`)
- Back / forward / skip controls
- `ProgressBar` shows completion percentage
- `QuizIntro` screen before question 1

### Results Page (`/results` and `/r/:hash`)
- On fresh completion: updates existing `quiz_responses` row with final scores + answers + results URL (if email was captured), or inserts a new anonymous row
- Triggers `send-vark-report` Edge Function if email was provided
- `ResultsChart` renders VARK bar/radar chart using Recharts
- `ResultsExplanation` shows per-style tips and a RayRayRay coaching quote
- Share UI: copy button + native Web Share API fallback
- Results URL format: `https://varkly.app/r/<btoa("V-A-R-K").replace(/=/g, '')>`
- Decoded on load from `useParams().hash`
- Status banners for save (saving/saved/error) and email (sending/sent/error)

### My Results (`/my-results`)
- Email input → calls `get-my-results` Edge Function
- Returns list of past attempts with date, dominant style label, and link to results URL

### Unsubscribe (`/u/:id`)
- Looks up `quiz_responses` record by UUID
- Shows reason-specific humorous acknowledgment (using original reason they gave for taking the quiz)
- One-click unsubscribe or re-subscribe
- States: loading, found, unsubscribed, resubscribed, error, not-found

### Admin Analytics Dashboard (`/analytics?admin_token=SECRET123`)
- Token-protected (hardcoded `SECRET123` in client — see Known Risks)
- Multi-site support via site filter
- Charts: visitors per day (LineChart), device type breakdown (PieChart)
- Tables: top IPs (with DNS lookup links), top ISPs/orgs, top referral domains, top cities
- Raw visit log with session, timestamp, IP, page path, device, browser, OS, city, ISP, duration
- Expandable rows for per-site path breakdown

### Visitor Tracking
- `VisitorTracker` invisible component mounted in `App.tsx` — calls `trackVisitor()` on mount and `trackPageView()` on route changes
- Tracks: session ID, page path, referrer + domain/path, UTM params, browser/OS/device type, screen/viewport dimensions, language, timezone, page load duration
- Skips in development mode, on dev domains, and for bots
- Enriched server-side via `enrich-analytics` Edge Function using IPinfo API (city, region, country, org/ISP)
- time-on-page tracked via `beforeunload` and `visibilitychange` events

---

## 5. Supabase Edge Functions

| Function | Trigger | Purpose |
|---|---|---|
| `send-vark-report` | Called from `ResultsPage` after quiz completion | Validates honeypot + reCAPTCHA, generates HTML/text email, sends via Gmail SMTP (nodemailer), logs to `emails` table |
| `enrich-analytics` | Called from `VisitorTracker` after inserting analytics row | Looks up IP via IPinfo API, updates `visitor_analytics` rows with city/region/country/ISP |
| `get-my-results` | Called from `MyResultsPage` | Queries `quiz_responses` by email, returns id/created_at/results_url/scores |
| `analytics-data` | Called from `AnalyticsPage` | Returns aggregated analytics for a single site |
| `analytics-data-enriched` | Called from `AnalyticsPage` | Returns enriched analytics data |
| `analytics-data-multi-site` | Called from `AnalyticsPage` | Returns aggregated analytics across multiple tracked domains |

---

## 6. Technical Requirements

### Frontend
- React 18 + TypeScript; SPA with React Router v6
- Vite 5 build toolchain; Tailwind CSS v3 for styling
- Framer Motion for page/component animations
- Recharts for score visualisation
- `ua-parser-js` for browser/device detection in analytics
- All quiz state persisted in `sessionStorage`
- Dark/light mode persisted in `localStorage`, applied via a flash-prevention inline script in `index.html`
- Google Fonts: Inter (400, 500, 600, 700)

### Backend / Data
- Supabase PostgreSQL database (hosted)
- Supabase Edge Functions (Deno runtime)
- Email delivery via Gmail SMTP with nodemailer inside the Edge Function
- IP geolocation via IPinfo API

### Security
- Google reCAPTCHA v3 on email capture form and email send action
- Honeypot field (`hp_field`) checked both client-side and in Edge Function before any DB write
- IP address + user agent logged on all quiz submissions (including anonymous)
- Analytics dashboard protected by a query-parameter token (currently hardcoded — must be moved to env var)
- Supabase RLS: `quiz_responses` insertable by anon; `visitor_analytics` insertable by anon, readable only by service role

### Deployment
- Vercel (SPA rewrites configured in `vercel.json`)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RECAPTCHA_SITE_KEY`
- Edge Function env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`, `RECAPTCHA_SECRET`

---

## 7. Planned Feature: AI Prompts for Learning Style

### Problem Statement
Every time a user starts a new AI assistant session, they have to manually explain how they like to receive information. This is repetitive, forgettable, and creates cognitive friction. Most people don't do it at all, which means the AI defaults to a generic communication style that may not suit them.

### Solution
After completing the VARK quiz, the results page will generate two ready-to-use AI prompts personalised to the user's specific VARK score profile:

#### Prompt 1 — System Prompt (paste once, into the AI's "system" or "custom instructions" field)
A paragraph the user pastes into tools like ChatGPT's "Custom Instructions", Claude's "System Prompt", or any other AI assistant configuration. It tells the AI:
- The user's dominant learning style(s) and scores
- How to structure explanations (e.g. use diagrams/visuals, bullet lists, analogies for hands-on examples, verbal walkthroughs, etc.)
- How to check in and adapt if a response isn't landing

**Example output (Visual dominant):**
> "I'm a Visual learner (VARK scores: V=9, A=2, R=1, K=1). When explaining concepts, please use diagrams, flowcharts, spatial metaphors, and visual analogies where possible. Structure information with clear visual hierarchy — headers, callout boxes, and bullet points. Avoid long unbroken prose. When I seem confused, offer to draw a diagram or reframe the explanation visually."

#### Prompt 2 — Mid-Session Redirect Prompt (short, drop into any chat)
A 1–2 sentence prompt the user keeps saved and drops into any ongoing conversation to realign the AI's communication style mid-session.

**Example output (Visual dominant):**
> "Quick reminder: I'm a Visual learner. Please reframe that explanation using a diagram, spatial structure, or visual analogy."

### Implementation Notes
- Prompts are generated entirely client-side from the VARK scores — no new API calls required
- Each VARK style (and multimodal combination) has a template bank
- A dominant style is determined the same way as elsewhere in the app: highest score(s)
- Displayed in a new card on the results page below `ResultsExplanation`, with one-click copy buttons for each prompt
- No new database schema changes required
- Prompts should be in the email report as well (future iteration)

### Success Criteria
- Both prompts are accurate to the user's actual VARK profile
- Copy button works reliably across browsers
- Prompts are concise enough to be genuinely usable (system prompt ≤ 150 words, redirect prompt ≤ 40 words)

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Quiz completion rate | > 70% of users who reach `/quiz` complete all 13 questions |
| Email capture rate | > 25% of quiz starters voluntarily provide email |
| Email delivery rate | > 95% of sent emails successfully delivered |
| Results page share rate | > 15% of results page visitors copy or share their URL |
| AI prompt copy rate (new feature) | > 30% of results page visitors copy at least one AI prompt |
| Return visit rate (via /my-results) | Tracked via analytics |
| Unsubscribe rate | < 10% of emailed users |
| Bot/spam rate | < 1% of quiz submissions triggered by bots (honeypot + reCAPTCHA) |
