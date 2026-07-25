## Context

`/admin` is registered outside the main `Layout` — no nav link, no footer, reachable only by direct URL, with the SPA fallback redirect in `netlify.toml` ensuring direct navigation resolves instead of 404ing. `Admin.tsx` checks `GET /api/auth-me` for an existing session and shows a Google Identity Services login button otherwise. `auth-google.ts` verifies the Google ID token via `jose.jwtVerify` against Google's JWKS (audience = `VITE_GOOGLE_CLIENT_ID`, `email_verified` must be true), checks the email against the comma-separated `ADMIN_ALLOWED_EMAILS` allowlist, and if allowed issues an HS256 JWT session (`{email}`, signed with `ADMIN_SESSION_SECRET`) as an httpOnly, `sameSite=strict` cookie (`ifn_admin_session`, 7-day maxAge). Every subsequent request re-verifies both the JWT signature and the current allowlist — not just at login.

## Goals / Non-Goals

**Goals:**
- Specify the authentication/authorization contract precisely, since it's security-relevant and previously undocumented.

**Non-Goals:**
- Not adding pagination or rate-limiting to `admin-submissions` in this change — noted as a risk below, not fixed here.

## Decisions

- **Session validity is re-checked against the live allowlist on every request, not cached from login time.** This is a deliberate, valuable property (removing an email immediately revokes any live session using it) and is called out explicitly as a requirement so it can't silently regress into login-time-only checking.

## Risks / Trade-offs

- `admin-submissions.ts` returns all rows of all three tables, unfiltered and unpaginated. Fine at current data volume; will need pagination/limits as the tables grow.
- Client-side logout clears local state, and a 401 from `admin-submissions` also just resets local state — neither automatically calls the server-side logout endpoint. Minor UX inconsistency, not a security gap (the session cookie itself is what's authoritative).
