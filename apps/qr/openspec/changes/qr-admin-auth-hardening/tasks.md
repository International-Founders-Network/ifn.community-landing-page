## 1. Server

- [x] 1.1 Move `_db.ts` to `netlify/functions/_lib/db.ts`; confirm `netlify functions:build` produces no `_db` or `_lib` function
- [x] 1.2 Add `_lib/auth.ts` (Google ID token, allowlist, audience-bound session cookie, fail-closed `requireAdmin`) and `_lib/http.ts` (JSON responses, CSRF guard)
- [x] 1.3 Add `auth-google`, `auth-me`, `auth-logout`
- [x] 1.4 Gate `qr-create` and every method of `qr-manage` behind `requireAdmin`
- [x] 1.5 Add `src/lib/redirectAllowlist.ts`; enforce it in `qr-create`, `qr-manage` PUT and `qr-redirect`

## 2. UI

- [x] 2.1 `AuthProvider` + `SignInPanel` (Google Sign-In); sign-out in the header
- [x] 2.2 Generator and Bulk: trackable mode shows sign-in when signed out and allowlist errors before submitting
- [x] 2.3 Manage: sign in before loading; allowlist error on save

## 3. Headers

- [x] 3.1 `public/_headers`: enforcing CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- [x] 3.2 Verify zero CSP violations in headless Chrome on /, generator downloads, bulk ZIP, manage, sign-in

## 4. Tests and rollout

- [x] 4.1 Tests in `netlify/tests/` (run by the root vitest config)
- [ ] 4.2 Set `ADMIN_ALLOWED_EMAILS`, `ADMIN_SESSION_SECRET`, `VITE_GOOGLE_CLIENT_ID` on the ifn-qr Netlify site
- [ ] 4.3 Add `https://qr.ifn.community` as an Authorized JavaScript origin on the Google OAuth client
- [ ] 4.4 CLI deploy of ifn-qr after merge, then smoke test sign-in, create, redirect
- [ ] 4.5 Archive this change
