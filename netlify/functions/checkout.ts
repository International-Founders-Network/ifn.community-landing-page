import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';
import planConfig from '../../src/data/plans.json';

/**
 * Creates a Stripe Checkout Session for the annual IFN membership.
 *
 * `mode: 'subscription'` — membership renews yearly until cancelled. This
 * supersedes PRODUCT.md's "Payment Links, not an in-app checkout" line: a
 * Payment Link cannot give IFN its own record of who is a member and when
 * their access lapses, which is the point of this endpoint's sibling,
 * `stripe-webhook.ts`.
 *
 * THE CLIENT CANNOT CHOOSE WHAT IT PAYS.
 * The browser sends a plan *slug*, never a price, amount, interval or Stripe
 * price id. The slug is checked against `PLANS` below and resolved server-side.
 * A client that could name its own price could subscribe for a dollar; a client
 * that could name its own price id could reach the non-public warm-lead price.
 * An unrecognised slug is a 400, not a fallback.
 */

/**
 * Published plans, read from the shared allowlist in `src/data/plans.json`.
 *
 * It lives there rather than here because `scripts/sync-pricing.mjs` needs the
 * same list to decide which prices the SITE may print. Two copies would let the
 * site advertise a price it cannot sell, or sell one it does not advertise.
 * `netlify/functions/events.ts` already imports across this boundary the same way.
 *
 * WHY LOOKUP KEYS RATHER THAN PRICE IDS. A price id differs between test and
 * live mode, so an id in the repo or in an environment variable only ever works
 * in one of them, and every new product needs another variable set in two
 * places. A lookup key is a name we choose and set in BOTH modes.
 *
 * Repricing never touches this repo: create the new price with
 * `transfer_lookup_key: true` and the next checkout picks it up.
 *
 * THIS LIST IS THE PUBLISHED-PRICE BOUNDARY. The warm-lead price stays sellable
 * in Stripe and unreachable here by not being listed. Do not add it.
 */
const PLANS: Record<string, string> = Object.fromEntries(
    Object.entries(planConfig.plans).map(([slug, plan]) => [slug, plan.lookupKey]),
);

/** What a request with no plan asks for. */
const DEFAULT_PLAN = planConfig.defaultPlan;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 maximum address length

/**
 * Shown whenever checkout cannot run for a reason that is ours, not the
 * reader's. It never names an environment variable or a Stripe object, and it
 * points at the flow that still works.
 */
const UNAVAILABLE =
    'Online payment is not available right now. Please use the contact form and a person from the IFN team will help you.';

function json(statusCode: number, payload: Record<string, unknown>) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
}

/**
 * The site's own origin, for the post-checkout redirects.
 *
 * VALIDATE, DO NOT TRUST. `netlify dev` synthesises `DEPLOY_PRIME_URL` from the
 * branch name, so a branch containing a slash — `feat/membership-stripe-redesign`
 * — produces `https://feat/membership-stripe-redesign--site-name.netlify.app`,
 * whose host is literally `feat`. Stripe accepts that URL happily and then
 * redirects a paying member into nowhere. It was caught only by reading a real
 * session's `success_url` back out of Stripe; nothing about the local page looked
 * wrong, because the failure happens after the reader leaves the site.
 *
 * So each candidate must parse, be http(s), and have a host that could actually
 * resolve. The request's own host is the last resort and the one that is always
 * right locally.
 */
