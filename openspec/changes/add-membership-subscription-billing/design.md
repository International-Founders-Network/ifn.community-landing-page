# Design: membership subscription billing

## Billing model

One Stripe Product, one **recurring** Price: $149 USD, `interval: 'year'`,
carrying the lookup key `founding_member_annual`.

**Prices are resolved by lookup key, not by id.** The browser sends a plan slug,
`checkout.ts` checks it against the `PLANS` allowlist and calls
`prices.list({ lookup_keys, active: true })`. A price id was the obvious first
design and is the wrong one: ids differ between test and live mode, so an id in
env or in the repo only works in one of them, and each new product needs another
variable set in two places. A lookup key is a name we choose and set in both
modes.

Consequences worth knowing:

- Adding a product is a Stripe change plus one line in `PLANS` — no new env var,
  no deploy to the Netlify dashboard.
- Repricing uses `transfer_lookup_key: true` and takes effect on the next
  checkout. This is why the resolved price is **not cached**: a cache saves one
  API call and defeats the mechanism.
- `PLANS` is the published-price allowlist. The warm-lead price stays sellable
  in Stripe and unreachable from the site by not being listed. This turns "only
  publish one price" from a rule people remember into one the code enforces.
- Lookups use `Object.hasOwn`, because a plain object inherits from
  `Object.prototype` and a slug of `toString` would otherwise resolve to a
  function and pass a truthiness check.

No Stripe identifier — price id, product id, payment link — is committed.

`mode: 'subscription'` renews yearly until cancelled. This is the founder's
decision, recorded 2026-08-27, and it supersedes `PRODUCT.md` line 39 (Payment
Links, not in-app checkout). That line is updated in this change rather than
left to contradict the code.

## The warm-lead price stays out of the repo

A second annual price ($99) is emailed by hand to roughly forty people.

**State of the baseline, stated plainly:** this branch already removed the
warm-lead price from the public page — `MEMBERSHIP_PRICE_ATTENDEE` and the
two-price grid are gone, and only a comment in `membershipData.ts` records that
the second price exists. On `origin/main` that is still not true, which is
precisely why the page half of this work could not land there.

What this change does guarantee is the Stripe side of the same rule. The
warm-lead cohort may have its own Stripe Price, but neither its amount nor its
id may reach `src/`, `netlify/`, or any committed config. Only
only the `PLANS` allowlist in `checkout.ts` decides what the site
can sell, and it lists exactly one slug. If that cohort needs self-serve checkout later, it is a separate
proposal.

## Data

New table, defined in **both** `db/migrations/03_memberships.sql` and the
webhook function's own `CREATE TABLE IF NOT EXISTS` — the repo defines schema
twice on purpose (`AGENTS.md`, `db/README.md`), and the two drift silently if
only one is updated.

```
memberships
  id                      SERIAL PRIMARY KEY
  email                   TEXT NOT NULL
  stripe_customer_id      TEXT NOT NULL
  stripe_subscription_id  TEXT NOT NULL UNIQUE
  status                  TEXT NOT NULL      -- active | past_due | canceled | incomplete
  current_period_end      TIMESTAMPTZ
  last_event_at           TIMESTAMPTZ NOT NULL  -- Stripe's event.created
  created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

`stripe_subscription_id` is UNIQUE so the webhook can upsert. Stripe delivers
events at least once **and out of order**, and both halves need handling:

- *At least once* → every write is an upsert keyed on that column, never an
  unconditional INSERT.
- *Out of order* → the `ON CONFLICT DO UPDATE` carries
  `WHERE EXCLUDED.last_event_at >= memberships.last_event_at`, comparing
  Stripe's own `event.created`. Without it, `customer.subscription.deleted`
  followed by a delayed `customer.subscription.updated` flips a cancelled member
  back to `active`, and the row then lies about the single question the table
  exists to answer. A stale event is a silent no-op instead of a wrong write.

`email` and `current_period_end` are additionally COALESCEd, because
`customer.subscription.*` carries no email and `invoice.payment_failed` carries
no period end; assigning either would blank what checkout recorded.

## Webhook: the two failure modes that actually happen

1. **Raw body.** `stripe.webhooks.constructEvent` must be handed the exact bytes
   Stripe signed. Netlify may deliver the body base64-encoded, so the handler
   must check `event.isBase64Encoded` and decode before verifying. Skipping this
   produces signature failures that look like a wrong secret and are debugged in
   the wrong place.
2. **Unverified events are not trusted.** A request that fails signature
   verification returns 400 and writes nothing. The handler must never read
   `JSON.parse(event.body)` before verification succeeds.

Events handled: `checkout.session.completed`,
`customer.subscription.updated`, `customer.subscription.deleted`,
`invoice.payment_failed`. Anything else returns 200 and is ignored — returning a
non-2xx makes Stripe retry an event we will never handle.

## Environment

| Variable | Used by | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `checkout.ts` | Server only. Never bundled into `src/`. |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook.ts` | Differs between `stripe listen` and the deployed endpoint. |
| `NETLIFY_DATABASE_URL` | both | Already in use by existing functions. |

The publishable key is not needed: Checkout is redirect-based, so the browser
never talks to Stripe directly.

## Testing and verification

- The webhook test goes in `netlify/tests/stripe-webhook.test.ts`. It must not
  live under `netlify/functions/` — a dotted filename there fails Netlify's
  function-name rule and blocks the entire deploy while `CI / verify` still
  passes (`AGENTS.md`).
- Tests cover method rejection, missing signature, bad signature, base64 body
  decoding, and unknown-event pass-through. Like the existing function tests,
  every case returns before the first SQL call, so no test opens a database
  connection.
- End-to-end verification runs locally: `npx netlify dev` plus
  `stripe listen --forward-to localhost:8888/api/stripe-webhook`. It cannot be
  verified on a Netlify deploy preview — `AGENTS.md` documents that previews are
  blocked before build on Git-contributor identity.
- Before calling this done, run Stripe in **test mode** and confirm a real test
  card produces a `memberships` row with `status = 'active'` and a
  `current_period_end` one year out.

## Rollback

`/contact` and `netlify/functions/contact.ts` are untouched, so reverting the
CTA restores the working hand-sold flow with no data loss and no schema change.
