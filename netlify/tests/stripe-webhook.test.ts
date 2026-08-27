import { describe, it, expect, beforeAll } from 'vitest';
import { createHmac } from 'node:crypto';
import type { HandlerEvent } from '@netlify/functions';
import { handler, upsertMembership, idOf, periodEnd } from '../functions/stripe-webhook';

const WEBHOOK_SECRET = 'whsec_test_secret_for_signature_verification';

beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.NETLIFY_DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
});

/**
 * Builds the same `stripe-signature` header Stripe sends:
 *   t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<payload>" with the secret>
 *
 * Signing here rather than stubbing `constructEvent` is the point of this file.
 * A stub would pass whether or not the handler decodes a base64 body, which is
 * precisely the bug these tests exist to catch.
 */
function sign(payload: string, secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000)) {
    const signature = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    return `t=${timestamp},v1=${signature}`;
}

function makeEvent(
    body: string,
    opts: { signature?: string; method?: string; isBase64Encoded?: boolean } = {},
): HandlerEvent {
    const { signature, method = 'POST', isBase64Encoded = false } = opts;
    return {
        httpMethod: method,
        body,
        isBase64Encoded,
        headers: signature ? { 'stripe-signature': signature } : {},
    } as unknown as HandlerEvent;
}

/**
 * An event type the handler does not act on. Using one keeps every test in this
 * file returning BEFORE the first SQL call, so none of them opens a database
 * connection — the same convention as the other function tests.
 */
const unhandledEvent = JSON.stringify({
    id: 'evt_test_unhandled',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test' } },
});

