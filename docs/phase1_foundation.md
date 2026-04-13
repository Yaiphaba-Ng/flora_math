# Phase 1: Foundation & DB Wiring

## Goals
1. Monorepo Setup: Create `/backend` and `/frontend` directories.
2. Initialize the Python backend via Astral `uv` and install core dependencies.
3. Establish the SQLite + SQLModel database architecture.
4. Define the Data Models layout enforcing "Weak Spot" analytics capability mapping.
5. Setup the React/Next.js frontend.

## Database Design Summary
We leverage SQLite to eradicate heavy SQL setups, coupled with `JSON` columns to provide enormous flexibility for isolated game modules.
The base models include:
- `User`
- `QuizSession`
- `QuestionMetric` (with fields for `response_time_ms` and `question_string`)
- `AppConfig` (for dynamic UI text and features)

## Key Technical Decisions
* Replaced `Redis` with `SQLite` for rich offline historical querying.
* Chose **Plugin/Domain Pattern** in the Python codebase to make extending quizzes drop-in friendly.
