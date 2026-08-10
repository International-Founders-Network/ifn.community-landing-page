# membership-page Specification

## Purpose
The `/membership` route. Describes IFN's paid membership and routes signup through the contact form until a payment gateway exists.

> **Factual correction, 2026-08-10.** This file previously specified that the
> membership CTA links directly to a Stripe Payment Link opening in a new tab,
> and that the page describes a "price range". Neither has been true in the
> shipped code: `STRIPE_PAYMENT_LINK` is defined in `src/data/membershipData.ts`
> and is imported by nothing, the CTA is an internal link to `/contact`, and the
> page publishes exactly one price. The requirements below are corrected to what
> ships. This is a correction of a wrong contract, **not** a design decision: a
> real payment gateway is recorded in `BACKLOG.md` as next-iteration work and
> needs a proper `/opsx:propose` delta against this spec before it is built.

## Requirements
### Requirement: `/membership` describes the current paid membership accurately
The system SHALL render a page describing the paid membership's benefits and its single published annual price, matching `ifn-strategy/v2/04-revenue-and-unit-economics.md` (private community access, resource library, monthly office hours; no content or pricing sourced from `v3`/`v4`).

The system SHALL publish exactly one price. A second, lower annual price exists as a warm-lead price sent by email to a selected list. It SHALL NOT be rendered on any public surface, SHALL NOT be defined as an exported constant, and SHALL NOT be modelled as a tier. The tier array that previously implied a two-price public offer was deleted along with the value, because the shape is what invites the value back.

#### Scenario: Visiting `/membership`
- **WHEN** a visitor navigates to `/membership`
- **THEN** a page renders describing the membership's benefits and exactly one price, with no v3/v4-tier claims (no investor database, no directory, no Verified Vendor SLA language)

#### Scenario: Searching the built output for the non-public price
- **WHEN** the built `dist/` output is searched for the warm-lead price figure
- **THEN** it does not appear

### Requirement: The membership CTA routes to the contact form
The system SHALL render a CTA that navigates to `/contact` as a real in-app link, and SHALL NOT present a checkout that does not exist.

The reply is sent by a person. The page SHALL NOT promise a response time, a confirmation email, or an automated link, because none of those is implemented.

#### Scenario: Clicking the membership CTA
- **WHEN** a visitor clicks the membership CTA on `/membership`
- **THEN** the app navigates to `/contact` in the same tab, with no new tab and no external redirect
