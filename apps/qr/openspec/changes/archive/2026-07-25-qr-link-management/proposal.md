## Why

Trackable ("dynamic") QR codes only work because the redirect and management functions behind them are correct — scan logging, destination editing via a secret token, and the redirect itself. This is the last piece of the QR app's original undocumented surface; capturing it completes the retroactive backfill.

## What Changes

No code changes. Establishes `qr-link-management` as a tracked capability covering the redirect, scan logging, and token-gated destination editing.

## Capabilities

### New Capabilities
- `qr-link-management`: Resolving short links, logging scans, and letting the creator edit a link's destination and view scan history via a secret edit token.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Manage.tsx`, `netlify/functions/{qr-redirect,qr-manage,_db}.ts`.
