## 1. Server

- [x] 1.1 `stripe` dependency
- [x] 1.2 `checkout.ts`: POST-only, subscription mode, plan slug resolved through a server-side allowlist to a Stripe lookup key; client-supplied price/amount/interval ignored
- [x] 1.3 `stripe-webhook.ts`: raw-body signature verification with `isBase64Encoded` handling; 400 and no write on failure
- [x] 1.4 Handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `invoice.payment_failed`; 200-and-ignore for everything else
- [x] 1.5 Idempotent, order-safe upsert keyed on `stripe_subscription_id`, guarded by `last_event_at`

## 2. Data

- [x] 2.1 `db/migrations/03_memberships.sql`
- [x] 2.2 Mirrored `CREATE TABLE IF NOT EXISTS` in the webhook (schema is defined twice on purpose)
- [x] 2.3 `db/README.md` documents the table

## 3. Page

- [x] 3.1 CTA is a `<Button>` that POSTs the plan slug and redirects to the session URL
- [x] 3.2 Error state shows a plain message and keeps `/contact` reachable
- [x] 3.3 "charged once" replaced with annual-renewal wording
- [x] 3.4 `?checkout=success` / `?checkout=cancelled` states — success confirms the *payment*, not the membership record, which a webhook writes out of band
- [x] 3.5 `STRIPE_PAYMENT_LINK` deleted; stale comment in `FinalCTA.tsx` corrected
- [x] 3.6 Warm-lead price still absent from every constant and surface

## 4. Secrets

- [x] 4.1 `.env` untracked and gitignored; `.env.example` added
- [x] 4.2 `README.md` documents the two env vars and the lookup-key setup

## 5. Verification

- [x] 5.1 `npm run lint`, `npm run build`, `npm test` pass (50 tests)
- [x] 5.2 All 11 routes prerender, `/membership` included
- [x] 5.3 Built `dist/` contains no warm-lead price, no `buy.stripe.com` link, no secret key and no price id
- [x] 5.4 `/membership` prerenders with the new CTA and renewal copy; "charged once" is gone
- [x] 5.5 No test file under `netlify/functions/` (a dotted name there blocks the whole deploy)
- [x] 5.6 **Browser path verified on this branch, 2026-08-27.** `netlify dev` +
  `stripe listen`, `/membership` loaded in Chrome: single price, "renews annually
  until you cancel", "Become a member". Clicking it POSTed the plan slug and
  redirected to a real Stripe Checkout session for $149/yr. Both return states
  render — `?checkout=success` ("Payment received") and `?checkout=cancelled`
  ("Nothing was charged"). Six checkout requests served, the only logged failure
  being the deliberate unknown-plan guard test.
- [x] 5.7 **Full payment run** was completed on the `main`-based branch, where the
  server files are byte-identical: real Checkout with card 4242 produced one
  `memberships` row from six events (`active`, email captured,
  `current_period_end` one year out); duplicate delivery stayed idempotent; a
  stale `active` event failed to revive a cancelled member while a newer one
  still applied.