describe('stripe-webhook.ts request handling', () => {
    it('rejects non-POST requests', async () => {
        const res = await handler(makeEvent('', { method: 'GET' }), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('rejects a request with no stripe-signature header', async () => {
        const res = await handler(makeEvent(unhandledEvent), {} as never);
        expect(res?.statusCode).toBe(400);
    });
});

describe('stripe-webhook.ts signature verification', () => {
    it('rejects a signature computed with the wrong secret', async () => {
        const res = await handler(
            makeEvent(unhandledEvent, { signature: sign(unhandledEvent, 'whsec_wrong_secret') }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a well-formed signature over a different payload', async () => {
        // The classic tamper: valid HMAC, but of something else.
        const res = await handler(
            makeEvent(unhandledEvent, { signature: sign('{"type":"something.else"}') }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a garbage signature header', async () => {
        const res = await handler(
            makeEvent(unhandledEvent, { signature: 'not-a-signature' }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a signature outside the timestamp tolerance', async () => {
        const longAgo = Math.floor(Date.now() / 1000) - 60 * 60;
        const res = await handler(
            makeEvent(unhandledEvent, { signature: sign(unhandledEvent, WEBHOOK_SECRET, longAgo) }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });

    it('accepts a correctly signed request', async () => {
        const res = await handler(
            makeEvent(unhandledEvent, { signature: sign(unhandledEvent) }),
            {} as never,
        );
        expect(res?.statusCode).toBe(200);
    });

    /**
     * The regression this whole file is for. Netlify may hand the body over
     * base64-encoded; verifying the encoded string fails with a valid secret,
     * and the failure looks exactly like a wrong secret.
     */
    it('decodes a base64-encoded body before verifying the signature', async () => {
        const encoded = Buffer.from(unhandledEvent, 'utf8').toString('base64');
        const res = await handler(
            makeEvent(encoded, { signature: sign(unhandledEvent), isBase64Encoded: true }),
            {} as never,
        );
        expect(res?.statusCode).toBe(200);
    });

    it('does not verify a base64 body when the flag is not set', async () => {
        // Same bytes, flag absent: the handler must NOT guess at decoding.
        const encoded = Buffer.from(unhandledEvent, 'utf8').toString('base64');
        const res = await handler(
            makeEvent(encoded, { signature: sign(unhandledEvent), isBase64Encoded: false }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });
});

describe('stripe-webhook.ts event routing', () => {
    it('acknowledges an unhandled event type without acting on it', async () => {
        const res = await handler(
            makeEvent(unhandledEvent, { signature: sign(unhandledEvent) }),
            {} as never,
        );
        // 200 and not 4xx/5xx: a non-2xx makes Stripe retry, for days, an event
        // this system will never handle.
        expect(res?.statusCode).toBe(200);
        expect(JSON.parse(res?.body as string)).toEqual({ received: true, handled: false });
    });
});

/**
 * These exercise the write path without a database, by handing
 * `upsertMembership` a tagged-template stub that captures the SQL it builds.
 *
 * Scope, stated honestly: this asserts the query the handler CONSTRUCTS, not
 * Postgres's execution of it. The behavioural proof is the end-to-end run in
 * `openspec/changes/add-membership-subscription-billing/tasks.md` §4.3–4.4,
 * which needs real Stripe credentials. What it does catch is the guard being
 * deleted or weakened by a later edit, which is cheap to do and expensive to
 * notice — a member reads as active for a year after cancelling.
 */
describe('upsertMembership ordering safety', () => {
    function captureSql() {
        const queries: string[] = [];
        const stub = ((strings: TemplateStringsArray) => {
            queries.push(strings.join('?'));
            return Promise.resolve([]);
        }) as unknown as Parameters<typeof upsertMembership>[0];
        return { stub, queries };
    }

    const row = {
        email: 'member@example.com',
        customerId: 'cus_test',
        subscriptionId: 'sub_test',
        status: 'active',
        currentPeriodEnd: '2027-08-27T00:00:00.000Z',
        lastEventAt: '2026-08-27T00:00:00.000Z',
    };

    it('upserts on the subscription id rather than inserting blind', async () => {
        const { stub, queries } = captureSql();
        await upsertMembership(stub, row);
        expect(queries[0]).toMatch(/ON CONFLICT \(stripe_subscription_id\) DO UPDATE/);
    });

    it('guards the update so a stale event cannot overwrite a newer one', async () => {
        const { stub, queries } = captureSql();
        await upsertMembership(stub, row);
        expect(queries[0]).toMatch(
            /WHERE\s+EXCLUDED\.last_event_at\s*>=\s*memberships\.last_event_at/,
        );
    });

    it('does not blank a stored period end when an event carries none', async () => {
        const { stub, queries } = captureSql();
        await upsertMembership(stub, { ...row, currentPeriodEnd: null });
        expect(queries[0]).toMatch(/current_period_end = COALESCE\(/);
    });

    it('does not blank a stored email when an event carries none', async () => {
        const { stub, queries } = captureSql();
        await upsertMembership(stub, { ...row, email: null });
        expect(queries[0]).toMatch(/email = COALESCE\(EXCLUDED\.email, memberships\.email\)/);
    });
});

describe('webhook field helpers', () => {
    it('reads an id from either an expanded object or a bare string', () => {
        expect(idOf('sub_123')).toBe('sub_123');
        expect(idOf({ id: 'sub_123' })).toBe('sub_123');
    });

    it('returns null for an absent id rather than inventing one', () => {
        expect(idOf(null)).toBeNull();
        expect(idOf(undefined)).toBeNull();
    });

    it('converts Stripe unix seconds to an ISO timestamp', () => {
        expect(periodEnd(1793577600)).toBe(new Date(1793577600 * 1000).toISOString());
    });

    it('returns null for a missing period end instead of the epoch', () => {
        // A subscription item without current_period_end must not become
        // 1970-01-01, which would read as "lapsed 56 years ago".
        expect(periodEnd(null)).toBeNull();
        expect(periodEnd(undefined)).toBeNull();
    });
});

describe('stripe-webhook.ts catalogue events', () => {
    const catalogueEvent = JSON.stringify({
        id: 'evt_price_updated',
        object: 'event',
        type: 'price.updated',
        created: Math.floor(Date.now() / 1000),
        data: { object: { id: 'price_test', object: 'price' } },
    });

    it('acknowledges a price change without a build hook configured', async () => {
        delete process.env.NETLIFY_BUILD_HOOK_URL;
        const res = await handler(
            makeEvent(catalogueEvent, { signature: sign(catalogueEvent) }),
            {} as never,
        );
        // 200, not an error: a missing hook is a deploy that has not been wired
        // yet, and a non-2xx would make Stripe redeliver for days.
        expect(res?.statusCode).toBe(200);
        expect(JSON.parse(res?.body as string).rebuild).toBe('not-configured');
    });

    it('never touches the database for a catalogue event', async () => {
        // NETLIFY_DATABASE_URL is a bogus host in these tests; reaching Postgres
        // would throw and surface as a 500. A 200 proves it returned first.
        delete process.env.NETLIFY_BUILD_HOOK_URL;
        const res = await handler(
            makeEvent(catalogueEvent, { signature: sign(catalogueEvent) }),
            {} as never,
        );
        expect(res?.statusCode).toBe(200);
    });
});
