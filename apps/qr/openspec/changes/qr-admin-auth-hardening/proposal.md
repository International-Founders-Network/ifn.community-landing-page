## Why

Anyone on the internet could create a trackable short link on qr.ifn.community, pointing at any http(s) URL, with no sign-in and no rate limit. That made `qr.ifn.community/r/<code>` an open redirect on an IFN domain: a ready-made phishing link that inherits IFN's reputation. The edit token was the only control on editing, and `_db.ts` shipped as a public function because it sat in the functions root. The app also sent no security headers.

## What Changes

- **BREAKING**: creating, viewing and editing short links requires an admin session (Google Sign-In, `ADMIN_ALLOWED_EMAILS` allowlist, `ADMIN_SESSION_SECRET`-signed httpOnly SameSite=Strict cookie), the same scheme as the main site's admin, with its own sign-in on this host. The edit token still identifies a link in `/manage/<token>` URLs but is no longer sufficient on its own.
- Admin endpoints fail closed (503) when any of the three auth env vars is missing.
- Writes require `Content-Type: application/json` and a same-host `Origin` when one is sent (CSRF).
- Short-link destinations must be on one allowlist (`src/lib/redirectAllowlist.ts`): https only, no credentials, no explicit port, host equal to or a subdomain of ifn.community, lu.ma, luma.com, meetup.com, or a listed Eventbrite country domain. Enforced at create, at edit, and again at redirect time, where a non-allowlisted stored target gets a 404 page instead of a 302.
- `_db.ts` moves to `netlify/functions/_lib/db.ts` so Netlify no longer deploys it as a function.
- `public/_headers` adds an enforcing CSP plus HSTS, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy; function HTML/JSON responses set their own.
- Static QR codes (any content type, any URL) are unchanged and need no sign-in.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `qr-link-management`: admin-only management, allowlisted destinations, redirect-time enforcement.
- `qr-generator`: trackable mode requires sign-in and an allowlisted destination.
- `qr-bulk-generation`: trackable mode requires sign-in; non-allowlisted lines fail individually.

## Impact

`netlify/functions/{qr-create,qr-manage,qr-redirect,auth-google,auth-me,auth-logout}.ts`, `netlify/functions/_lib/{auth,db,http}.ts`, `src/lib/{redirectAllowlist,api,authContext}.ts`, `src/components/{AuthProvider,SignInPanel}.tsx`, `src/pages/{Generator,Bulk,Manage}.tsx`, `src/App.tsx`, `public/_headers`, `package.json` (adds jose and cookie, drops nanoid). New env vars on the ifn-qr Netlify site: `ADMIN_ALLOWED_EMAILS`, `ADMIN_SESSION_SECRET`, `VITE_GOOGLE_CLIENT_ID`. `https://qr.ifn.community` must be an Authorized JavaScript origin on the Google OAuth client.
