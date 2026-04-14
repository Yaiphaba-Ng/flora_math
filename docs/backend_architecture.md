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

## 5. LLM & Intelligence Integration 🌸
FloraMath uses AI to provide encouragement and motivation via Google Gemini and Groq.
- **Shared LLM Client (`src/lib/llmClient.ts`)**: A provider-agnostic factory that intercepts requests and dispatches them to the configured provider (Gemini or Groq).
- **AppConfig Store**: The database table `AppConfig` stores the active `llm_provider`, `llm_model`, and encrypted (if implemented) or raw `llm_api_key_gemini` and `llm_api_key_groq`.
- **Latency Optimization**: Both `/api/llm/quote` and `/api/llm/encouragement` are designed to be consumed by SWR hooks to keep the UI zero-latency.

## 6. Settings Persistence
The `/settings` route manages global application state via the `AppConfig` table.
- **Database Fallback**: Settings API routes (`/api/settings/llm/test` and `/api/settings/llm/models`) intelligently fallback to database-stored keys if the request body is empty.
- **Live Model Discovery**: The `/api/settings/llm/models` endpoint performs live discovery against provider APIs rather than using hardcoded lists.
