# Phase 2: The Plugin Logic Framework

## Goals
1. Establish the Backend Plugin Architecture by defining a pure `BaseQuizModule`.
2. Implement the `registry.py` to auto-discover and load quiz modules.
3. Build the first concrete module: `multiplication.py`.
4. Establish FastAPI routes (`quiz.py` and `metrics.py`) to connect the logic to HTTP responses and trigger SQLAlchemy/SQLModel operations.

## Architecture Guidelines
- **Zero-Coupling:** Each game module (`multiplication`, `fractions`, etc.) must be 100% self-contained in its execution layer. This allows the user to drop a new `.py` file into the `modules` directory to instantly create a new quiz type.
- **Metric Forwarding:** The game loop must output the exact `question_string` and boolean success into the SQLite framework.
