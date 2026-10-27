import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';

/**
 * Stripe is mocked at the module boundary so these tests never open a network
 * connection. `retrieve` is the only Stripe call checkout-status makes.
 */
const { retrieve } = vi.hoisted(() => ({ retrieve: vi.fn() }));

vi.mock('stripe', () => ({
    default: class {
        checkout = { sessions: { retrieve } };
    },
}));

import { handler } from '../functions/checkout-status';

// A placeholder that can never resolve. No real invite link belongs in this repo.
const INVITE = 'https://example.invalid/slack-invite';
const SESSION_ID = 'cs_test_a1B2c3D4e5F6g7H8i9J0';
const savedEnv = { ...process.env };

beforeEach(() => {
    retrieve.mockReset();
    process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
    process.env.SLACK_INVITE_URL = INVITE;
    process.env.SLACK_INVITE_EXPIRES_AT = '2999-01-01';
});

afterEach(() => {
    process.env = { ...savedEnv };
});

function makeEvent(params: Record<string, string> | null, method = 'GET'): HandlerEvent {
    return {
        httpMethod: method,
        queryStringParameters: params,
        headers: {},
        body: null,
    } as unknown as HandlerEvent;
}

/** A session that passes every check; each test breaks one thing. */
function paidSession(overrides: Record<string, unknown> = {}, subOverrides: Record<string, unknown> = {}) {
    return {
        id: SESSION_ID,
        mode: 'subscription',
        status: 'complete',
        payment_status: 'paid',
        customer_email: 'buyer@example.com',
        customer: 'cus_test_123',
        subscription: {
            id: 'sub_test_123',
            status: 'active',
            items: { data: [{ price: { lookup_key: 'founding_member_annual' } }] },
            ...subOverrides,
        },
        ...overrides,
    };
}

async function call(event: HandlerEvent) {
    const res = await handler(event, {} as never);
    if (!res) throw new Error('handler returned nothing');
    return { res, body: JSON.parse(res.body as string) };
}

function expectStandardHeaders(res: { headers?: Record<string, unknown> }) {
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(res.headers?.['Cache-Control']).toBe('no-store');
    expect(res.headers?.['Referrer-Policy']).toBe('no-referrer');
    expect(res.headers?.['X-Robots-Tag']).toBe('noindex');
}

describe('checkout-status.ts paid sessions', () => {
    it('returns the invite for a paid session with an active subscription', async () => {
        retrieve.mockResolvedValue(paidSession());
        const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(res.statusCode).toBe(200);
        expect(body).toEqual({ paid: true, slackInviteUrl: INVITE });
        expect(retrieve).toHaveBeenCalledWith(SESSION_ID, { expand: ['subscription'] });
        expectStandardHeaders(res);
    });

    it('returns the invite for a trialing subscription', async () => {
        retrieve.mockResolvedValue(paidSession({}, { status: 'trialing' }));
        const { body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(body).toEqual({ paid: true, slackInviteUrl: INVITE });
    });

    it('returns paid with a null invite once the invite has expired', async () => {
        process.env.SLACK_INVITE_EXPIRES_AT = '2000-01-01';
        retrieve.mockResolvedValue(paidSession());
        const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(body).toEqual({ paid: true, slackInviteUrl: null });
        expectStandardHeaders(res);
    });

    it('returns paid with a null invite when no invite is configured', async () => {
        delete process.env.SLACK_INVITE_URL;
        retrieve.mockResolvedValue(paidSession());
        const { body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(body).toEqual({ paid: true, slackInviteUrl: null });
    });

    it('never echoes anything else from the session', async () => {
        retrieve.mockResolvedValue(paidSession());
        const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(Object.keys(body).sort()).toEqual(['paid', 'slackInviteUrl']);
        expect(res.body).not.toContain('buyer@example.com');
        expect(res.body).not.toContain('cus_test_123');
        expect(res.body).not.toContain(SESSION_ID);
    });
});

describe('checkout-status.ts sessions that are not a paid membership', () => {
    const cases: Array<[string, ReturnType<typeof paidSession>]> = [
        ['payment_status unpaid', paidSession({ payment_status: 'unpaid' })],
        ['status open', paidSession({ status: 'open' })],
        ['subscription canceled', paidSession({}, { status: 'canceled' })],
        ['subscription incomplete', paidSession({}, { status: 'incomplete' })],
        ['mode payment', paidSession({ mode: 'payment' })],
        ['subscription not expanded', paidSession({ subscription: 'sub_test_123' })],
        [
            'a price that is not a published plan',
            paidSession({}, { items: { data: [{ price: { lookup_key: 'warm_lead_annual' } }] } }),
        ],
    ];

    for (const [name, session] of cases) {
        it(`returns paid: false for ${name}`, async () => {
            retrieve.mockResolvedValue(session);
            const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
            expect(res.statusCode).toBe(200);
            expect(body).toEqual({ paid: false });
            expectStandardHeaders(res);
        });
    }
});

describe('checkout-status.ts request handling', () => {
    it('rejects a malformed session_id without calling Stripe', async () => {
        for (const bad of [
            'cs_test_short',
            'pi_test_a1B2c3D4e5F6g7H8i9J0',
            'cs_test_a1B2c3D4e5/../../x',
            'cs_prod_a1B2c3D4e5F6g7H8i9J0',
            `cs_live_${'a'.repeat(201)}`,
        ]) {
            const { res, body } = await call(makeEvent({ session_id: bad }));
            expect(body, bad).toEqual({ paid: false });
            expectStandardHeaders(res);
        }
        expect(retrieve).not.toHaveBeenCalled();
    });

    it('returns paid: false when session_id is missing', async () => {
        for (const event of [makeEvent({}), makeEvent(null)]) {
            const { res, body } = await call(event);
            expect(body).toEqual({ paid: false });
            expectStandardHeaders(res);
        }
        expect(retrieve).not.toHaveBeenCalled();
    });

    it('returns paid: false when Stripe cannot find the session', async () => {
        const err = Object.assign(new Error(`No such checkout.session: '${SESSION_ID}'`), {
            type: 'StripeInvalidRequestError',
            code: 'resource_missing',
        });
        retrieve.mockRejectedValue(err);
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(body).toEqual({ paid: false });
        expectStandardHeaders(res);
        // The log names the error type but never the session id.
        expect(log).toHaveBeenCalled();
        expect(JSON.stringify(log.mock.calls)).not.toContain(SESSION_ID);
        log.mockRestore();
    });

    it('returns paid: false without detail when the Stripe key is missing', async () => {
        delete process.env.STRIPE_SECRET_KEY;
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { res, body } = await call(makeEvent({ session_id: SESSION_ID }));
        expect(body).toEqual({ paid: false });
        expect(res.body).not.toMatch(/STRIPE/);
        expectStandardHeaders(res);
        expect(retrieve).not.toHaveBeenCalled();
        log.mockRestore();
    });

    it('rejects non-GET requests with 405', async () => {
        for (const method of ['POST', 'PUT', 'DELETE']) {
            const { res } = await call(makeEvent({ session_id: SESSION_ID }, method));
            expect(res.statusCode).toBe(405);
            expectStandardHeaders(res);
        }
        expect(retrieve).not.toHaveBeenCalled();
    });
});
