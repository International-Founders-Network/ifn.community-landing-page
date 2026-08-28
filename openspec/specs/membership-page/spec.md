# membership-page Specification

## Purpose
The `/membership` route. Describes IFN's paid membership and sells it through
Stripe subscription checkout.

> **History, kept because both notes explain why the requirements read as they
> do.**
>
> *2026-08-10, factual correction.* This file once specified a CTA linking to a
> Stripe Payment Link in a new tab, and a page describing a "price range".
> Neither was ever true of the shipped code: `STRIPE_PAYMENT_LINK` was imported
> by nothing, the CTA was an internal link to `/contact`, and the page published
> exactly one price. The requirements were corrected to what shipped — a
> correction of a wrong contract, not a design decision.
>
> *2026-08-28, gateway shipped.* `add-membership-subscription-billing` replaced
> that CTA with real subscription checkout, and its delta was archived into this
> file through the proper cycle. `/contact` and `netlify/functions/contact.ts`
> are untouched and remain the fallback whenever checkout fails, so the
> hand-sold flow was never dismantled — only the CTA's default destination
> changed. The billing side lives in the `membership-billing` capability.

## Requirements

### Requirement: `/membership` describes the current paid membership accurately
The system SHALL render a page describing the paid membership's benefits and its
single published annual price, matching `ifn-strategy/v2/04-revenue-and-unit-economics.md`
(private community access, resource library, monthly office hours; no content or
pricing sourced from `v3`/`v4`).

The page SHALL state that membership renews annually until cancelled. It SHALL
NOT state that the price is charged once, because billing is a subscription and
that sentence would be false. The renewal SHALL be disclosed on this page rather
than only on Stripe's, so the reader agrees to a recurring charge before they
reach checkout.

The system SHALL publish exactly one price. A second, lower annual price exists
as a warm-lead price sent by email to a selected list. It SHALL NOT be rendered
on any public surface, SHALL NOT be defined as an exported constant, SHALL NOT
be modelled as a tier, and SHALL NOT be purchasable through the site's checkout.

#### Scenario: Visiting `/membership`
- **WHEN** a visitor navigates to `/membership`
- **THEN** a page renders describing the membership's benefits and exactly one price, stating annual renewal, with no v3/v4-tier claims

#### Scenario: Searching the built output for the non-public price
- **WHEN** the built `dist/` output is searched for the warm-lead price figure
- **THEN** it does not appear

### Requirement: The membership CTA opens Stripe Checkout
The system SHALL render a CTA that starts a Stripe Checkout Session for the
single published annual price.

The CTA SHALL POST a plan **slug** to `/api/checkout` and redirect the browser to
the returned Stripe-hosted URL. It SHALL NOT send a price, amount, interval or
Stripe price id, and SHALL NOT embed a Stripe key, price id or payment link in
client code.

The CTA SHALL be a button rather than a link, because it performs an action and
returns a single-use session URL that is meaningless if copied or shared.

If the session cannot be created, the page SHALL show a plain-language error and
SHALL keep `/contact` reachable. It SHALL NOT leave the reader on a dead button.

#### Scenario: Clicking the membership CTA
- **WHEN** a visitor clicks the membership CTA on `/membership`
- **THEN** the browser is redirected to a Stripe-hosted checkout page for the annual membership price

#### Scenario: Checkout session cannot be created
- **WHEN** `/api/checkout` returns a non-200 response or no URL
- **THEN** the page shows an error message and the visitor can still reach `/contact`

#### Scenario: Searching the client bundle for Stripe identifiers
- **WHEN** the built `dist/` output is searched for a Stripe secret key, price id, or payment link
- **THEN** none of them appears

### Requirement: `/membership` reports the outcome of a completed checkout
The system SHALL recognise the `checkout` query parameter that Stripe returns to
and render a confirmation for `success` and a reassurance for `cancelled`.

The success state SHALL confirm the **payment** and say what happens next. It
SHALL NOT assert that the visitor's membership record exists, because that record
is written by an out-of-band webhook that may not have arrived, and this page
cannot check it.

The cancelled state SHALL state that nothing was charged.

#### Scenario: Returning from a completed checkout
- **WHEN** a visitor arrives at `/membership?checkout=success`
- **THEN** the page confirms the payment was received and says a person will follow up, without claiming the membership record exists

#### Scenario: Returning from an abandoned checkout
- **WHEN** a visitor arrives at `/membership?checkout=cancelled`
- **THEN** the page states that nothing was charged and offers both retry and `/contact`
