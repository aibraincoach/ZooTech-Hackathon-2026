# Planning — Varkly

**Last updated:** 2026-03-14

---

## 1. Vision

Varkly is the fastest, most frictionless way to discover your VARK learning style and immediately apply it. The experience should feel instant, playful, and genuinely useful — not another academic form. Every person who completes the quiz leaves with something actionable: a shareable URL, personalised tips, and (coming soon) ready-to-paste AI prompts that make every AI tool they use smarter about how they learn.

The long-term vision is to make Varkly the canonical "learning style passport" — a single result URL you hand to teachers, coaches, therapists, AI assistants, and colleagues so they instantly know how to communicate with you.

---

## 2. Architecture Overview

```
Browser (React SPA)
    │
    ├── Supabase JS Client (anon key)
    │       ├── quiz_responses table  (INSERT on form submit, UPDATE on quiz complete)
    │       ├── visitor_analytics table (INSERT on every page view)
    │       └── quiz_responses table  (SELECT unsubscribe data, UPDATE unsubscribe flag)
    │
    └── Supabase Edge Functions (called via fetch with anon Bearer token)
            ├── send-vark-report      (POST — email delivery)
            ├── enrich-analytics      (POST — IP geolocation)
            ├── get-my-results        (POST — historical results lookup)
            ├── analytics-data        (GET — admin dashboard, single site)
            ├── analytics-data-enriched (GET — admin dashboard, enriched)
            └── analytics-data-multi-site (GET — admin dashboard, multi-site)
```

The frontend is a pure SPA — there is no custom server. All server-side logic runs inside Supabase Edge Functions (Deno). The database is Supabase-hosted PostgreSQL with Row Level Security.

---

## 3. Tech Stack with Rationale

### React 18 + TypeScript
- React chosen for its component model and the ecosystem of animation/chart libraries.
- TypeScript for safety across the full data flow from Supabase types through to UI props.

### Vite 5
- Dramatically faster HMR than Create React App. Native ESM. Smaller build output.

### React Router v6
- Declarative routing. `useParams` used to decode scores from the shareable `/r/:hash` URL pattern.

### Tailwind CSS v3
- Utility-first allows rapid UI iteration without naming collisions.
- `dark:` variants for dark mode support without a second stylesheet.
- `tailwind.config.js` customises the `card` and button utilities via `@layer components`.

### Framer Motion v11
- Page/card enter animations (opacity + y translate) used throughout.
- `whileHover` / `whileTap` on buttons for subtle tactile feedback.

### Recharts v2
- Bar chart for VARK score visualisation in `ResultsChart`.
- PieChart and LineChart in the admin analytics dashboard.
- Chosen over Chart.js for its React-native API (no imperative DOM manipulation).

### Supabase
- PostgreSQL with RLS eliminates the need for a custom API server for data persistence.
- Edge Functions (Deno) allow server-side logic (email, IP lookup, analytics aggregation) without standing up a Node.js server.
- Anon key is safe to expose in the frontend because RLS policies control what each role can access.
- Service role key is only used inside Edge Functions.

### nodemailer + Gmail SMTP
- Simpler than a dedicated email API (SendGrid, Resend) for the current volume.
- Gmail App Password stored as Edge Function secret.
- **Known risk:** Gmail SMTP is rate-limited and not designed for transactional email at scale. Should be migrated to a dedicated email provider if send volume grows.

### Google reCAPTCHA v3
- Invisible scoring-based CAPTCHA. Score threshold set to 0.5 in the Edge Function.
- Optional (graceful degradation if `VITE_RECAPTCHA_SITE_KEY` is not set).

### ua-parser-js
- Parses `navigator.userAgent` into structured browser/OS/device fields for analytics.

### Vercel
- Zero-config SPA deployment. `vercel.json` adds a catch-all rewrite to `index.html` so React Router deep links work.

---

## 4. Supabase Database Schema

### `quiz_responses`

