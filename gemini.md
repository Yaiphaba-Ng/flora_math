# Project Guidelines & Conventions

* **Linter:** Do not run the linter automatically after completing a task.
* **Documentation:** Create and actively maintain a corresponding `.md` file in the `/docs` directory outlining every development phase or major component. Always update these if architectures or features change over time.
* **Architecture Rules:** Prioritize extreme developer friendliness. For isolated logic like game rules, use the "Plugin/Domain Pattern"—keep all associated logic within a single file (e.g., `services/modules/multiplication.py`) instead of scattering functionality across multiple files.
