# admin-dashboard Specification

## Purpose
The hidden `/admin` dashboard. Google OAuth restricted to a server-side email allowlist, gating a live view of contact/join/event-signup submissions and a static internal product-roadmap reference.

## Requirements
### Requirement: Admin dashboard is not publicly linked
The system SHALL expose `/admin` with no navigation entry, reachable only by direct URL, resolved correctly via SPA fallback rather than 404ing.

#### Scenario: Direct navigation
- **WHEN** a browser navigates directly to `/admin`
- **THEN** the SPA fallback redirect serves the app instead of returning a 404

### Requirement: Admin access requires an allowlisted Google account
The system SHALL verify the Google ID token (valid signature, `email_verified: true`) and check the resulting email against `ADMIN_ALLOWED_EMAILS` before issuing a session.

#### Scenario: Non-allowlisted email
- **WHEN** a verified Google identity's email is not present in `ADMIN_ALLOWED_EMAILS`
- **THEN** authentication is rejected and no session cookie is issued

### Requirement: Admin sessions are continuously authorized
The system SHALL re-verify the session JWT's signature and re-check the current allowlist on every authenticated request, not only at login.

#### Scenario: Allowlist edit revokes a live session
- **WHEN** an email is removed from `ADMIN_ALLOWED_EMAILS` while that user holds a valid session cookie
- **THEN** the next request using that session is rejected

### Requirement: Admin dashboard exposes form submission data to authenticated admins only
The system SHALL return `join_applications`, `contact_messages`, and `event_signups` rows, newest first, only to requests carrying a valid admin session.

#### Scenario: Unauthenticated request
- **WHEN** a request to `/api/admin-submissions` has no valid session cookie
- **THEN** it is rejected and no submission data is returned

### Requirement: Admin dashboard includes a static product-roadmap reference tab
The system SHALL render a "Roadmap" tab, alongside Contact/Join/Events, showing the free / V2-paid / V3-Pro membership tier breakdown as static content with no external data fetch and no independent auth check (it inherits the dashboard's existing session gate).

#### Scenario: Viewing the Roadmap tab
- **WHEN** an authenticated admin selects the "Roadmap" tab
- **THEN** the tier breakdown table renders immediately from local static data, with no network request issued
