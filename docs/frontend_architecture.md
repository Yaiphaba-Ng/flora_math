# 🌸 Frontend Architecture guide

FloraMath is a blazing-fast, Next.js App Router application built on a **Hybrid Client-Side Architecture**. 
To ensure zero-latency when users submit answers, the "gameplay loop" executes entirely inside the browser's memory without waiting for backend network requests.

---

## 1. The Gameplay Loop (`useQuizSession.ts`)
The core engine driving the quiz is located at `src/hooks/useQuizSession.ts`.
- When a user starts a quiz, the hook dynamically loads the requested TypeScript module from `src/lib/quiz/registry.ts`.
- It executes `module.generateQuestions()` directly in the browser to build the question sequence instantly.
- When `submitAnswer()` is triggered, the hook synchronously invokes `module.evaluateAnswer()` to calculate the result in `0.0ms` and update React state immediately.
- The hook safely accumulates all correctness and timing metrics privately in a `useRef` array while the game runs.

## 2. Zustand State Management
- **`useConfigStore`**: Stores the user's customized difficulty sliders and preferences in `localStorage`. 
- Because configuration is persisted locally via `Zustand persist`, the sliders always remember where the user left them between sessions.

## 3. UI and Transitions (Framer Motion)
FloraMath relies heavily on *Framer Motion* for its soft, bouncy aesthetic.
- **Micro-interactions:** Elements like `BouncyButton` use `whileTap={{ scale: 0.9 }}` to provide immediate tactile feedback.
- **Overlays:** The "Correct/Incorrect" full-screen feedback relies on `<AnimatePresence>` to smoothly enter and exit the DOM hierarchy. 
- *Note:* The structural markup heavily utilizes `data-testid` and `id` properties—refer to `elementId_ref.md` before altering the DOM structure.

## 5. Intelligence Layer (LLM SWR Caching)
To integrate AI without introducing latency, FloraMath implements a **Stale-While-Revalidate (SWR)** pattern using `localStorage`.

- **`src/hooks/useQuoteOfDay.ts`**:
  - **First Visit**: Displays a minimal loading spinner while awaiting the Gemini/Groq API.
  - **Subsequent Visits**: Instantly returns the quote cached in `localStorage` from the previous session, then silently refreshes it in the background for the next visit.
- **`src/hooks/useEncouragements.ts`**:
  - Pre-fetches a batch of 5 encouraging phrases as soon as a quiz begins.
  - To mitigate rate-limiting, background refreshes are delayed by 4 seconds after page load.
  - Serves results with zero latency during the active gameplay loop.

## 6. App Configuration (`/settings`)
The `/settings` page allows runtime configuration of the LLM provider.
- It uses **React Query** for server state management.
- Features **Live Model Discovery**: The UI communicates with the backend to fetch available models directly from the provider APIs.
- Includes a **Connection Tester**: Leverages a dedicated test endpoint to verify API keys against the chosen provider before database commit.
