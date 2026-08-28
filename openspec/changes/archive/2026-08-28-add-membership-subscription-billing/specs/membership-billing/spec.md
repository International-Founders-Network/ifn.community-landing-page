## ADDED Requirements

### Requirement: Checkout sessions are created server-side from a plan allowlist
The system SHALL expose `POST /api/checkout`, which accepts a plan **slug**,
resolves it through a server-side allowlist to a Stripe **lookup key**, resolves
that to an active price at request time, creates a Checkout Session in
`mode: 'subscription'`, and returns its hosted URL.

The endpoint SHALL reject non-POST requests with 405. It SHALL NOT accept a
price, price id, amount, or interval supplied by the client, because a
client-supplied price lets a reader choose what to pay. A slug that is not on
the allowlist SHALL be rejected, and the rejection SHALL NOT enumerate the valid
slugs.

Prices SHALL be resolved by lookup key rather than by id, so that one code path
serves both test and live mode, and SHALL NOT be cached, so that repricing via
`transfer_lookup_key` takes effect without a deploy.

The allowlist is the published-price boundary: a price absent from it SHALL NOT
be purchasable through this endpoint, which is how the non-public warm-lead price
stays sellable in Stripe and unreachable from the site.

#### Scenario: Requesting a checkout session for a published plan
- **WHEN** a POST arrives at `/api/checkout` naming a published plan slug
- **THEN** the slug resolves to an active recurring price and a subscription-mode Checkout Session URL is returned with status 200

#### Scenario: A client supplies its own price
- **WHEN** a POST body contains a price, price id, amount, or interval
- **THEN** the value is ignored, because no field a client can set names a price

#### Scenario: A client requests an unpublished plan
- **WHEN** a POST names a slug that is not on the allowlist
- **THEN** the endpoint returns 400 and the message does not reveal which slugs are valid

#### Scenario: A slug that collides with an inherited object property
- **WHEN** a POST names a slug such as `toString` or `constructor`
- **THEN** it is rejected as unpublished, not resolved to an inherited property

#### Scenario: The resolved price is not recurring
- **WHEN** the price behind a published lookup key is a one-time price
- **THEN** the endpoint returns 500 and logs which price and lookup key are misconfigured, rather than failing opaquely inside Stripe

#### Scenario: Stripe is unreachable or misconfigured
- **WHEN** the Stripe API call fails
- **THEN** the endpoint returns 500 with a plain-language message and logs the failure without logging the applicant

### Requirement: Webhook events are signature-verified before they are trusted
The system SHALL expose `POST /api/stripe-webhook`, which verifies the
`stripe-signature` header against `STRIPE_WEBHOOK_SECRET` using the exact raw
request body before parsing or acting on it.

The handler SHALL decode the body when `isBase64Encoded` is set, because Netlify
may deliver it base64-encoded and verification against the decoded-in-the-wrong-place
body fails with an otherwise-valid secret.

A request whose signature does not verify SHALL return 400 and SHALL write
nothing to the database.

#### Scenario: A correctly signed event arrives
- **WHEN** a POST arrives with a valid `stripe-signature` for the raw body
- **THEN** the event is processed and 200 is returned

#### Scenario: A forged or unsigned event arrives
- **WHEN** the signature header is missing or does not verify
- **THEN** the endpoint returns 400 and no database write occurs

#### Scenario: Netlify delivers a base64-encoded body
- **WHEN** `isBase64Encoded` is true on the incoming event
- **THEN** the body is decoded before verification and the signature verifies

### Requirement: Membership status is recorded and kept current
The system SHALL maintain a `memberships` row per Stripe subscription, holding
the member's email, Stripe customer and subscription ids, status, and
`current_period_end`.

Writes SHALL be idempotent upserts keyed on `stripe_subscription_id`, because
Stripe delivers events at least once and out of order; replaying an event SHALL
NOT create a duplicate row or move `current_period_end` backwards.

The table SHALL be defined both in `db/migrations/` and as a
`CREATE TABLE IF NOT EXISTS` in the function, per this repo's twice-defined
schema convention.

#### Scenario: A member completes checkout
- **WHEN** `checkout.session.completed` is received for a subscription
- **THEN** a `memberships` row exists with status `active` and a `current_period_end` one year out

#### Scenario: The same event is delivered twice
- **WHEN** an event already processed is delivered again
- **THEN** the existing row is updated in place and no duplicate row is created

#### Scenario: A subscription is cancelled or payment fails
- **WHEN** `customer.subscription.deleted` or `invoice.payment_failed` is received
- **THEN** the row's status is updated to reflect it, so lapsed access is visible without opening the Stripe dashboard

#### Scenario: An event type with no handler arrives
- **WHEN** an event type this system does not handle is received
- **THEN** 200 is returned and nothing is written, so Stripe does not retry it indefinitely
