## Context

The QR app is a separate Netlify site (ifn-qr), deployed by CLI, sharing the main site's Neon database. The main site already has Google admin auth in `netlify/functions/_lib/auth.ts`. `apps/qr` must stay extractable, so it cannot import from the root.

## Decisions

**Copy the main site's auth scheme, not its module.** Same primitives (jose, cookie, Google ID token verified against `VITE_GOOGLE_CLIENT_ID`, allowlist re-checked on every request), copied into `netlify/functions/_lib/auth.ts`. Cookies are per host, so qr.ifn.community has its own sign-in and its own cookie (`ifn_qr_admin_session`). The session JWT carries `aud: ifn-qr-admin`, so a main-site token is rejected here even if the two sites share `ADMIN_SESSION_SECRET`.

**One gate function.** `requireAdmin(event, { write })` checks configuration, the CSRF guard for writes, and the session, returning a ready response on failure. Handlers call it before parsing the body or touching the database.

**Fail closed.** Missing `ADMIN_SESSION_SECRET`, an empty `ADMIN_ALLOWED_EMAILS`, or a missing `VITE_GOOGLE_CLIENT_ID` returns 503 from every admin endpoint, including sign-in.

**CSRF.** SameSite=Strict, plus JSON-only writes (a cross-site form cannot send `application/json`, and a cross-site fetch that does is preflighted and never approved), plus an `Origin` host match when the header is present.

**Edit token kept as an identifier.** It still addresses a link in `/manage/<token>`; admin auth is required in addition. GET on qr-manage is admin-only too, because the response contains scan history (user agents, referrers). There was never a delete path and none is added.

**Allowlist in one shared module.** `src/lib/redirectAllowlist.ts` is imported by the UI (early, readable errors) and by the functions (enforcement). Matching is on the parsed `URL.hostname`, exact or dot-suffix, after rejecting non-https, userinfo and explicit ports. The normalised `URL.href` is what is stored and what goes into `Location`. Eventbrite domains are an explicit list rather than a pattern, so a lookalike TLD owned by someone else cannot slip in.

**Redirect-time enforcement.** Rows written before this change, or directly into the database, are re-checked on every scan. A refused row returns a small 404 page with `default-src 'none'` and does not log a scan.

**nanoid replaced with `crypto.randomInt`.** Same alphabet and length. This keeps the functions' dependencies to packages the root also installs (jose, cookie), so the tests run under the root `npm test` in CI without installing `apps/qr`.

## Risks / Trade-offs

- Until the three env vars are set on ifn-qr, trackable links cannot be created or edited at all (by design). Existing redirects keep working.
- `style-src 'unsafe-inline'` is required by Google Sign-In's injected `<style>`. Scripts stay strict.
- The Eventbrite list may miss a country domain; adding one is a one-line change after checking Eventbrite operates it.