```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
email          text NULL
first_name     text NULL
reason         text NULL
custom_reason  text NULL
scores         jsonb NOT NULL     -- { V: number, A: number, R: number, K: number }
answers        jsonb NOT NULL     -- { [questionId]: string[] }
results_url    text NOT NULL
email_sent     boolean DEFAULT false
ip_address     inet NULL
user_agent     text NULL
unsubscribed   boolean DEFAULT false
created_at     timestamptz DEFAULT now()
```

**RLS Policies:**
- Anon users can INSERT
- Service role has full access

**Write pattern:**
1. On email form submit → INSERT with `{ email, first_name, reason, scores: {V:0,A:0,R:0,K:0}, answers: {}, results_url: '' }` → returns `id`
2. On quiz completion → UPDATE by `id` with `{ scores, answers, results_url }`
3. Anonymous quiz completion (no email) → INSERT with full scores/answers/results_url in one step

---

### `emails`

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
recipient     text NOT NULL
subject       text NULL
body          text NULL       -- Full HTML email body
cc            text NULL
bcc           text NULL
status        text DEFAULT 'pending'   -- pending | sending | sent | failed
smtp_response text NULL
metadata      jsonb NULL      -- { type, scores, dominantStyles, reason, quiz_response_id }
created_at    timestamptz DEFAULT now()
```

Used as an email log. Every outbound email attempt is recorded before sending and updated with the SMTP result.

---

### `visitor_analytics`

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
timestamp         timestamptz DEFAULT now() NOT NULL
session_id        text NOT NULL
ip_address        inet NULL
user_agent        text NULL
page_path         text NOT NULL
query_parameters  jsonb NULL
referrer          text NULL
utm_source        text NULL
utm_medium        text NULL
utm_campaign      text NULL
utm_term          text NULL
utm_content       text NULL
browser_name      text NULL
browser_version   text NULL
os_name           text NULL
os_version        text NULL
device_type       text NULL       -- mobile | tablet | desktop
screen_width      integer NULL
screen_height     integer NULL
viewport_width    integer NULL
viewport_height   integer NULL
language          text NULL
timezone          text NULL
page_load_duration integer NULL   -- milliseconds
country           text NULL       -- enriched by Edge Function
city              text NULL       -- enriched by Edge Function
created_at        timestamptz DEFAULT now()
```

**RLS Policies:**
- Anon users can INSERT (page view tracking)
- Only service role can SELECT (privacy)

---

## 5. Edge Function Design

### `send-vark-report`
**Trigger:** POST from `ResultsPage` after quiz completion  
**Auth:** Supabase anon Bearer token  
**Flow:**
1. Parse JSON body
2. Check all honeypot field locations → reject if non-empty
3. Validate with Zod schema
4. Verify reCAPTCHA score (if token provided)
5. Check Gmail SMTP credentials exist
6. Build personalised HTML + plain text email (`generateEmailContent`)
7. INSERT email record with `status: "sending"`
8. Send via nodemailer
9. UPDATE email record with `status: "sent"` + SMTP response, or `status: "failed"` + error

**Env vars required:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`, `RECAPTCHA_SECRET`

---

### `enrich-analytics`
**Trigger:** POST from `VisitorTracker` after inserting analytics row  
**Auth:** Supabase anon Bearer token  
**Flow:**
1. Extract real IP from request headers (cf-connecting-ip → x-real-ip → x-forwarded-for)
2. Skip local/private/bogon IPs
3. Call IPinfo API with the IP
4. Find recent `visitor_analytics` rows with that IP that have `city IS NULL`
5. UPDATE those rows with city/region/country/org

**Env vars required:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`  
**External dependency:** IPinfo API (token hardcoded in source — should be moved to env var)

---

### `get-my-results`
**Trigger:** POST from `MyResultsPage`  
**Auth:** Supabase anon Bearer token  
**Flow:**
1. Parse email from body
2. Query `quiz_responses` by email (normalised to lowercase)
3. Return `id`, `created_at`, `results_url`, `scores` for matching records

---

