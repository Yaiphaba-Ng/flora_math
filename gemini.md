# Project Guidelines & Conventions

> **Before writing any code, read the following reference docs:**
> - **Design rules & mandates:** [`docs/design_rules.md`](docs/design_rules.md) — visual identity, touch targets, animations, component checklist.
> - **DOM element ID map:** [`docs/elementId_ref.md`](docs/elementId_ref.md) — all `id` and `data-testid` selectors in the app; update whenever elements are added or renamed.

---

* **Linter:** Do not run automatically after completing a task.
* **Docs:** Maintain a `.md` per phase/component in `/docs`. Update on any architecture or feature change.
* **Architecture:** Hybrid Standalone Pattern — all quiz logic in one TypeScript file per module (e.g. `src/lib/quiz/modules/multiplication.ts`). Gameplay loop is client-side; metrics sync via `/api/quiz/sync`. See `docs/design_rules.md §7`.
* **Quiz Feedback:** Every module must return `correct_answer` and use the `AnswerFeedback { id, isCorrect, correctAnswer }` counter pattern. See `docs/design_rules.md §5`.
* **Config Ranges:** No arbitrary caps. Free ranges unless a hard technical limit exists. See `docs/design_rules.md §6`.
* **Mobile UI:** All interactive elements ≥ 44×44px touch target, including close/reset buttons. See `docs/design_rules.md §2`.
* **DOM IDs:** Every new element needs `id` (singleton) or `data-testid` (repeated). Update `docs/elementId_ref.md` before closing any task. See `docs/design_rules.md §3`.
* **CLI:** The user is on PowerShell. All CLI commands must be formatted for PowerShell (e.g., use `;` instead of `&&` for chaining).
