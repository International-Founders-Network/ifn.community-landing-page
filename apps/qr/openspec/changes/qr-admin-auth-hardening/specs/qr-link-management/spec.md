## MODIFIED Requirements

### Requirement: Short links redirect to their stored destination
The system SHALL resolve `/r/<code>` by looking up the matching `qr_links` row and redirecting (302) to its `target_url` only when that destination passes the redirect allowlist at request time. An unknown code, or a stored destination that fails the allowlist, SHALL get a not-found page and no redirect. `/r/<code>` requires no sign-in.

#### Scenario: Valid code
- **WHEN** a request hits `/r/<code>` for an existing code whose destination is allowlisted
- **THEN** the response is a 302 redirect to that link's current `target_url`

#### Scenario: Unknown code
- **WHEN** a request hits `/r/<code>` for a code that doesn't exist
- **THEN** a not-found page is shown instead of an error

#### Scenario: Stored destination not allowlisted
- **WHEN** a request hits `/r/<code>` and the stored `target_url` fails the allowlist (for example `https://evil.com` or `http://ifn.community`)
- **THEN** the response is a 404 page, no `Location` header is sent, and no scan is logged

### Requirement: A link's destination and scan history are manageable via its edit token
The system SHALL let a signed-in admin (an email on `ADMIN_ALLOWED_EMAILS`, with a valid session) who has a link's edit token view its destination, total scan count, and 20 most recent scans, and update its destination to a new allowlisted URL. The edit token alone SHALL NOT be sufficient.

#### Scenario: Updating the destination
- **WHEN** a signed-in admin submits a new allowlisted URL for a valid edit token
- **THEN** the link's `target_url` is updated and subsequent redirects use the new destination

#### Scenario: Invalid new destination
- **WHEN** the submitted destination fails the allowlist
- **THEN** the update is rejected with 400 and the stored destination is unchanged

#### Scenario: No session
- **WHEN** a request to view or edit carries a valid edit token but no valid admin session
- **THEN** it is rejected with 401 (403 for a valid session whose email is no longer allowlisted)

## ADDED Requirements

### Requirement: Short-link creation is admin only
The system SHALL create short links only for a signed-in admin, and only for allowlisted destinations.

#### Scenario: Unauthenticated create
- **WHEN** `/api/qr-create` is called without a valid admin session
- **THEN** it responds 401 and writes nothing

#### Scenario: Admin create
- **WHEN** a signed-in admin creates a link to an allowlisted URL
- **THEN** a short link is returned and stored with the normalised URL

### Requirement: Redirect destinations are allowlisted
The system SHALL accept a destination only if it is `https:`, has no username or password, has no explicit port, and its hostname equals or is a subdomain of ifn.community, lu.ma, luma.com, meetup.com, or a listed Eventbrite domain.

#### Scenario: Lookalike and userinfo tricks
- **WHEN** the destination is `https://ifn.community.evil.com`, `https://evilifn.community` or `https://ifn.community@evil.com`
- **THEN** it is refused

### Requirement: Admin endpoints fail closed and resist CSRF
The system SHALL answer 503 from every admin endpoint when `ADMIN_SESSION_SECRET`, `ADMIN_ALLOWED_EMAILS` or `VITE_GOOGLE_CLIENT_ID` is missing, and SHALL refuse writes that are not `application/json` (415) or whose `Origin` is another host (403).

#### Scenario: Secret missing
- **WHEN** `ADMIN_SESSION_SECRET` is unset
- **THEN** create, view, edit and sign-in all respond 503