### `analytics-data-multi-site`
**Trigger:** GET from `AnalyticsPage`  
**Auth:** Admin token via query parameter  
**Returns:** Aggregated analytics across all tracked domains — visitors per day, device breakdown, top IPs, top ISPs, top referrers, top cities, raw visit log

---

## 6. Shareable Results URL Encoding

Results are encoded into a URL without any server-side storage of the hash:

```
scores string: "V-A-R-K"  (e.g. "9-2-1-1")
base64 encode: btoa("9-2-1-1") = "OS0yLTEtMQ=="
strip padding: "OS0yLTEtMQ"
final URL:     https://varkly.app/r/OS0yLTEtMQ
```

On load, `ResultsPage` decodes `atob(hash)`, splits on `-`, and validates each value is a number between 0 and 13. Invalid hashes redirect to `/`.

**Implication:** The results URL is fully self-contained. Anyone with the link can view the results. No lookup is needed. The tradeoff is that the URL encodes only the scores, not the full answer breakdown.

---

## 7. AI Prompts Feature — Design

### Approach
All prompts are generated client-side from the `VarkScores` object. No new API calls, no new database columns needed for the MVP.

### System Prompt Template Structure
```
"I'm a [style description] learner (VARK scores: V=[V], A=[A], R=[R], K=[K]).

[Style-specific communication instructions]

[Style-specific structure instructions]

[Style-specific check-in instruction]"
```

### Redirect Prompt Template Structure
```
"Quick note: I'm a [dominant style] learner. [Single-sentence style-appropriate redirect request]."
```

### Style Communication Instructions (per dominant type)

**Visual (V dominant):**
- Use diagrams, flowcharts, spatial metaphors, and visual analogies
- Structure with clear visual hierarchy: headers, callout boxes, bullet points
- Avoid long unbroken prose

**Auditory (A dominant):**
- Use conversational language, rhetorical questions, and verbal walkthroughs
- Offer to "talk through" concepts step by step
- Avoid walls of bullet points — write as you'd speak

**Read/Write (R dominant):**
- Use detailed written explanations, numbered lists, and defined terminology
- Provide references or structured summaries
- Avoid analogies that require visualisation — just say it directly

**Kinesthetic (K dominant):**
- Use real-world examples, case studies, and "try this" instructions
- Frame explanations around doing: "here's how you'd apply this"
- Offer to walk through a concrete example rather than abstract theory

**Multimodal:**
- Blend the instructions for each dominant style

### Component Placement
New `AIPromptsCard` component inserted in `ResultsPage` between `ResultsExplanation` and the "Want to try again?" card.

---

## 8. Vercel Deployment Config

`vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures all deep-link routes (`/r/:hash`, `/u/:id`, `/my-results`, `/analytics`) are served by the React app rather than returning a 404.

---

## 9. Known Risks and Technical Debt

| Risk | Severity | Mitigation / Status |
|---|---|---|
| Admin analytics token `SECRET123` hardcoded in `AnalyticsPage.tsx` | **High** | Move to env var. Anyone who reads the source code can access the analytics dashboard. |
| IPinfo API token hardcoded in `enrich-analytics/index.ts` | **Medium** | Move to `Deno.env.get('IPINFO_TOKEN')` |
| Gmail SMTP for transactional email | **Medium** | Acceptable at low volume; migrate to Resend or SendGrid if send volume exceeds ~100/day |
| `unsubscribeUrl` in `send-vark-report` hardcoded to `vark-questionnaire.netlify.app` | **Medium** | Should use the actual deployed domain. Update to use an env var. |
| Logo URL in email hardcoded to `vark-questionnaire.netlify.app` | **Low** | Update to Vercel URL or a CDN asset |
| `quiz_responses` RLS allows anonymous INSERT without rate limiting | **Low** | Honeypot + reCAPTCHA mitigate abuse; could add pg-based rate limit if needed |
| No test suite | **Low** | No unit or integration tests exist; add Vitest + React Testing Library for critical paths |
| `scores` field in `quiz_responses` is `any` in TypeScript types | **Low** | Should be typed as `VarkScores` |
