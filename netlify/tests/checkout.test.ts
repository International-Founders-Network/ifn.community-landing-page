import { describe, it, expect, beforeEach } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from '../functions/checkout';

beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
});

function makeEvent(body: unknown, method = 'POST'): HandlerEvent {
    return {
        httpMethod: method,
        body: body === undefined ? null : JSON.stringify(body),
        headers: { host: 'localhost:8888' },
    } as unknown as HandlerEvent;
}

function makeRawEvent(body: string, method = 'POST'): HandlerEvent {
    return { httpMethod: method, body, headers: { host: 'localhost:8888' } } as unknown as HandlerEvent;
}

// Every case here must return before the Stripe API call — these tests never
// open a network connection. That is why the plan-allowlist cases all use an
// unpublished slug: a valid one would reach `prices.list` and hit the network.
describe('checkout.ts request handling', () => {
    it('rejects non-POST requests', async () => {
        const res = await handler(makeEvent({}, 'GET'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('rejects a body that is not valid JSON', async () => {
        const res = await handler(makeRawEvent('{ not json'), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a malformed email', async () => {
        const res = await handler(makeEvent({ email: 'not-an-email' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects an over-long email', async () => {
        const res = await handler(
            makeEvent({ email: `${'a'.repeat(250)}@example.com` }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });
});

describe('checkout.ts configuration', () => {
    it('returns a usable message, not a crash, when the secret key is missing', async () => {
        delete process.env.STRIPE_SECRET_KEY;
        const res = await handler(makeEvent({}), {} as never);
        expect(res?.statusCode).toBe(500);
        // The reader is pointed at the flow that still works, and is not told
        // which environment variable is missing.
        const body = JSON.parse(res?.body as string);
        expect(body.error).toMatch(/contact form/i);
        expect(body.error).not.toMatch(/STRIPE_/);
    });
});

describe('checkout.ts plan allowlist', () => {
    it('rejects a plan slug that is not published', async () => {
        const res = await handler(makeEvent({ plan: 'warm-lead-99' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('does not enumerate the valid slugs in the error', async () => {
        const res = await handler(makeEvent({ plan: 'nope' }), {} as never);
        expect(JSON.parse(res?.body as string).error).not.toMatch(/founding/i);
    });

    it('does not treat an inherited Object property as a plan', async () => {
        // `PLANS['toString']` is a function, which passes a truthiness check and
        // would be handed to Stripe as a lookup key.
        for (const slug of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
            const res = await handler(makeEvent({ plan: slug }), {} as never);
            expect(res?.statusCode, `slug "${slug}" should be rejected`).toBe(400);
        }
    });

    it('ignores a client-supplied price, amount and interval', async () => {
        // These must not reach Stripe. With no such plan slug the request is
        // rejected outright, which is the point: there is no field a client can
        // set that names a price.
        const res = await handler(
            makeEvent({ price: 'price_attacker', amount: 1, interval: 'day', plan: 'nope' }),
            {} as never,
        );
        expect(res?.statusCode).toBe(400);
    });
});
