# Phase 3: The Magical UI & Gamification

## Goals
1. Establish Design System: Off-white (`#FAF9F6`), Primary Pink (`#FFB6C1`), Vibrant Accent (`#FF9EBB`).
2. Implement Global Store: Setup Zustand for managing the active quiz and sound effects toggle.
3. Animations: Utilize Framer Motion to create satisfying UI interactions (`BouncyButton`, sliding question cards).
4. Audio API: Integrate pop/boop sounds for immediate gamified feedback. 
5. Build the core `<QuizWrapper>` that talks to the FastAPI endpoints.

## Important Note
Tailwind overrides must be strictly mapped per the user's design requirements. Developer-experience (DX) rules still apply; keep components heavily factored out (e.g. `BouncyButton.tsx` instead of mixing motion tags inside raw layouts).

## Configuration Range Philosophy (ALL Modules)
Do NOT impose tight arbitrary caps on configuration ranges. Trust the user — ranges should be as free as reasonably practical:
- **Multiplication tables:** 1–100 for table range, 1–50 for multiplier length.
- **Squares & Cubes:** 1–100.
- **Addition & Subtraction:** 1–6 digit complexity.
- **New modules:** Apply the same generous philosophy. Only enforce a hard cap if the value would cause a genuine technical issue (e.g. out-of-memory or UI overflow). Document the reason in the schema `hint` field.

## Mobile-First UI Mandate (ALL Components)
Every interactive element in the app MUST meet minimum touch target sizes. No exceptions:
- **Buttons & icon buttons:** minimum `44×44px` — use `p-3` or `w-11 h-11` as baseline. This **explicitly includes** close (`✕`) and reset (`↺`) utility buttons on config sheets and modals — they are not exempt.
- **Chip/pill buttons:** minimum `h-9` (36px height) with generous horizontal padding.
- **Toggle rows:** the entire row is the tap target, not just the pill widget.
- **Form inputs:** minimum `py-3` padding and `text-base` font size to prevent iOS zoom-on-focus.
- **Primary action buttons** (Start Quiz, Submit, Play): `py-4` minimum, full-width on mobile.

## Mandatory Feedback Standards (Apply to ALL Quiz Modules)
These rules are non-negotiable for every current and future quiz module:

1. **Always return `correct_answer` from the backend:** The `/api/quiz/answer` endpoint MUST always return a `correct_answer` field in its response payload.
   - Set to `null` when the answer is correct (no need to reveal it).
   - Set to the real answer string (e.g. `"56"`) when the answer is incorrect.

2. **Always display `correct_answer` on wrong answers:** The quiz UI MUST display the correct answer prominently when a user submits an incorrect response. Never leave a wrong answer without immediate clarification.

3. **Use the feedback counter pattern, never a boolean:** Feedback state uses the `AnswerFeedback` object (`{ id, isCorrect, correctAnswer }`) from `useQuizSession`. The `id` is a monotonically increasing counter used as the `useEffect` dependency. This ensures consecutive identical results (e.g. two correct in a row) always re-trigger the feedback animation — a bare `boolean` state will silently swallow them.
