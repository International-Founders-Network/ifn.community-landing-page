## Why

The admin dashboard is one of two features (alongside the QR app) that shipped with zero written spec anywhere — merged via a separate branch/PR with no entry in `BACKLOG.md`. It also has real security surface (OAuth, an email allowlist, session cookies), which makes an accurate retroactive spec more valuable here than anywhere else in the backfill: its acceptance criteria are directly testable security properties.

## What Changes

No code changes. Establishes `admin-dashboard` as a tracked capability with its authentication/authorization contract specified precisely from the actual implementation.

## Capabilities

### New Capabilities
- `admin-dashboard`: The hidden `/admin` route — Google OAuth login, server-side email allowlist, JWT session cookie, and the submissions viewer it gates.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Admin.tsx`, `netlify/functions/_lib/auth.ts`, `netlify/functions/{admin-submissions,auth-google,auth-logout,auth-me}.ts`.
