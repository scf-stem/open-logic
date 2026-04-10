# Repository Guidelines

## Project Structure & Module Organization
The Flask app lives at the repository root: `app.py` is the entry point, `routes/` holds blueprints, `models/` contains SQLAlchemy models, `services/` contains AI and sandbox integrations, `templates/` stores Jinja pages, and `static/` stores CSS, images, and browser-side JavaScript. Use `data/` and `instance/` for local content and runtime data.

## Build, Test, and Development Commands
Root Flask app:

- `python3 -m venv venv && source venv/bin/activate`
- `pip install -r requirements.txt`: install backend dependencies.
- `python3 app.py`: start the Flask server on `127.0.0.1:8080`.

## Coding Style & Naming Conventions
Use 4-space indentation in Python and keep modules/functions in `snake_case`. Keep Flask route handlers grouped by feature in `routes/`, and match template names to pages, for example `post_detail.html`.

For the Flask frontend on port `8080`, keep page styling in shared design-token CSS plus page-level stylesheets under `static/css/views/`; do not add large inline `<style>` blocks or hard-coded brand colors in templates. Reuse shared shell, button, form, and section patterns from `base.html` and the global CSS, use stable class or `data-*` hooks for JS behaviors, and preserve responsive behavior for both desktop and mobile. The Flask frontend should stay within the graphite-blue plus teal visual system and should not reintroduce purple as the primary accent.

## Testing Guidelines
The root `tests/` directory is currently empty, so new backend behavior should ship with tests added there using `test_*.py` filenames. No coverage gate is enforced yet; contributors should cover changed routes, services, and failure cases.

## Commit & Pull Request Guidelines
History is sparse, but the existing commit uses a short imperative subject. Keep commits focused and concise, for example `runner: handle sandbox timeout`. PRs should include a clear summary, affected areas, manual test steps, linked issues when available, and screenshots for UI changes touching `templates/`.

## Security & Configuration Tips
Keep secrets in `.env`; do not commit API keys. The backend reads `OPENAI_API_KEY`, optional `OPENAI_BASE_URL`, `PORT`, and `FLASK_CONFIG`. Avoid committing generated content from `venv/` or `node_modules/`.
