# legal-static-pages Specification

## Purpose
Stable, fully-static informational and legal pages: About, Privacy Policy, Terms and Conditions, Code of Conduct.

## Requirements
### Requirement: Static informational pages render at stable routes
The system SHALL render `/about`, `/privacy-policy`, `/terms-and-conditions`, and `/code-of-conduct` as static content with no data fetching or loading state.

#### Scenario: Visiting a static page
- **WHEN** a visitor navigates to any of these routes
- **THEN** the page renders its fixed content immediately, with no async loading state

### Requirement: Code of Conduct surfaces a reporting channel
The system SHALL provide a `mailto:` link to `conduct@ifn.community` on the Code of Conduct page for reporting violations.

#### Scenario: Reporting a violation
- **WHEN** a visitor clicks the reporting link on the Code of Conduct page
- **THEN** their email client opens a message addressed to `conduct@ifn.community`

