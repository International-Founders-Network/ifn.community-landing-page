import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import eventsData from './events.json';

/**
 * IFN-116: the Event markup must be in the static HTML crawlers fetch, not
 * only in the client-side graph. Reads the prerendered file, so it runs after
 * `npm run build` (CI builds before it tests) and is skipped on a checkout
 * with no dist/. scripts/prerender.mjs makes the same check at build time.
 */
const EVENTS_HTML = resolve(__dirname, '../../dist/events.html');

describe.skipIf(!existsSync(EVENTS_HTML))('prerendered /events (IFN-116)', () => {
    const html = existsSync(EVENTS_HTML) ? readFileSync(EVENTS_HTML, 'utf8') : '';
    const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];

    it('has exactly one JSON-LD script', () => {
        expect(scripts).toHaveLength(1);
    });

    it('carries an Event node for every meetup still ahead', () => {
        const graph = JSON.parse(scripts[0][1]);
        const ids = graph['@graph']
            .filter((node: { '@type': string }) => node['@type'] === 'Event')
            .map((node: { '@id': string }) => node['@id']);

        // Built before this ran, so anything still ahead now was ahead then.
        const ahead = eventsData
            .filter((event) => Date.parse(event.start_at) > Date.now() && event.location_name.trim())
            .map((event) => `https://ifn.community/events#event-${event.id}`);
        for (const id of ahead) expect(ids).toContain(id);

        const known = new Set(eventsData.map((event) => `https://ifn.community/events#event-${event.id}`));
        for (const id of ids) expect(known.has(id)).toBe(true);
    });
});
