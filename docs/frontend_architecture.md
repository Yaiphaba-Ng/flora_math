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

## 4. End-of-Session Background Sync
To avoid UI freezing, the frontend ONLY contacts the backend once the quiz is definitively over.
When the final question is answered, `useQuizSession` fires an asynchronous, non-blocking `fetch()` to `/api/quiz/sync`. This commits the user's progress and stats to the database invisibly.
