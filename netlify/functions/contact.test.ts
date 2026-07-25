import { describe, it, expect, beforeAll } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from './contact';

beforeAll(() => {
    process.env.NETLIFY_DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
});

function makeEvent(body: unknown, method = 'POST'): HandlerEvent {
    return { httpMethod: method, body: JSON.stringify(body), headers: {} } as unknown as HandlerEvent;
}

describe('contact.ts validation (see openspec/specs/contact-flow)', () => {
    it('rejects non-POST requests', async () => {
        const res = await handler(makeEvent({}, 'GET'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('rejects a submission missing required fields', async () => {
        const res = await handler(makeEvent({ name: 'Jane' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a submission with an invalid email format', async () => {
        const res = await handler(
            makeEvent({ name: 'Jane', email: 'not-an-email', message: 'hi' }),
            {} as never
        );
        expect(res?.statusCode).toBe(400);
    });
});
