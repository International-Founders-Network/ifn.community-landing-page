import { describe, it, expect } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { handler } from '../functions/events';
import eventsData from '../../src/data/events.json';

describe('events.ts serves the bundled dataset (see openspec/specs/events-hub)', () => {
    it('returns src/data/events.json with no database configured', async () => {
        delete process.env.NETLIFY_DATABASE_URL;

        const res = await handler({} as HandlerEvent, {} as never);
        expect(res?.statusCode).toBe(200);
        expect(res?.headers?.['Content-Type']).toBe('application/json');
        expect(JSON.parse(res!.body as string)).toEqual(eventsData);
    });
});
