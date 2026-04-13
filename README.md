<h1 align="center">
  🌸 FloraMath 🌸
</h1>

<p align="center">
  A magical, personalized math quiz app — built as a gift. 🌷<br/>
  Soft pastel aesthetics, satisfying animations, and deep progress analytics.
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.13-FFB6C1?style=flat-square&logo=python&logoColor=white"/>
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.135-FF9EBB?style=flat-square&logo=fastapi&logoColor=white"/>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-FFB6C1?style=flat-square&logo=next.js&logoColor=white"/>
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4.0-FF9EBB?style=flat-square&logo=tailwindcss&logoColor=white"/>
</p>

---

## ✨ What Is This?

An interactive numerical aptitude quiz app with a soft, encouraging UI featuring:

- **Multiplication Tables, Squares, Cubes, Addition & Subtraction** — with configurable ranges.
- **Per-question response-time tracking** to identify "weak spots" over time.
- **An admin progress dashboard** showing session history, failure rates, and average response speeds.
- **Gamified sound effects** (pop ✅ / boop ❌) with a mute toggle.
- **Custom encouragement message engine** — inject personal messages between questions.

---

## 🏗️ Architecture

This is a monorepo containing two independent services:

```
FloraMath/
├── backend/        # Python · FastAPI · SQLModel · SQLite
├── frontend/       # Next.js 16 · Tailwind CSS · Framer Motion · Zustand
└── docs/           # Per-phase developer documentation
```

### Backend: Plugin/Domain Pattern
All quiz logic lives inside isolated single-file modules under `backend/app/services/modules/`. Adding a new quiz type (e.g. Fractions) is as simple as dropping in a new `.py` file — the registry auto-discovers it.

### Database: SQLite + JSON Columns
Zero infrastructure. One portable `.db` file. JSON columns allow flexible, schema-free storage of per-module config without needing migrations.

---

## 🚀 Running Locally

### Prerequisites
- **Python 3.13+** with [Astral `uv`](https://github.com/astral-sh/uv) installed.
- **Node.js 20+** with `npm`.

### 1. Start the Backend
```bash
cd backend
uv run uvicorn app.main:app --port 8000 --reload
```
The API will be live at **http://localhost:8000**.  
Auto-generated docs: **http://localhost:8000/docs**

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The UI will be live at **http://localhost:3000**.

---

## 📚 Documentation

Per-phase developer notes live in `/docs`:

| File | Contents |
|---|---|
| [`phase1_foundation.md`](./docs/phase1_foundation.md) | Monorepo setup, SQLite schema decisions |
| [`phase2_plugin_framework.md`](./docs/phase2_plugin_framework.md) | Plugin/Domain architecture, registry |
| [`phase3_magical_ui.md`](./docs/phase3_magical_ui.md) | Design system, Framer Motion, audio hooks |
| [`phase4_admin_dashboard.md`](./docs/phase4_admin_dashboard.md) | Metrics API, weak-spot queries, admin page |

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/quiz/modules` | List active quiz modules |
| `POST` | `/api/quiz/start` | Start a new quiz session |
| `POST` | `/api/quiz/answer` | Submit an answer + record metric |
| `GET` | `/api/admin/metrics/weak-spots` | Top failing questions by failure count |
| `GET` | `/api/admin/sessions/recent` | Last 10 completed sessions |

---

## 🧩 Adding a New Quiz Module

1. Create `backend/app/services/modules/your_module.py`.
2. Subclass `BaseQuizModule` from `base_module.py`.
3. Implement `generate_questions()` and `evaluate_answer()`.
4. Export a `register()` function returning an instance.

The registry and all API endpoints pick it up automatically. No further wiring needed.

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `brand-primary` | `#FFB6C1` | Buttons, headings, accents |
| `brand-accent` | `#FF9EBB` | Highlights, hover states |
| `brand-light` | `#FFE4E1` | Backgrounds, card tints |
| `background` | `#FAF9F6` | Page background |
| Font | Nunito (Google Fonts) | All text |
