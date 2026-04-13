# Phase 4: Admin & Metrics Visualization

## Goals
1. Provide a secure (or hidden) dashboard at `/admin` to review the metrics created by the Python Game loops.
2. Build Python Endpoints serving those SQLModel aggregate stats (Weak Spots, streaks).
3. Provide an interface to manage the Custom Encouragement Message Engine mapped to the `AppConfig` SQLite table.

## Key Technical Decisions
* The Admin dashboard leverages the same UI Gamified patterns (Tailwind + Framer Motion) but is geared towards analytics.
* Queries on `QuestionMetric` are aggregated directly in FastAPI backend and fed uniformly to TanStack React Query.
