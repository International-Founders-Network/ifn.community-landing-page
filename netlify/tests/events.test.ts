import { describe, it, expect, beforeAll } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from '../functions/events';
import eventsData from '../../src/data/events.json';

beforeAll(() => {
    // A reserved, guaranteed-non-resolving host (RFC 2606) so the query fails fast and
    // deterministically, exercising the fallback path without depending on a real database.
    process.env.NETLIFY_DATABASE_URL = 'postgres://user:pass@invalid-host-for-tests.invalid/testdb';
});

describe('events.ts DB-error fallback (see openspec/specs/events-hub)', () => {
    it('falls back to the bundled dataset when the database is unreachable', async () => {
        const res = await handler({} as HandlerEvent, {} as never);
        expect(res?.statusCode).toBe(200);
        expect(JSON.parse(res!.body as string)).toEqual(eventsData);
    }, 15000);
});
