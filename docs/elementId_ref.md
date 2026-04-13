# Strategy:
- **`id`** for unique singleton elements per page (inputs, primary CTAs, key sections) — directly queryable via `document.getElementById`.
- **`data-testid`** for repeated/dynamic elements (module cards, stepper fields, chips keyed by slug/field) — the industry standard for testing tools (Playwright, Cypress, React Testing Library).


## Full reference map of every ID/testid:

**Homepage** (`id` — singletons)
| Selector | Element |
|---|---|
| `#home-page` | Root `<main>` |
| `#progress-link-btn` | "View My Progress" CTA |

**Homepage** (`data-testid` — repeated per module)
| Selector | Element |
|---|---|
| `[data-testid="module-card-multiplication"]` | Module card |
| `[data-testid="module-config-btn-multiplication"]` | ⚙ gear button |
| `[data-testid="module-play-btn-multiplication"]` | Play button |

**Quiz page** (`id`)
| Selector | Element |
|---|---|
| `#quiz-page` + `data-quiz-slug` | Root with current slug |
| `#quiz-back-btn` | ← back arrow |
| `#quiz-progress-bar` / `#quiz-progress-bar-track` | Progress fill / track |
| `#quiz-progress-counter` | "3 / 10" counter |
| `#quiz-score-pill` | Score badge |
| `#quiz-question-text` | The question heading |
| `#quiz-answer-form` / `#quiz-answer-input` | Form + number input |
| `#quiz-submit-btn` | Submit button |
| `#quiz-feedback-msg` + `data-correct` | Feedback flash |
| `#quiz-results-screen` / `#quiz-score-display` | Results screen + score |
| `#quiz-home-btn` / `#quiz-replay-btn` | End screen actions |

**Config sheet** (`id` + `data-testid`)
| Selector | Element |
|---|---|
| `#config-sheet` | Sheet container |
| `#config-sheet-title` | Module name heading |
| `#config-close-btn` | ✕ close button |
| `#config-sheet-preview` | Live sentence preview |
| `[data-testid="config-stepper-range_start"]` | Stepper block |
| `[data-testid="config-stepper-up-range_start"]` | ▲ button |
| `[data-testid="config-stepper-down-range_start"]` | ▽ button |
| `[data-testid="config-stepper-input-range_start"]` | Number input |
| `[data-testid="config-slider-num_questions"]` | Slider block |
| `[data-testid="config-slider-input-num_questions"]` | Slider number input |
| `[data-testid="config-slider-range-num_questions"]` | Slider range track |
| `#config-start-btn` | "Start Quiz" CTA |
