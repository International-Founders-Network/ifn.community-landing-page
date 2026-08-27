import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

/**
 * Receives Stripe subscription lifecycle events and keeps the `memberships`
 * table current, so IFN can see who is a member and when their access lapses
 * without opening the Stripe dashboard.
 *
 * TWO THINGS HERE ARE LOAD-BEARING AND LOOK LIKE BOILERPLATE.
 *
 * 1. THE BODY MUST BE THE EXACT BYTES STRIPE SIGNED. Netlify may hand the body
 *    over base64-encoded (`isBase64Encoded`), and verifying the encoded string
 *    fails with a perfectly valid secret. That failure reads as "wrong webhook
 *    secret" and gets debugged in the Stripe dashboard for an hour. Decode
 *    first. Do not "simplify" this by reaching for `JSON.parse` — re-serialising
 *    the object changes the bytes and breaks the signature just as thoroughly.
 *
 * 2. NOTHING IS PARSED OR WRITTEN BEFORE THE SIGNATURE VERIFIES. An unverified
 *    request is an anonymous stranger claiming a subscription is active. The
 *    only thing this handler does with one is return 400.
 */

/** Subscription lifecycle: these write to `memberships`. */
const MEMBERSHIP_EVENTS = new Set([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed',
]);

/**
 * Catalogue changes: these touch no data, they rebuild the site.
 *
 * The published price is baked into HTML and JSON-LD at build time (see
 * `scripts/sync-pricing.mjs` for why it cannot be fetched in the browser), so
 * editing a price in Stripe does not change the site until something rebuilds
 * it. This is that something: Stripe stays the one place a price is edited, and
 * the site catches up on its own within a couple of minutes.
 */
const CATALOGUE_EVENTS = new Set([
    'price.created',
    'price.updated',
    'price.deleted',
    'product.updated',
]);

function json(statusCode: number, payload: Record<string, unknown>) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
}

/** The raw signed payload — see note 1 above. */
function rawBody(event: HandlerEvent): string {
    const body = event.body ?? '';
    return event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
}

/** Header lookup is case-insensitive; Netlify lowercases, `stripe listen` may not. */
function header(event: HandlerEvent, name: string): string | undefined {
    const headers = event.headers ?? {};
    const hit = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    return hit ? headers[hit] : undefined;
}

export function periodEnd(seconds: number | null | undefined): string | null {
    return typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : null;
}

// `ReturnType<typeof neon>` widens the generics to <boolean, boolean>, which is
// not what an actual `neon(url)` call returns. Instantiate them explicitly.
type SqlClient = ReturnType<typeof neon<false, false>>;

/**
 * Idempotent, ORDER-SAFE upsert keyed on `stripe_subscription_id`.
 *
 * Stripe delivers events at least once and NOT in order, and both halves of
 * that matter:
 *
 * - At least once: a redelivery must update in place, hence ON CONFLICT.
 * - Out of order: a STALE event must not overwrite a newer one. Without the
 *   WHERE guard below, `subscription.deleted` followed by a delayed
 *   `subscription.updated` flips a cancelled member back to `active` — the row
 *   then lies about the one question this table exists to answer. The guard
 *   compares Stripe's own `event.created`, so a late event is a silent no-op
 *   rather than a wrong write.
 *
 * `>=` rather than `>` so an exact redelivery still applies and stays harmless.
 */
export async function upsertMembership(
    sql: SqlClient,
    row: {
        email: string | null;
        customerId: string;
        subscriptionId: string;
        status: string;
        currentPeriodEnd: string | null;
        lastEventAt: string;
    },
) {
    await sql`
        INSERT INTO memberships (
            email, stripe_customer_id, stripe_subscription_id, status,
            current_period_end, last_event_at
        )
        VALUES (
            ${row.email}, ${row.customerId}, ${row.subscriptionId},
            ${row.status}, ${row.currentPeriodEnd}, ${row.lastEventAt}
        )
        ON CONFLICT (stripe_subscription_id) DO UPDATE SET
            email = COALESCE(EXCLUDED.email, memberships.email),
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            status = EXCLUDED.status,
            -- COALESCE, not assignment: invoice.payment_failed carries no period
            -- end and must not blank the stored one.
            current_period_end = COALESCE(
                EXCLUDED.current_period_end, memberships.current_period_end
            ),
            last_event_at = EXCLUDED.last_event_at,
            updated_at = CURRENT_TIMESTAMP
        WHERE EXCLUDED.last_event_at >= memberships.last_event_at
    `;
}

/**
 * Pokes the Netlify build hook so the site picks up a new price.
 *
 * Returns a status rather than throwing: a failed rebuild must not turn into a
 * non-2xx, because Stripe would then redeliver the price change for days and we
 * would rebuild repeatedly for the same edit. The stale price is the smaller
 * problem, and it is visible in the log.
 */
