import { describe, it, expect, beforeAll } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from './event-signup';

beforeAll(() => {
    process.env.NETLIFY_DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
});

function makeEvent(body: unknown, method = 'POST'): HandlerEvent {
    return { httpMethod: method, body: JSON.stringify(body), headers: {} } as unknown as HandlerEvent;
}

describe('event-signup.ts validation (see openspec/specs/events-hub)', () => {
    it('rejects non-POST requests', async () => {
        const res = await handler(makeEvent({}, 'GET'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('rejects a submission missing an email', async () => {
        const res = await handler(makeEvent({}), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a submission with an invalid email format', async () => {
        const res = await handler(makeEvent({ email: 'not-an-email' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });
});
