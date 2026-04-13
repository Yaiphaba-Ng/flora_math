# Floramath — Design Rules & Mandates

> **This document is the single source of truth for all UI/UX rules.**
> Every new component, page, or feature MUST be reviewed against these rules before shipping.
> When a rule changes, update this file first, then `gemini.md`.

---

## 1. Visual Identity

| Token | Value | Usage |
|---|---|---|
| `brand-primary` | `#FFB6C1` | Buttons, active states, highlights |
| `brand-accent` | `#E8829A` | Hover states, deeper rose accents |
| `brand-light` | `#FFE4E1` | Card backgrounds, chip borders, tints |
| `background` | `#FAF9F6` | Page background |
| `surface` | `#FFFFFF` | Card surfaces |
| `text-main` | `#2D2D2D` | All body/paragraph text |
| `text-muted` | `#6B6B6B` | Secondary labels, hints, captions |
| `text-strong` | `#1A1A1A` | Headings, scores, high-contrast text |

**Rules:**
- Never use generic defaults (plain red, blue, green). Always use the palette above.
- Never make text lighter than `text-muted` (`#6B6B6B`) for readable content.
- Pastel pinks are the identity — do not swap for cool/neutral palettes.

---

## 2. Mobile-First Touch Targets

> **No small or cramped controls anywhere in the app. No exceptions.**

| Element type | Minimum size | Implementation |
|---|---|---|
| Buttons & icon buttons | `44×44px` | `w-11 h-11` or `p-3` |
| Close (`✕`) & reset (`↺`) utility buttons | `44×44px` | `w-11 h-11 flex items-center justify-center` |
| Chip / pill quick-selects | `36px height` | `h-9 px-3.5` |
| Toggle rows | Full-row tap target | Wrap entire row in `<button>` |
| Text inputs | No auto-zoom | `py-3 text-base` minimum |
| Primary CTAs (Start Quiz, Submit, Play) | Full-width, tall | `w-full py-4` |

---

## 3. DOM Element Identification

> **See [`docs/elementId_ref.md`](./elementId_ref.md) for the full live reference table.**

**Rules:**
- Use **`id`** for unique singleton elements per page (one per route).
- Use **`data-testid`** for repeated/dynamic elements (module cards, stepper fields, chips).
- Every new interactive or structural element MUST receive an `id` or `data-testid` before merging.
- Naming convention: `scope-component-role` e.g. `quiz-submit-btn`, `config-stepper-input-range_start`.
- Keep `elementId_ref.md` updated whenever elements are added or renamed.

---

## 4. Animation & Micro-interactions

- Use **Framer Motion** for all animations — no raw CSS transitions on interactive elements.
- Every button must have `whileTap={{ scale: 0.9 }}` or equivalent press feedback.
- Icon buttons with a semantic action get a `whileHover` (e.g. gear rotates 60°, reset rotates -40°).
- Page/card entry: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`.
- Use `AnimatePresence` for any conditionally rendered element (feedback, modals, sheets).
- Spring physics preferred: `type: "spring", stiffness: 300, damping: 25`.

---

## 5. Quiz Feedback Standards

> **These rules apply to every current and future quiz module. Non-negotiable.**

1. The module's `evaluateAnswer()` method MUST handle the logic, and the module architecture MUST ensure the correct answer is known.
   - The UI evaluates answers synchronously.
   - The real answer string MUST be available when the answer is wrong to show on the UI.
2. The UI MUST display the correct answer prominently on wrong submissions.
3. Feedback state MUST use the `AnswerFeedback { id, isCorrect, correctAnswer }` counter pattern — **never a raw boolean** — so consecutive identical results always re-trigger animations.

---

## 6. Configuration Range Philosophy

- Do **NOT** impose tight arbitrary caps on quiz config fields.
- Trust the user — keep ranges as free as reasonably practical.
- Only hard-cap a value if it would cause a **genuine technical problem** (e.g. server memory, UI overflow).
- When a cap is enforced, document the reason in the schema `hint` field.
- Quick-select chips are populated from **real usage history** fetched from the backend — never hardcoded presets in the schema.

---

## 7. Module / Plugin Architecture

- All quiz logic lives in a single self-contained class: `src/lib/quiz/modules/<slug>.ts` which extends `BaseQuizModule`.
- All config schema is exported natively from the class itself via `getConfigSchema()`.
- Adding a new quiz type = creating the `.ts` module and adding exactly one line to `src/lib/quiz/registry.ts`.
- The gameplay loop evaluates directly in the browser; metrics are sent securely via `/api/quiz/sync`.

---

## 8. Typography

- Font: **Nunito** (loaded via `next/font`).
- Headings: `font-extrabold`.
- Body: `font-semibold` or default.
- Labels/captions: `text-xs font-bold uppercase tracking-wide text-text-muted`.
- Numbers/scores: `font-extrabold tabular-nums text-brand-primary`.

---

## 9. Component Checklist

Before shipping any new component, verify:

- [ ] All buttons ≥ 44×44px (including utility close/reset buttons)
- [ ] All chips ≥ 36px height
- [ ] Framer Motion `whileTap` on every button
- [ ] `id` or `data-testid` on every interactive/structural element
- [ ] `elementId_ref.md` updated with new selectors
- [ ] Color tokens used (no hardcoded hex values in JSX)
- [ ] Text meets contrast minimums (`text-muted` or darker)
- [ ] Mobile-tested layout (no horizontal overflow)
