# qr-link-management Specification

## Purpose
Short-link resolution, scan logging, and token-gated destination editing behind every trackable QR code.

## Requirements
### Requirement: Short links redirect to their stored destination
The system SHALL resolve `/r/<code>` by looking up the matching `qr_links` row and redirecting (302) to its `target_url`, or showing a not-found page if the code is unknown.

#### Scenario: Valid code
- **WHEN** a request hits `/r/<code>` for an existing code
- **THEN** the response is a 302 redirect to that link's current `target_url`

#### Scenario: Unknown code
- **WHEN** a request hits `/r/<code>` for a code that doesn't exist
- **THEN** a not-found page is shown instead of an error

### Requirement: Scans are logged without blocking the redirect
The system SHALL record each successful resolution (user agent, referrer) to `qr_scans`, and SHALL still redirect even if the logging write fails.

#### Scenario: Scan logging fails
- **WHEN** the `qr_scans` insert fails for any reason
- **THEN** the redirect still completes successfully

### Requirement: A link's destination and scan history are manageable via its edit token
The system SHALL let anyone possessing a link's edit token view its destination, total scan count, and 20 most recent scans, and update its destination to a new valid HTTP(S) URL — with no additional login required.

#### Scenario: Updating the destination
- **WHEN** the holder of a valid edit token submits a new valid HTTP(S) URL
- **THEN** the link's `target_url` is updated and subsequent redirects use the new destination

#### Scenario: Invalid new destination
- **WHEN** the submitted destination is not a valid HTTP(S) URL
- **THEN** the update is rejected and the stored destination is unchanged