async function requestRebuild(eventType: string): Promise<string> {
    const hook = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hook) {
        console.warn(`${eventType} received but NETLIFY_BUILD_HOOK_URL is not set; not rebuilding.`);
        return 'not-configured';
    }
    try {
        const response = await fetch(hook, { method: 'POST' });
        if (!response.ok) {
            console.error(`Build hook returned ${response.status} for ${eventType}.`);
            return 'failed';
        }
        console.log(`${eventType}: triggered a Netlify rebuild to republish the price.`);
        return 'triggered';
    } catch (error) {
        console.error(`Build hook request failed for ${eventType}:`, error);
        return 'failed';
    }
}

export function idOf(value: string | { id: string } | null | undefined): string | null {
    if (!value) return null;
    return typeof value === 'string' ? value : value.id;
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
        console.error(
            'Stripe webhook is not configured:',
            !secretKey ? 'STRIPE_SECRET_KEY missing' : '',
            !webhookSecret ? 'STRIPE_WEBHOOK_SECRET missing' : '',
        );
        return json(500, { error: 'Webhook not configured' });
    }

    const signature = header(event, 'stripe-signature');
    if (!signature) {
        return json(400, { error: 'Missing stripe-signature header' });
    }

    const stripe = new Stripe(secretKey);

    let stripeEvent: Stripe.Event;
    try {
        stripeEvent = stripe.webhooks.constructEvent(rawBody(event), signature, webhookSecret);
    } catch (error) {
        // Never log the body: an unverified payload is attacker-controlled.
        console.error(
            'Stripe signature verification failed:',
            error instanceof Error ? error.message : 'unknown error',
        );
        return json(400, { error: 'Invalid signature' });
    }

    // A catalogue change rebuilds the site and touches no data, so it returns
    // before the database is opened at all.
    if (CATALOGUE_EVENTS.has(stripeEvent.type)) {
        const rebuilt = await requestRebuild(stripeEvent.type);
        return json(200, { received: true, handled: true, rebuild: rebuilt });
    }

    // Acknowledge anything we do not handle. Returning non-2xx would make
    // Stripe retry an event this system will never act on, for days.
    if (!MEMBERSHIP_EVENTS.has(stripeEvent.type)) {
        return json(200, { received: true, handled: false });
    }

    // Stripe's own clock for this event, and the ordering key for every write
    // below. Not `new Date()` — local time says when we received the event, not
    // when it happened, and receipt order is exactly what is unreliable.
    const eventCreatedAt = new Date(stripeEvent.created * 1000).toISOString();

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        // Idempotent. Mirrors db/migrations/03_memberships.sql — the schema is
        // defined twice on purpose, see db/README.md and AGENTS.md.
        await sql`
            CREATE TABLE IF NOT EXISTS memberships (
                id SERIAL PRIMARY KEY,
                email TEXT,
                stripe_customer_id TEXT NOT NULL,
                stripe_subscription_id TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                current_period_end TIMESTAMP WITH TIME ZONE,
                last_event_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        switch (stripeEvent.type) {
            case 'checkout.session.completed': {
                const session = stripeEvent.data.object;
                const subscriptionId = idOf(session.subscription);
                const customerId = idOf(session.customer);

                // A one-off payment session has no subscription. Nothing in
                // this repo creates one, but an event from another product on
                // the same Stripe account would arrive here too.
                if (!subscriptionId || !customerId) break;

                // The session carries the email but not the period end, so read
                // the subscription itself rather than guessing a year forward.
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const item = subscription.items.data[0];

                await upsertMembership(sql, {
                    email: session.customer_details?.email ?? session.customer_email ?? null,
                    customerId,
                    subscriptionId,
                    status: subscription.status,
                    currentPeriodEnd: periodEnd(item?.current_period_end),
                    lastEventAt: eventCreatedAt,
                });
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = stripeEvent.data.object;
                const customerId = idOf(subscription.customer);
                if (!customerId) break;

                const item = subscription.items.data[0];

                await upsertMembership(sql, {
                    // Not on the subscription object; COALESCE in the upsert
                    // keeps whatever checkout already recorded.
                    email: null,
                    customerId,
                    subscriptionId: subscription.id,
                    status:
                        stripeEvent.type === 'customer.subscription.deleted'
                            ? 'canceled'
                            : subscription.status,
                    currentPeriodEnd: periodEnd(item?.current_period_end),
                    lastEventAt: eventCreatedAt,
                });
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = stripeEvent.data.object;
                const customerId = idOf(invoice.customer);
                const subscriptionId = idOf(
                    invoice.parent?.subscription_details?.subscription ?? null,
                );
                if (!customerId || !subscriptionId) break;

                await upsertMembership(sql, {
                    email: null,
                    customerId,
                    subscriptionId,
                    status: 'past_due',
                    // A failed payment does not extend the period. Passing null
                    // leaves the stored value alone via COALESCE.
                    currentPeriodEnd: null,
                    lastEventAt: eventCreatedAt,
                });
                break;
            }
        }

        return json(200, { received: true, handled: true });
    } catch (error) {
        // Log the failure, never the member. Emails must not reach function logs.
        console.error(`Stripe webhook error handling ${stripeEvent.type}:`, error);
        // 500 asks Stripe to retry — correct here, because the event was
        // genuine and the failure was ours.
        return json(500, { error: 'Internal server error' });
    }
};
