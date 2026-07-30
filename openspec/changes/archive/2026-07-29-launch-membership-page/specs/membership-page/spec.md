# membership-page Specification

## Purpose
The `/membership` route — describes IFN's paid membership tier and links out to Stripe Checkout for signup.

## Requirements
### Requirement: `/membership` describes the current paid tier accurately
The system SHALL render a page describing the paid membership tier's price range and included benefits, matching `ifn-strategy/v2/04-revenue-and-unit-economics.md` (private community access, resource library, monthly office hours; no content or pricing sourced from `v3`/`v4`).

#### Scenario: Visiting `/membership`
- **WHEN** a visitor navigates to `/membership`
- **THEN** a page renders describing the paid tier's benefits and price range, with no v3/v4-tier claims (no investor database, no directory, no Verified Vendor SLA language)

### Requirement: Membership CTA links to live Stripe Checkout
The system SHALL render a CTA linking directly to the configured Stripe Payment Link, opening in a new tab.

#### Scenario: Clicking the membership CTA
- **WHEN** a visitor clicks the "Join" CTA on `/membership`
- **THEN** a new tab opens to the Stripe Payment Link URL
