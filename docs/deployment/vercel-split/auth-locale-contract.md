# Auth, Captcha, and Locale Contract

## Auth Contract

### Cookie ownership

- Browser-visible session cookies are owned by the Vercel domain.
- Railway and Fly do not set browser-facing cookies directly.
- Vercel BFF reads/writes the canonical browser session cookie and maps it to backend session state.

### `/me` hydration

- Initial page render on Vercel resolves auth state server-side via BFF.
- Client bootstraps from server-provided auth state rather than `localStorage`.
- `localStorage.osi_user` is removed during frontend extraction.

### Login

1. Browser submits credentials to Vercel route.
2. Vercel route forwards to Railway auth endpoint.
3. Vercel writes/updates the browser-visible session cookie.
4. Frontend hydrates from `/me` rather than writing local user objects to storage.

### Logout

1. Browser submits logout to Vercel route.
2. Vercel clears browser cookie and invalidates backend session state.
3. UI rehydrates from anonymous `/me`.

## Captcha Contract

- Browser requests captcha from Vercel BFF, not Railway directly.
- Captcha challenge state is bound to Redis-backed session state.
- Register flow validates through the BFF contract so captcha and auth state remain same-origin from the browser perspective.

## CSRF / CORS Contract

- Browser does not perform direct cross-origin authenticated writes to Railway or Fly in v1.
- Vercel BFF is the main browser-facing write boundary.
- CSRF protection is enforced at the BFF boundary.
- Internal Vercel -> Railway / Fly traffic uses server-to-server auth, not browser CORS.

## Locale Contract

- Frontend becomes the runtime owner of locale choice.
- Translation payloads are generated from current `translations.py`.
- Backend no longer injects localized HTML pages in production.
- Locale switch updates frontend state and persists user preference through the BFF/user profile as needed.

## AI Async Ownership

- Railway API owns orchestration for AI reply triggers.
- v1 uses Redis-backed queue + worker path.
- In-process Flask background threads are not used for production split deployment.
