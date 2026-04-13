# Phase 3: The Magical UI & Gamification

## Goals
1. Establish Design System: Off-white (`#FAF9F6`), Primary Pink (`#FFB6C1`), Vibrant Accent (`#FF9EBB`).
2. Implement Global Store: Setup Zustand for managing the active quiz and sound effects toggle.
3. Animations: Utilize Framer Motion to create satisfying UI interactions (`BouncyButton`, sliding question cards).
4. Audio API: Integrate pop/boop sounds for immediate gamified feedback. 
5. Build the core `<QuizWrapper>` that talks to the FastAPI endpoints.

## Important Note
Tailwind overrides must be strictly mapped per the user's design requirements. Developer-experience (DX) rules still apply; keep components heavily factored out (e.g. `BouncyButton.tsx` instead of mixing motion tags inside raw layouts).
