-- Membership subscriptions
-- Created: 2026-08-27
--
-- Records who is a paying member and when their access lapses, fed by
-- netlify/functions/stripe-webhook.ts. Stripe remains the system of record for
-- money; this table exists so IFN can answer "is this person a member?" without
-- opening the Stripe dashboard.
--
-- This file and the CREATE TABLE IF NOT EXISTS inside stripe-webhook.ts define
-- the same table on purpose (see db/README.md). Change both together.

CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  -- Nullable: subscription.* events do not carry an email. The webhook's upsert
  -- COALESCEs so a later event never blanks what checkout recorded.
  email TEXT,
  stripe_customer_id TEXT NOT NULL,
  -- UNIQUE is load-bearing, not hygiene: it is the ON CONFLICT target that makes
  -- the webhook idempotent. Stripe delivers events at least once and out of
  -- order, so without this a redelivery inserts a duplicate member.
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  -- Stripe's own vocabulary: active | past_due | canceled | incomplete |
  -- incomplete_expired | trialing | unpaid. Not constrained here, because a new
  -- Stripe status must not start rejecting webhooks.
  status TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE,
  -- Stripe's `event.created` for the most recent event applied to this row.
  -- The webhook's ON CONFLICT carries
  --   WHERE EXCLUDED.last_event_at >= memberships.last_event_at
  -- so a STALE event is a no-op instead of a wrong write. Without it,
  -- subscription.deleted followed by a delayed subscription.updated flips a
  -- cancelled member back to active. Stripe delivers out of order; this column
  -- is the only thing that makes the ordering safe.
  last_event_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- "Who is a member right now" and "whose access lapses this month" are the two
-- questions this table exists to answer.
CREATE INDEX IF NOT EXISTS memberships_status_idx ON memberships (status);
CREATE INDEX IF NOT EXISTS memberships_period_end_idx ON memberships (current_period_end);
CREATE INDEX IF NOT EXISTS memberships_email_idx ON memberships (email);