export function isUsableOrigin(candidate: string): boolean {
    let url: URL;
    try {
        url = new URL(candidate);
    } catch {
        return false;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    // A bare label like "feat" is never a real host. Anything routable is either
    // dotted or localhost.
    const host = url.hostname;
    return host.includes('.') || host === 'localhost';
}

/**
 * Hosts we will send a payer back to. The request's own Host header is the most
 * accurate signal of where the reader actually is — it is the only one that
 * distinguishes a deploy preview from production — but it is also client-
 * supplied, so it is accepted only against this list rather than on trust.
 */
export function isTrustedHost(hostname: string): boolean {
    return (
        hostname === 'ifn.community' ||
        hostname.endsWith('.ifn.community') ||
        hostname.endsWith('.netlify.app') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
    );
}

function siteOrigin(event: HandlerEvent): string {
    const host = event.headers?.host;
    const fromRequest = host
        ? `${host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'}://${host}`
        : '';

    // The request host comes FIRST, when it is one of ours.
    //
    // Netlify does not reliably expose DEPLOY_PRIME_URL to the function runtime,
    // so on a deploy preview the old order fell through to `URL` — production —
    // and a payer testing a preview was returned to ifn.community instead of the
    // preview they started on. Confirmed on deploy-preview-5: the session came
    // back with success_url https://ifn.community/membership?checkout=success.
    if (fromRequest && isUsableOrigin(fromRequest)) {
        try {
            if (isTrustedHost(new URL(fromRequest).hostname)) return fromRequest;
        } catch {
            // fall through to the environment
        }
    }

    for (const candidate of [process.env.DEPLOY_PRIME_URL, process.env.URL]) {
        if (candidate && isUsableOrigin(candidate)) return candidate.replace(/\/$/, '');
    }

    // Every candidate was absent, malformed, or an untrusted host. Production is
    // the safe guess: a real page rather than a browser error.
    console.error('No usable site origin; falling back to the production URL.');
    return 'https://ifn.community';
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    // Configuration, not user error. Fail loudly in the log and vaguely to the
    // reader — a misconfigured deploy must not tell a visitor which env var is
    // missing.
    if (!secretKey) {
        console.error('Checkout is not configured: STRIPE_SECRET_KEY missing');
        return json(500, { error: UNAVAILABLE });
    }

    // The body is optional: a bare POST is a valid request. Only `email` is
    // read from it, and only to prefill the Stripe form.
    let data: Record<string, unknown> = {};
    if (event.body) {
        try {
            data = JSON.parse(event.body);
        } catch {
            return json(400, { error: 'We could not read that request. Please try again.' });
        }
    }

    const email = typeof data.email === 'string' ? data.email.trim() : '';
    if (email && (!EMAIL_REGEX.test(email) || email.length > MAX_EMAIL_LENGTH)) {
        return json(400, { error: 'That email address does not look right. Please check it.' });
    }

    const plan = typeof data.plan === 'string' && data.plan.trim() ? data.plan.trim() : DEFAULT_PLAN;
    // `Object.hasOwn`, not `PLANS[plan]` truthiness: a plain object inherits
    // from Object.prototype, so a slug of "toString" or "constructor" resolves
    // to a function and sails through a truthiness check.
    const lookupKey = Object.hasOwn(PLANS, plan) ? PLANS[plan] : undefined;
    if (!lookupKey) {
        // Deliberately does not list the valid slugs: the allowlist is not a
        // menu to be enumerated.
        console.error('Checkout requested an unknown plan:', plan);
        return json(400, { error: 'That membership plan is not available.' });
    }

    const stripe = new Stripe(secretKey);
    const origin = siteOrigin(event);

    try {
        // Resolved per request, not cached. A cache would be one fewer API call
        // and would also defeat `transfer_lookup_key`, whose whole point is that
        // repricing takes effect without a deploy.
        const prices = await stripe.prices.list({
            lookup_keys: [lookupKey],
            active: true,
            limit: 1,
        });
        const price = prices.data[0];

        if (!price) {
            // The plan is published here but absent from Stripe — a setup that
            // was never finished, or finished in the other mode.
            console.error(`No active price found for lookup key "${lookupKey}" (plan "${plan}")`);
            return json(500, { error: UNAVAILABLE });
        }

        // Caught here rather than as an opaque Stripe error: a one-time price in
        // a subscription-mode session fails in a way that reads like a bad key.
        if (price.type !== 'recurring') {
            console.error(
                `Price ${price.id} for lookup key "${lookupKey}" is ${price.type}, not recurring; ` +
                    'checkout is subscription-mode. Fix the price in Stripe.',
            );
            return json(500, { error: UNAVAILABLE });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: price.id, quantity: 1 }],
            success_url: `${origin}/membership?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/membership?checkout=cancelled`,
            ...(email ? { customer_email: email } : {}),
            // Stripe collects the address it needs for tax; IFN does not ask
            // for anything it does not use.
            billing_address_collection: 'auto',
            allow_promotion_codes: false,
        });

        if (!session.url) {
            console.error('Checkout session created without a URL:', session.id);
            return json(500, {
                error: 'We could not start checkout. Please try again, or use the contact form.',
            });
        }

        return json(200, { url: session.url });
    } catch (error) {
        // Log the failure, never the visitor's email address.
        console.error('Checkout session error:', error);
        return json(500, {
            error: 'We could not start checkout. Please try again, or use the contact form.',
        });
    }
};
