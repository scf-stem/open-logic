# Service Topology

## Locked v1 Topology

| Role | Platform | Responsibility |
| --- | --- | --- |
| Public frontend + BFF | Vercel | Next.js App Router, SSR pages, auth/session proxy, API proxy, locale runtime, product entrypoint |
| Business API | Railway | Flask API for auth, posts, comments, courses, AI orchestration |
| Runner service | Fly.io | Python/C execution with isolation, timeouts, resource controls |
| Database | Neon Postgres | Primary relational persistence |
| Shared runtime support | Redis | Session/captcha state, rate limits, async jobs/coordination |

## Public URL Topology

- `openlogic.example.com` -> Vercel frontend
- `api.openlogic.example.com` -> Railway Flask API, private-to-BFF where practical
- `runner.openlogic.example.com` -> Fly.io runner, not called directly by browsers in v1

## Traffic Model

1. Browser requests always enter through Vercel.
2. Vercel BFF handles auth-sensitive writes and auth/session reads.
3. Vercel BFF proxies to Railway for auth, posts, comments, courses, AI-triggering endpoints.
4. Vercel or Railway calls the Fly runner over service-authenticated channels.
5. Railway persists to Neon and uses Redis for shared state / async coordination.

## Why BFF-First

- Current browser code assumes same-origin `/api/*`
- Current auth uses Flask session + captcha
- Current navbar and profile state rely on local browser state instead of authoritative `/me`
- Keeping the browser on one origin lowers CORS and cookie fragility during migration

## Non-v1 Alternatives Rejected

- Direct browser -> Railway/Fly calls
  - Rejected because auth, captcha, cookies, and CSRF become much harder immediately
- Thin Vercel marketing shell
  - Rejected because user wants the real product on the Vercel entrypoint
- Big-bang rewrite
  - Rejected because parity risk is too high
