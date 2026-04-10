# Phase 0 Migration Ledger

## Purpose

This ledger records which current surfaces are active migration scope, which are legacy candidates, and which service/API contracts they depend on.

## Active User Flows

| Flow | Current Pages / JS | Current API Dependencies | Target Owner |
| --- | --- | --- | --- |
| Home + feed entry | `templates/index.html`, `templates/base.html`, `static/js/views/home.js`, `static/js/main.js`, `static/js/i18n.js` | `GET /api/posts` | Vercel frontend + Railway API |
| Login | `templates/login.html`, `static/js/views/auth.js`, `templates/base.html` | `POST /api/auth/login`, `GET /api/auth/me` | Vercel BFF + Railway API |
| Register + captcha | `templates/register.html`, `static/js/views/auth.js` | `GET /api/auth/captcha`, `POST /api/auth/register` | Vercel BFF + Railway API + Redis |
| Logout + navbar auth state | `templates/base.html`, `static/js/main.js` | `POST /api/auth/logout`, `GET /api/auth/me` | Vercel BFF + Railway API |
| Create post | `templates/post_create.html`, `static/js/views/post-create.js` | `POST /api/posts` | Vercel frontend + Railway API |
| Post detail + replies + likes | `templates/post_detail.html`, `static/js/views/post-detail.js` | `GET /api/posts/:id`, `POST /api/posts/:id/comments`, `POST /api/posts/:id/like` | Vercel frontend + Railway API |
| Profile | `templates/profile.html`, `static/js/views/profile.js`, `static/js/api.js` | `GET /api/posts?user_id=...`, `DELETE /api/posts/:id` | Vercel frontend + Railway API |
| Courses | `templates/courses.html`, `static/js/views/courses.js` | `GET /api/courses/graph`, `GET /api/courses/lesson/:track/:id`, `POST /api/run` | Vercel frontend + Railway API + Fly runner |
| Runner modal on home | `templates/components/coderunner_modal.html`, `static/js/views/coderunner.js`, `static/js/input-dialog.js` | `POST /api/run` | Vercel frontend + Fly runner via BFF |
| Locale switch + shared shell | `templates/base.html`, `translations.py`, `app.py`, `static/js/i18n.js` | `GET /set-ui-locale/:locale` today | Vercel frontend owns locale runtime |

## Active Backend Route Surfaces

| Route Group | Source | Notes |
| --- | --- | --- |
| Auth | `routes/auth.py` | Uses Flask `session` and image captcha |
| Posts | `routes/posts.py` | Session-authenticated CRUD and detail data |
| Comments | `routes/comments.py` | Session-authenticated comments; AI mention trigger |
| Courses | `routes/courses_bp.py` | File-backed lesson graph + lesson content |
| Runner | `routes/runner_bp.py` | Current code execution gateway |

## Shared Runtime Seams

| Seam | Current Behavior | Migration Impact |
| --- | --- | --- |
| Auth state | `localStorage.osi_user` plus Flask session | Must be replaced with BFF-driven `/me` hydration |
| Captcha | Browser loads image directly from Flask auth route | Must be proxied or reissued through BFF |
| Locale | Flask injects `APP_UI_LOCALE` and `APP_TRANSLATIONS` into every page | Must move to frontend-owned translation/runtime state |
| Same-origin fetch | Frontend JS assumes `/api/*` on same origin | Must move to Vercel BFF/API client contract |
| AI async replies | Flask spawns background threads in both post creation and comment mention flows | Must move to Redis-backed worker model |
| Runner execution | Flask process launches subprocesses directly | Must move to isolated Fly service |

## Active Template Surfaces In Scope

- `templates/base.html`
- `templates/index.html`
- `templates/login.html`
- `templates/register.html`
- `templates/post_create.html`
- `templates/post_detail.html`
- `templates/profile.html`
- `templates/courses.html`
- `templates/about.html`
- `templates/guidelines.html`
- `templates/components/coderunner_modal.html`

## Active JS Surfaces In Scope

- `static/js/main.js`
- `static/js/i18n.js`
- `static/js/api.js`
- `static/js/input-dialog.js`
- `static/js/views/auth.js`
- `static/js/views/home.js`
- `static/js/views/post-create.js`
- `static/js/views/post-detail.js`
- `static/js/views/profile.js`
- `static/js/views/coderunner.js`
- `static/js/views/courses.js`

## Legacy / Triage Candidates

These surfaces need explicit keep-or-defer decisions before execution widens scope:

- `templates/landing.html`
- `templates/playground.html`
- `templates/lessons.html`
- `templates/exercises.html`
- `templates/lesson_detail.html`
- `templates/exercise_detail.html`
- `static/js/forum_script.js`
- `static/js/editor.js`
- `static/js/exercise.js`
- `templates/creative_agent.html`
- `templates/creative_gallery.html`
- `templates/agents.html`
- `templates/agent_detail.html`
- `templates/plans.html`
- `templates/plan_viewer.html`
- `templates/handbook_*`

## Keep / Split / Adapt Summary

| Area | Decision | Why |
| --- | --- | --- |
| UI copy and design tokens | Keep + port | Needed for visual/script parity |
| Jinja page composition | Adapt | Vercel target is Next.js |
| Auth API | Split + adapt | Flask logic kept, browser contract changes |
| Community data APIs | Split | Still backend-owned |
| Courses content API | Split | Backend remains file-backed initially |
| AI integration | Keep + adapt | Backend-owned with queue-based async |
| Runner contract | Keep + relocate | Preserve payload shape, move runtime |
| Sandbox implementation | Split + harden | Unsafe for Vercel / Flask API plane |
| Same-origin browser fetches | Adapt | Must move behind Vercel BFF |

## Weak-Evidence Script Claims

These are tracked separately and do not block infrastructure migration:

- `Trae` development assistance
- `20 classmates` user testing
- explicit “middle school teacher” prompt proof
- `glass design` label
- “user asks and platform answers right away” wording precision
