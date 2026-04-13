# 🗄️ Backend Architecture Guide

FloraMath is a full-stack App Router Next.js application. While the frontend handles the immediate active gameplay, the backend provides highly scalable long-term intelligence, analytics, and persistent storage using a **Serverless PostgreSQL Database** hooked up via Prisma ORM.

---

## 1. Database Specifications
- **Provider:** Neon Serverless PostgreSQL (or Supabase).
- **ORM:** Prisma (`v5.22.0`).
- **Schema Location:** `prisma/schema.prisma`
- Due to the nature of serverless connection pooling on platforms like Vercel, Prisma is explicitly generated during the build pipeline (`"build": "prisma generate && next build"` in `package.json`).

## 2. API Routes Hierarchy
All backend logic resides cleanly within Next.js API Route Handlers under `src/app/api/...`:
- Every route is flagged with `export const dynamic = 'force-dynamic'` to prevent aggressive Next.js static asset caching from freezing the API responses.

## 3. The Bulk Synchronization Webhook
The single most critical API endpoint is `POST /api/quiz/sync`.
To prevent database bottlenecks from locking up the user visually, the frontend never queries the DB to evaluate answers. Instead, it aggregates stats purely locally. 
Once the quiz finishes, it shoots a massive JSON blob containing timestamps, `is_correct` flags, and module configs to this endpoint. The endpoint securely unspools the payload and `createMany` injects it into Prisma.

## 4. Admin Analytics Tracking
The `QuestionMetric` and `QuizSession` data synchronized during gameplay is utilized entirely to fuel the `/admin` portal. 
- **`GET /api/admin/metrics/weak-spots`**: Aggregates recent `QuestionMetric` rows that scored `is_correct = false` to deduce what questions the user is struggling with.
- **`GET /api/admin/sessions/recent`**: Streams out the global leaderboard history for the UI chart.
