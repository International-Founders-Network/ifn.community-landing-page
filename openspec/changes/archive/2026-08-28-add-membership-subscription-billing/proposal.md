## Why

Membership has been sold by hand: `/membership` sent the reader to `/contact`,
`netlify/functions/contact.ts` stored the message, and a person replied with a
payment link. `BACKLOG.md` records replacing that with a real gateway, and the
`membership-page` spec's dated correction says a gateway needs a delta first.
This is that delta.

The founder chose **recurring** annual billing, and wants IFN to know who is a
member and when their access lapses. That needs a Checkout Session and a webhook,
which supersedes `PRODUCT.md` line 39 ("membership is transacted through Stripe
Payment Links, not an in-app checkout").

`STRIPE_PAYMENT_LINK` in `src/data/membershipData.ts` was imported by nothing and
named a different product ("IFN Pro", $79/month). Anyone wiring it would have
charged the wrong amount on the wrong billing period, so it is deleted rather
than left as a trap.

## Baseline

Based on `seo/aeo-analytics-and-crawlability`, which already carries the
single-price membership page and the corrected `membership-page` spec. This
matters: on `main` the page still renders a two-price grid including the $99
warm-lead price, so wiring a $149 subscription there would have shown a reader a
price the button will not charge. The server half of this work was built and
verified on a `main`-based branch first; the page half was only ever possible
here.

## What Changes

- `POST /api/checkout`: creates a Checkout Session in `mode: 'subscription'`. The
  browser sends a plan **slug**, checked against a server-side allowlist and
  resolved through a Stripe **lookup key**. No price id lives in the repo or the
  environment, so one code path serves test and live mode.
- `POST /api/stripe-webhook`: verifies the Stripe signature against the raw body
  and records subscription lifecycle events.
- A `memberships` table: who is a member, their Stripe ids, status, and
  `current_period_end`.
- `/membership`: the CTA becomes a button that opens Checkout, with an error
  state that keeps `/contact` reachable; the billing copy states annual renewal;
  the page reports `?checkout=success` and `?checkout=cancelled`.
- `STRIPE_PAYMENT_LINK` deleted.
- `.env` untracked and gitignored — it was committed with a live Neon connection
  string, so adding a Stripe secret key to it would have published one.

## Non-goals

- **No member login and no gated content.** The private channel, resource library
  and office hours are delivered by hand. This records who has paid; it does not
  enforce entitlement.
- **No self-serve cancellation or billing portal.**
- **No second price in this repo.** The warm-lead price stays email-only. The
  `PLANS` allowlist in `checkout.ts` is what enforces this: a price absent from it
  cannot be bought through the site.
- **No change to the contact flow.** `/contact` is untouched and remains the
  fallback whenever checkout fails.

## Capabilities

### New Capabilities
- `membership-billing`: subscription checkout, webhook ingestion, and the
  server-side record of membership status.

### Modified Capabilities
- `membership-page`: the CTA opens Checkout instead of routing to `/contact`, the
  page states recurring billing, and it reports the post-checkout outcome.

## Impact

Affected code: new `netlify/functions/checkout.ts`,
`netlify/functions/stripe-webhook.ts`, `db/migrations/03_memberships.sql`,
`netlify/tests/{checkout,stripe-webhook}.test.ts`; modified
`src/pages/Membership.tsx`, `src/data/membershipData.ts`,
`src/components/FinalCTA.tsx` (a stale comment), `package.json`, `.gitignore`,
new `.env.example`, `README.md`, `db/README.md`, `BACKLOG.md`.
