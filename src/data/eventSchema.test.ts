import { describe, expect, it } from 'vitest';
import { eventSchemas, graphFor, placeFromLocation, type EventRecord } from './structuredData';
import { isoToChicagoOffsetIso } from '../lib/chicagoTime';
import eventsData from './events.json';

/** IFN-116. Fixtures mirror the two shapes events.json actually holds. */
const VOL_12: EventRecord = {
    id: 'evt-l959CqFvTtfgIs6',
    title: 'Austin International Founders Meetup (Vol. 12)',
    start_at: '2026-12-16T00:30:00.000Z',
    location_name: 'Station Austin, 701 Brazos St, Austin, TX 78701, USA',
    cover_url: 'https://images.lumacdn.com/uploads/ab/de221c8a-f284-418b-9302-4c308ce09ba7.png',
    registrations: [
        { platform: 'meetup', url: 'https://www.meetup.com/example/events/1/' },
        { platform: 'luma', url: 'https://lu.ma/vybxr9na' },
    ],
};

const MEETUP_STYLE: EventRecord = {
    id: '317284963',
    title: 'Austin International Founders Meetup (Vol. 11) ',
    start_at: '2026-11-23T18:30:00-06:00',
    location_name: 'Austin, TX',
    cover_url: '',
    registrations: [{ platform: 'meetup', url: 'https://www.meetup.com/example/events/317284963/' }],
};

const NOV_25_2026 = Date.parse('2026-11-25T18:00:00Z');
const OFFSET_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
const DASHES = /[–—]/;

describe('eventSchemas (IFN-116)', () => {
    it('emits a complete Event for an upcoming Luma meetup', () => {
        const [event, ...rest] = eventSchemas([VOL_12], NOV_25_2026);
        expect(rest).toHaveLength(0);
        expect(event).toEqual({
            '@type': 'Event',
            '@id': 'https://ifn.community/events#event-evt-l959CqFvTtfgIs6',
            name: 'Austin International Founders Meetup (Vol. 12)',
            startDate: '2026-12-15T18:30:00-06:00',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
                '@type': 'Place',
                name: 'Station Austin',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '701 Brazos St',
                    addressLocality: 'Austin',
                    addressRegion: 'TX',
                    postalCode: '78701',
                    addressCountry: 'US',
                },
            },
            image: VOL_12.cover_url,
            url: 'https://lu.ma/vybxr9na',
            organizer: {
                '@type': 'Organization',
                '@id': 'https://ifn.community/#organization',
                name: 'International Founders Network',
                url: 'https://ifn.community/',
            },
        });
    });

    it('never invents an end time, offers or a description', () => {
        const [event] = eventSchemas([VOL_12], NOV_25_2026);
        expect(event).not.toHaveProperty('endDate');
        expect(event).not.toHaveProperty('offers');
        expect(event).not.toHaveProperty('description');
    });

    it('emits endDate only when the record has one', () => {
        const [event] = eventSchemas([{ ...VOL_12, end_at: '2026-12-16T02:30:00.000Z' }], NOV_25_2026);
        expect(event.endDate).toBe('2026-12-15T20:30:00-06:00');
    });

    it('writes dates as Chicago wall time with the offset for that date', () => {
        expect(isoToChicagoOffsetIso('2026-12-16T00:30:00.000Z')).toBe('2026-12-15T18:30:00-06:00');
        expect(isoToChicagoOffsetIso('2027-06-17T23:30:00.000Z')).toBe('2027-06-17T18:30:00-05:00');
        expect(isoToChicagoOffsetIso('not a date')).toBeNull();

        const [summer] = eventSchemas([{ ...VOL_12, start_at: '2027-06-17T23:30:00.000Z' }], NOV_25_2026);
        expect(summer.startDate).toMatch(OFFSET_ISO);
        expect(summer.startDate).toBe('2027-06-17T18:30:00-05:00');
    });

    it('excludes meetups that have already started', () => {
        expect(eventSchemas([MEETUP_STYLE, VOL_12], NOV_25_2026).map((e) => e.name)).toEqual([
            'Austin International Founders Meetup (Vol. 12)',
        ]);
        expect(eventSchemas([VOL_12], Date.parse('2026-12-16T00:30:00.001Z'))).toEqual([]);
    });

    it('sorts soonest first and trims titles', () => {
        const later = { ...VOL_12, id: 'b', start_at: '2027-01-20T00:30:00.000Z' };
        const sooner = { ...MEETUP_STYLE, start_at: '2026-12-01T18:30:00-06:00' };
        const names = eventSchemas([later, sooner], NOV_25_2026).map((e) => e.name);
        expect(names).toEqual([
            'Austin International Founders Meetup (Vol. 11)',
            'Austin International Founders Meetup (Vol. 12)',
        ]);
    });

    it('degrades to city and state for a bare "Austin, TX" location', () => {
        const [event] = eventSchemas([{ ...MEETUP_STYLE, start_at: '2026-12-01T18:30:00-06:00' }], NOV_25_2026);
        expect(event.location).toEqual({
            '@type': 'Place',
            name: 'Austin, TX',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Austin',
                addressRegion: 'TX',
                addressCountry: 'US',
            },
        });
        // No cover image, and the only registration is Meetup.
        expect(event).not.toHaveProperty('image');
        expect(event.url).toBe('https://www.meetup.com/example/events/317284963/');
    });

    it('keeps an unparseable location as text rather than guessing fields', () => {
        expect(placeFromLocation('Online')).toEqual({ '@type': 'Place', name: 'Online', address: 'Online' });
    });

    it('skips a record with no location, no title or no usable start', () => {
        const records: EventRecord[] = [
            { ...VOL_12, location_name: '' },
            { ...VOL_12, location_name: undefined },
            { ...VOL_12, title: '  ' },
            { ...VOL_12, start_at: 'TBD' },
        ];
        expect(eventSchemas(records, NOV_25_2026)).toEqual([]);
    });

    it('omits url when no registration has a link', () => {
        const [event] = eventSchemas([{ ...VOL_12, registrations: [{}] }], NOV_25_2026);
        expect(event).not.toHaveProperty('url');
    });

    it('adds no en or em dash of its own', () => {
        const json = JSON.stringify(eventSchemas([VOL_12, { ...MEETUP_STYLE, start_at: '2026-12-01T18:30:00-06:00' }], NOV_25_2026));
        expect(json).not.toMatch(DASHES);
    });
});

describe('graphFor /events (IFN-116)', () => {
    it('adds the events.json Event nodes to the /events graph only', () => {
        const now = NOV_25_2026;
        const events = graphFor('/events', [], now)['@graph'].filter((n) => n['@type'] === 'Event');
        expect(events).toEqual(eventSchemas(eventsData, now));
        expect(graphFor('/', [], now)['@graph'].some((n) => n['@type'] === 'Event')).toBe(false);
        expect(graphFor('/about', [], now)['@graph'].some((n) => n['@type'] === 'Event')).toBe(false);
    });

    it('serialises to valid JSON with one graph', () => {
        const parsed = JSON.parse(JSON.stringify(graphFor('/events/', [], NOV_25_2026)));
        expect(parsed['@context']).toBe('https://schema.org');
        expect(Array.isArray(parsed['@graph'])).toBe(true);
        for (const node of parsed['@graph'].filter((n: { '@type': string }) => n['@type'] === 'Event')) {
            expect(node.startDate).toMatch(OFFSET_ISO);
            expect(node.location['@type']).toBe('Place');
            expect(node.organizer['@id']).toBe('https://ifn.community/#organization');
        }
    });
});
