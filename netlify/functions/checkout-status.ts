import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';
import planConfig from '../../src/data/plans.json';
import { resolveSlackInvite } from './_lib/slackInvite';

/**
 * GET /api/checkout-status?session_id=cs_...
 *
 * Tells the membership page whether the Checkout Session Stripe just returned
 * the reader from is a paid IFN membership, and if so hands over the Members
 * Slack invite link.
 *
 * The page cannot decide this itself. `?checkout=success` is just a query
 * string anyone can type, so the invite is released only after the server has
 * read the session back from Stripe with our own secret key.
 *
 * THE RESPONSE CARRIES NOTHING FROM THE SESSION. Only `paid` and
 * `slackInviteUrl`: no email, no customer id, no amount. A session id leaks
 * easily (browser history, a shared screenshot of the URL), so whoever holds
 * one learns at most that a membership was bought and gets the same invite
 * link a buyer gets.
 *
 * Every failure, of any kind, is `{ paid: false }` with a 200. The page shows
 * the same email fallback for all of them, so there is nothing to gain from
 * telling a caller which check failed.
 *
 * Never log the session id, the session, or the invite URL. Stripe error
 * messages quote the id they could not find, so only the error type is logged.
 */

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

/**
 * Lookup keys of the published plans, from the same allowlist checkout.ts
 * sells from.
 *
 * checkout.ts sets no metadata on the session, so the plan is confirmed from
 * the expanded subscription instead: its items already carry their price
 * objects, lookup_key included, so this costs no extra Stripe call. A
 * subscription to any other price in the account (the unlisted warm-lead
 * price, or anything unrelated) does not unlock the invite here.
 */
const PUBLISHED_LOOKUP_KEYS = new Set(Object.values(planConfig.plans).map((plan) => plan.lookupKey));

const ACTIVE_SUBSCRIPTION = new Set<Stripe.Subscription.Status>(['active', 'trialing']);

function json(statusCode: number, payload: Record<string, unknown>) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'no-referrer',
            'X-Robots-Tag': 'noindex',
        },
        body: JSON.stringify(payload),
    };
}

const NOT_PAID = { paid: false };

/** True when the session is a completed, paid, live subscription to a published plan. */
export function isPaidMembership(session: Stripe.Checkout.Session): boolean {
    if (session.mode !== 'subscription') return false;
    if (session.status !== 'complete') return false;
    if (session.payment_status !== 'paid') return false;

    // A bare id means the expand did not happen; treat it as unverified.
    const subscription = session.subscription;
    if (!subscription || typeof subscription === 'string') return false;
    if (!ACTIVE_SUBSCRIPTION.has(subscription.status)) return false;

    return (subscription.items?.data ?? []).some((item) => {
        const key = item.price?.lookup_key;
        return typeof key === 'string' && PUBLISHED_LOOKUP_KEYS.has(key);
    });
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return json(405, { error: 'Method Not Allowed' });
    }

    const sessionId = event.queryStringParameters?.session_id ?? '';
    if (!SESSION_ID.test(sessionId)) {
        return json(200, NOT_PAID);
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.error('checkout-status is not configured: Stripe key missing');
        return json(200, NOT_PAID);
    }

    const stripe = new Stripe(secretKey);

    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    } catch (error) {
        // Stripe errors carry `type` and `code` (e.g. invalid_request_error,
        // resource_missing). Their `message` names the session id, so it is
        // never logged.
        const { type, code } = (error ?? {}) as { type?: unknown; code?: unknown };
        const label = [type, code].filter((part) => typeof part === 'string').join(' ');
        console.error('checkout-status: Stripe session lookup failed:', label || 'unknown error');
        return json(200, NOT_PAID);
    }

    if (!isPaidMembership(session)) {
        return json(200, NOT_PAID);
    }

    const { url } = resolveSlackInvite(process.env, new Date());
    return json(200, { paid: true, slackInviteUrl: url });
};
