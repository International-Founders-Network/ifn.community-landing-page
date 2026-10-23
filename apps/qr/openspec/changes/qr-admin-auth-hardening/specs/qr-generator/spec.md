## MODIFIED Requirements

### Requirement: URL content can be made trackable
The system SHALL let a signed-in admin turn a URL QR code into a "dynamic" one, calling `/api/qr-create` to mint a short link whose destination can be edited later without reprinting the code. A visitor who is not signed in SHALL see a Google sign-in prompt instead of the create button, and a destination that fails the redirect allowlist SHALL show the allowlist error without calling the API. Static QR codes for any content type and any URL need no sign-in.

#### Scenario: Enabling dynamic mode
- **WHEN** a signed-in admin enables dynamic mode for an allowlisted URL and confirms
- **THEN** a short link is created and the QR code encodes that short link instead of the raw URL

#### Scenario: Not signed in
- **WHEN** a visitor who is not signed in enables dynamic mode
- **THEN** the sign-in prompt is shown and no short link can be created

#### Scenario: Destination not allowlisted
- **WHEN** the URL is not on the allowlist
- **THEN** a clear error names the allowed sites and suggests a static QR code instead
