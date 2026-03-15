# Varkly — VARK Learning Style Quiz

Varkly is a fast, frictionless web app that helps you discover your VARK learning style and immediately apply it to every AI tool you use. The experience is instant, playful, and genuinely useful — no accounts, no database, no server.

---

## Features

- **13-question VARK quiz** — Scenario-based, humorous multiple-choice questions (multi-select per question). Quiz state is persisted in `sessionStorage` so progress is never lost on a refresh.
- **Instant shareable results** — Scores are base64-encoded into a unique URL (`/r/:hash`) that anyone can open without an account or server lookup.
- **AI Prompts** — Copy-ready system and conversation prompts generated client-side from your VARK scores, ready to paste into any AI tool.
- **Dark mode** — Full dark/light mode switching persisted in `localStorage`.
- **Voice quiz** (`/quiz/voice`) — Speak answers; TTS + STT + LLM mapping (see below).

---

## Voice quiz: real-time vs pre-generated audio (demo choice)

**What the codebase supports:** Full **in-browser**, **online-capable** voice processing is wired up: **TTS** (Kokoro) and **STT** (Whisper) run in a Web Worker; answers are mapped to VARK via an LLM. That path is **responsive** once models are loaded—i.e. true **real-time** synthesis and transcription are possible for anyone who runs the app with local or proxied models (see below).

**What we use for the hackathon demo:** Question audio and short confirmations are served from **pre-generated WAV files** (`quiz-audio/q0.wav` … `got-it.wav`, etc.). That keeps **Play** and the first question **instant** for judges and visitors, with no long first-load wait for TTS. It does **not** mean voice is “fake”: the same Kokoro voice and scripts generate those files; the **live** worker path remains available for **Play question** fallbacks, other voices, and development.

**Summary:** Real-time TTS/STT **is** supported in-repo; **pregen** is a **demo speed** choice, not an architectural limit.

---

## Architecture

Varkly is stateless: no accounts, no database for quiz/results. The **text** quiz and **results** page need no server. The **voice** quiz calls an LLM from the browser (OpenRouter or a team-configured base URL in `.env` only)—see Getting Started.

```
Browser (React SPA)
    │
    ├── Quiz state         → sessionStorage (ephemeral, cleared on tab close)
    ├── Theme preference   → localStorage
    ├── Score calculation  → in-memory (QuizContext.calculateScores)
    └── Results sharing    → URL encoding (btoa/atob, no server involved)
```

### Shareable URL encoding

```
scores string: "V-A-R-K"  (e.g. "9-2-1-1")
base64 encode: btoa("9-2-1-1") = "OS0yLTEtMQ=="
strip padding: "OS0yLTEtMQ"
final URL:     https://varkly.app/r/OS0yLTEtMQ
```

Anyone with a `/r/:hash` link can view the results without any server request. The URL is fully self-contained.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Icons | Lucide React |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── App.tsx                        # Root component — routes: /, /quiz, /results, /r/:hash
├── main.tsx                       # App entry point
├── index.css                      # Global Tailwind styles
├── types/
│   └── index.ts                   # Core types: Question, VarkScores, QuizState
├── data/
│   └── questions.ts               # All 13 VARK quiz questions
├── contexts/
│   ├── QuizContext.tsx            # Quiz state management (answers, navigation, scoring)
│   └── ThemeContext.tsx           # Dark/light mode context
└── components/
    ├── landing/LandingPage.tsx    # Home page with quiz intro
    ├── quiz/
    │   ├── QuizContainer.tsx      # Quiz flow orchestration
    │   ├── QuizIntro.tsx          # Pre-quiz intro screen
    │   ├── Question.tsx           # Individual question component
    │   └── ProgressBar.tsx        # Progress indicator
    ├── results/
    │   ├── ResultsPage.tsx        # Results display and shareable URL
    │   ├── ResultsChart.tsx       # VARK score bar chart
    │   └── ResultsExplanation.tsx # Per-style tips and explanations
    └── shared/
        └── ThemeToggle.tsx        # Dark/light mode toggle button
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install and run

```bash
npm install
npm run dev
```

**Text quiz + results:** No env vars required.

**Voice quiz LLM:** Mapping spoken answers to VARK options needs either **`VITE_OPENROUTER_API_KEY`** (see [.env.example](.env.example)) or a team-provided **`VITE_LLM_BASE_URL`** to an OpenAI-compatible API. **Do not commit** private proxy URLs or keys—they are equivalent to API access. Use `.env` locally only; `.env.example` shows placeholders only.

### Voice quiz (`/quiz/voice`)

1. **Demo / judges:** Pregenerated WAVs give **immediate** question audio. Generate once: `npm run serve-models` (port 8080) + `npm run pregenerate-quiz-audio` (see [.env.example](.env.example) for `VITE_TTS_MODEL_PROXY_URL` and `VITE_TTS_VOICE`).  
2. **Live TTS + STT:** Same app can run **real-time** Kokoro + Whisper in the worker once models are available (local proxy or HF). Pregen is optional; if WAVs are missing, **Play question** uses live TTS (slower first time).  
3. **Optional OpenAI backend** for &lt;2s latency in constrained demos: **[docs/voice-backend.md](docs/voice-backend.md)** — `OPENAI_API_KEY`, `npm run server` + `npm run dev`.  
4. **Local models:** **[docs/local-voice-models.md](docs/local-voice-models.md)** — `download-voice-models`, `serve-models`, `VITE_TTS_MODEL_PROXY_URL`.

### Build for production

```bash
npm run build
```

The output is in `dist/`. The included `vercel.json` configures SPA rewrites for Vercel deployments so `/r/:hash` deep links work correctly.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run server` | Voice backend (TTS + STT) on port 3001; needs `OPENAI_API_KEY` |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run download-voice-models` | Download Kokoro + Whisper to `local-models/` |
| `npm run serve-models` | Serve `local-models/` on port 8080 (for local TTS) |
| `npm run pregenerate-quiz-audio` | Generate WAVs for each voice quiz question (instant Play; run after `serve-models`) |

---

## Handover / debugging

- **Voice quiz bugs (TTS + Esc):** See **[docs/handover-voice-quiz-bugfixing.md](docs/handover-voice-quiz-bugfixing.md)** for a detailed handover (what’s broken, what’s been tried, suggested next steps) so another developer or agent can continue.
- **Cline Memory Bank (canonical):** **`.cline/memory-bank/`** — exactly five files: `00_project-brief.md`, `01_current-goal.md`, `02_decisions.md`, `03_progress-log.md`, `04_open-questions.md`. (Directory is gitignored; create locally if missing.)
