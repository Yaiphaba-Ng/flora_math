**System Role & Context**
You are an expert full-stack developer and UI/UX designer. Your task is to build a modern, highly scalable, and visually adorable "Numerical Aptitude Quizzer" web application. 

**The Goal & Vibe**
This project is a personalized gift for my girlfriend. The UI must be extremely cute, soft, and encouraging. The design system should revolve around "off-white and pastel pink" aesthetics, utilizing bouncy, satisfying animations, rounded corners, soft shadows, and cute transition effects. The app must be intuitive, frictionless, and feature encouraging micro-copy (e.g., "Great job!", "You're doing amazing!").

**Tech Stack**
* **Frontend/Gameplay Engine:** Next.js (App Router), React, Tailwind CSS. Purely client-side evaluation for zero-latency.
* **Animations:** Framer Motion (for page transitions, button bounces, and success animations).
* **Backend/Database:** Neon PostgreSQL with Prisma. Used exclusively for background metrics synchronization to prevent UI blocking.
* **State Management:** React local state for quiz loops, Zustand for configuration persistence.
* **Audio:** Standard HTML5 Audio APIs for success/error sound effects.

**Design System & UI Guidelines**
* **Colors:** Backgrounds should be a warm off-white (e.g., `#FFFDFD` or `#FAF9F6`). Primary accents, buttons, and highlights should be varying shades of pastel and vibrant pinks (e.g., `#FFB6C1`, `#FF9EBB`).
* **Typography:** Use a clean, rounded, friendly font (like Nunito or Quicksand).
* **Animations:** * Buttons should gently scale down on press (`whileTap={{ scale: 0.95 }}`).
    * Numbers/Questions should slide and fade in smoothly.
    * Completing a session should trigger a cute celebratory animation (e.g., floating hearts or confetti).
* **Audio:** Include a mute/unmute toggle in the header. Add soft, pleasant "pop" sounds for correct answers, and a gentle "boop" for incorrect ones.

**Core Architecture (Future-Proofing)**
The codebase must be highly modular to easily add new quiz topics later. 
1.  **Quiz Registry:** Create a central configuration file (`quizModules.ts`) where quizzes are registered with their metadata (slug, title, icon, color theme, component path). The homepage UI should dynamically render cards based on this registry.
2.  **Base Quiz Engine:** Build a reusable `<QuizWrapper>` component that handles standard logic: score tracking, timer (optional), sound effect triggering, progress bars, and end-of-session summary screens. Specific quiz logic should be passed in as children or hooks.

**Module Specifications**
* **Module 1: Multiplication Table (Session-Based)**
    * *Configurable Variables:* Number range to test (e.g., tables 2 through 12), and Table length (e.g., x 1 to x 10 or x 15).
    * *Logic:* Generates a fixed array of questions based on settings. Must be completed start-to-finish.
* **Module 2 & 3: Squares & Cubes (Session-Based)**
    * *Configurable Variables:* Range of numbers to square/cube (e.g., 1-20).
    * *Logic:* Generates a fixed list of questions. The user must complete the session to see the summary.
* **Module 4: Addition & Subtraction (Endless/Configurable)**
    * *Configurable Variables:* Number of digits (e.g., 1-digit, 2-digit, 3-digit operations), and allow/disallow negative answers.
    * *Logic:* Generates questions on the fly based on the digit configuration.

**Admin Backend Specifications**
Build a secure, simple admin dashboard route (`/admin`) protected by a basic auth layer.
* **Features:**
    * View completion history and scores (to see her progress).
    * Global Configuration: Toggle modules on/off.
    * **Custom Messages Engine:** An interface to add/edit custom encouraging popup messages that appear randomly between questions or at the end of a quiz (e.g., "I'm so proud of you!").

**Execution Plan**
Please start by outlining the folder structure and the data models for the database. Once approved, proceed to build the `quizModules.ts` registry, the design system (Tailwind config + Framer Motion wrapper components), and then tackle the first Multiplication module. Ask for my confirmation after completing each major step.

***

### Why this structure works:
1. **The Registry Pattern:** By explicitly asking the AI to build a `quizModules.ts` registry, you guarantee that adding a "Fractions" or "Division" quiz next month is as simple as adding three lines of code. The UI will automatically populate the new card.
2. **The Encouragement Engine:** Adding the custom messages feature in the admin panel turns this from a standard quiz app into a deeply personal gift. 
3. **Paced Execution:** AI agents work best when they don't try to spit out an entire app in one go. The "Execution Plan" at the end forces the AI to check in with you, keeping the architecture clean and manageable.