# Environment and Service Matrix

## Vercel Discovery

- Team: `juliantien's projects`
- Team ID: `team_Wje7THDSFMfg6qy9xIAM0wTY`
- Existing Vercel projects discovered in this team:
  - `nyxguard`
  - `second-bloom-backend`
- No existing Open Logic Vercel project was found during execution kickoff.

## Required Services

| Service | Platform | Required | Reason |
| --- | --- | --- | --- |
| Frontend/BFF | Vercel | Yes | Public entrypoint and auth/session proxy |
| Flask API | Railway | Yes | Existing business logic extracts cleanly here |
| Runner | Fly.io | Yes | Needs Linux process execution/isolation |
| Postgres | Neon | Yes | Production relational DB |
| Redis | Managed Redis | Yes | Session, captcha, rate limit, queue |
| Object storage | S3/R2/etc. | Optional | Only if runner/output persistence grows |
| Error monitoring | Sentry/etc. | Recommended | Production visibility |
| Logs/metrics | Platform or third-party | Recommended | Multi-service observability |

## Environment Variables by Service

### Vercel

- `APP_PUBLIC_URL`
- `API_BASE_URL`
- `RUNNER_BASE_URL`
- `SESSION_SECRET`
- `CSRF_SECRET`
- `REDIS_URL`
- `INTERNAL_API_TOKEN`
- `INTERNAL_RUNNER_TOKEN`

### Railway Flask API

- `DATABASE_URL`
- `REDIS_URL`
- `BACKEND_SESSION_SIGNING_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `INTERNAL_RUNNER_URL`
- `INTERNAL_RUNNER_TOKEN`
- `APP_ENV`
- `INTERNAL_BFF_SHARED_SECRET`

### Fly Runner

- `RUNNER_AUTH_TOKEN`
- `MAX_CPU_TIME_SECONDS`
- `MAX_WALL_TIME_SECONDS`
- `MAX_MEMORY_KB`
- optional compiler/runtime tuning env

### Shared / Platform

- domain + DNS config
- TLS cert handling
- observability keys

## Immediate Execution Targets

### Phase 0 deliverables

- migration ledger
- keep/split/adapt map
- weak-evidence script-claims list
- active/stale surface inventory

### Phase 1 deliverables

- service topology doc
- auth/captcha/locale contract
- environment matrix
- Vercel project bootstrap decision

## Deferred Until Code Migration

- actual Vercel frontend app scaffold
- actual Railway service deploy
- actual Fly runner deploy
- Neon schema + migrations
- Redis-backed queue worker implementation
