import { describe, it, expect, beforeAll } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from './join';

beforeAll(() => {
    process.env.NETLIFY_DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
});

function makeEvent(body: unknown, method = 'POST'): HandlerEvent {
    return { httpMethod: method, body: JSON.stringify(body), headers: {} } as unknown as HandlerEvent;
}

function makeRawEvent(body: string, method = 'POST'): HandlerEvent {
    return { httpMethod: method, body, headers: {} } as unknown as HandlerEvent;
}

// Every case here must return before the first SQL call — these tests never
// open a database connection.
describe('join.ts validation', () => {
    it('rejects non-POST requests', async () => {
        const res = await handler(makeEvent({}, 'GET'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('rejects a body that is not valid JSON', async () => {
        const res = await handler(makeRawEvent('{ not json'), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a submission with no name', async () => {
        const res = await handler(makeEvent({ email: 'jane@example.com' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a submission with no email', async () => {
        const res = await handler(makeEvent({ name: 'Jane' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('treats a whitespace-only name as missing', async () => {
        const res = await handler(makeEvent({ name: '   ', email: 'jane@example.com' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects a submission with an invalid email format', async () => {
        const res = await handler(makeEvent({ name: 'Jane', email: 'not-an-email' }), {} as never);
        expect(res?.statusCode).toBe(400);
    });

    it('rejects an over-long name', async () => {
        const res = await handler(
            makeEvent({ name: 'a'.repeat(121), email: 'jane@example.com' }),
            {} as never
        );
        expect(res?.statusCode).toBe(400);
    });

    it('rejects an over-long LinkedIn value', async () => {
        const res = await handler(
            makeEvent({ name: 'Jane', email: 'jane@example.com', linkedin: 'a'.repeat(501) }),
            {} as never
        );
        expect(res?.statusCode).toBe(400);
    });

    it('returns a structured JSON error the client can display', async () => {
        const res = await handler(makeEvent({ name: 'Jane' }), {} as never);
        expect(res?.headers?.['Content-Type']).toBe('application/json');
        expect(JSON.parse(res!.body as string).error).toEqual(expect.any(String));
    });
});
