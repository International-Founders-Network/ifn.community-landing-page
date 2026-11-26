import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    isIfnWorkshop,
    runCalendarJobs,
    toMeetupRecord,
    toWorkshopRecords,
} from '../../scripts/lib/luma-records.js';

/**
 * The Luma sync (scripts/update-events.js). Entries mirror the shape of
 * lu.ma/claudeworkshops calendar items as fetched on Nov 25, 2026.
 */
const IFN_TITLE = 'Claude SMB Workshop with International Founders Network - Austin';
const COVER = 'https://images.lumacdn.com/uploads/dv/29073328-6cfd-4455-8c68-cd57dcafd7f2.jpg';

const IFN_HOST = { api_id: 'usr-8gxHhjHqtCy7lLP', name: 'IFN Community' };

function entry(event: Record<string, unknown>, hosts: { api_id: string; name: string }[]) {
    return {
        api_id: `calev-${String(event.api_id)}`,
        event: {
            timezone: 'America/Chicago',
            cover_url: COVER,
            geo_address_info: { mode: 'obfuscated' },
            ...event,
        },
        hosts,
    };
}

const DEC_3 = entry(
    {
        api_id: 'evt-cgHLpg8sSDms4cH',
        url: 'awlxti59',
        name: IFN_TITLE,
        start_at: '2026-12-03T20:00:00.000Z',
        end_at: '2026-12-03T23:00:00.000Z',
    },
    [IFN_HOST],
);

const DEC_17 = entry(
    {
        api_id: 'evt-h19tj8hBUCMXlbz',
        url: 'lx5nu5r6',
        name: IFN_TITLE,
        start_at: '2026-12-17T20:00:00.000Z',
        end_at: '2026-12-17T23:00:00.000Z',
    },
    [IFN_HOST],
);

/** Another host's workshop on the same global calendar, also in Austin. */
const GLOBAL_AUSTIN = entry(
    {
        api_id: 'evt-0Z7KnnnukwZgp4D',
        url: 'claude-austin-other',
        name: 'Claude SMB Workshop - Austin',
        start_at: '2026-12-01T18:00:00.000Z',
        end_at: '2026-12-01T21:00:00.000Z',
        geo_address_info: {
            mode: 'shown',
            full_address: '123 Congress Ave, Austin, TX 78701, USA',
        },
    },
    [{ api_id: 'usr-otherHost000001', name: 'Paul Robert Zonfrillo' }],
);

describe('isIfnWorkshop', () => {
    it('keeps workshops hosted by the IFN Community Luma account', () => {
        expect(isIfnWorkshop(DEC_3)).toBe(true);
        // A co-host alongside IFN does not drop it, nor does a retitle.
        const cohosted = entry({ ...DEC_3.event, name: 'Claude SMB Workshop - Austin' }, [
            { api_id: 'usr-trainer0000001', name: 'Approved Claude SMB Trainer' },
            IFN_HOST,
        ]);
        expect(isIfnWorkshop(cohosted)).toBe(true);
    });

    it('drops another host\'s workshop on the same calendar, even in Austin', () => {
        expect(isIfnWorkshop(GLOBAL_AUSTIN)).toBe(false);
        expect(isIfnWorkshop({ hosts: [IFN_HOST] })).toBe(false);
    });

    it('is not fooled by a host display name or a title another host can type', () => {
        const spoofedHostName = entry({ ...GLOBAL_AUSTIN.event }, [{ api_id: 'usr-impostor000001', name: 'IFN Community' }]);
        const spoofedTitle = entry({ ...GLOBAL_AUSTIN.event, name: IFN_TITLE }, [
            { api_id: 'usr-impostor000001', name: 'Someone else' },
        ]);
        expect(isIfnWorkshop(spoofedHostName)).toBe(false);
        expect(isIfnWorkshop(spoofedTitle)).toBe(false);
        expect(toWorkshopRecords([spoofedHostName, spoofedTitle, GLOBAL_AUSTIN])).toEqual([]);
    });
});

describe('toWorkshopRecords', () => {
    it('writes only IFN events, soonest first, one per Luma id, in the EventCard shape', () => {
        const records = toWorkshopRecords([DEC_17, GLOBAL_AUSTIN, DEC_3, DEC_17]);
        expect(records).toEqual([
            {
                id: 'evt-cgHLpg8sSDms4cH',
                slug: 'awlxti59',
                title: IFN_TITLE,
                start_at: '2026-12-03T20:00:00.000Z',
                end_at: '2026-12-03T23:00:00.000Z',
                timezone: 'America/Chicago',
                cover_url: COVER,
                host: 'IFN Community',
                registrations: [{ platform: 'luma', url: 'https://lu.ma/awlxti59' }],
            },
            {
                id: 'evt-h19tj8hBUCMXlbz',
                slug: 'lx5nu5r6',
                title: IFN_TITLE,
                start_at: '2026-12-17T20:00:00.000Z',
                end_at: '2026-12-17T23:00:00.000Z',
                timezone: 'America/Chicago',
                cover_url: COVER,
                host: 'IFN Community',
                registrations: [{ platform: 'luma', url: 'https://lu.ma/lx5nu5r6' }],
            },
        ]);
    });

    it('leaves location_name off for a guests-only address and keeps a published one', () => {
        expect(toWorkshopRecords([DEC_3])[0]).not.toHaveProperty('location_name');
        const shown = entry(
            {
                ...DEC_3.event,
                geo_address_info: { mode: 'shown', full_address: '500 Example St, Austin, TX 78701, USA' },
            },
            [IFN_HOST],
        );
        expect(toWorkshopRecords([shown])[0].location_name).toBe('500 Example St, Austin, TX 78701, USA');
    });

    it('keeps only a Luma CDN cover', () => {
        const offsite = entry({ ...DEC_3.event, cover_url: 'https://example.com/poster.jpg' }, [IFN_HOST]);
        expect(toWorkshopRecords([offsite])[0].cover_url).toBe('');
    });

    it('returns nothing when the calendar has no IFN workshop', () => {
        expect(toWorkshopRecords([GLOBAL_AUSTIN])).toEqual([]);
    });
});

describe('toMeetupRecord keeps the events.json shape', () => {
    it('maps an IFN_ATX entry to exactly the fields events.json has always had', () => {
        const record = toMeetupRecord({
            event: {
                api_id: 'evt-l959CqFvTtfgIs6',
                name: 'Austin International Founders Meetup (Vol. 12)',
                start_at: '2026-12-16T00:30:00.000Z',
                end_at: '2026-12-16T03:00:00.000Z',
                timezone: 'America/Chicago',
                url: 'vybxr9na',
                cover_url: 'https://images.lumacdn.com/uploads/ab/de221c8a-f284-418b-9302-4c308ce09ba7.png',
                geo_address_info: { full_address: 'Capital Factory, 701 Brazos St, Austin, TX 78701, USA' },
            },
            hosts: [{ name: 'IFN Community' }],
        });
        expect(record).toEqual({
            id: 'evt-l959CqFvTtfgIs6',
            title: 'Austin International Founders Meetup (Vol. 12)',
            start_at: '2026-12-16T00:30:00.000Z',
            // The Station Austin correction is applied after this, in update-events.js.
            location_name: 'Capital Factory, 701 Brazos St, Austin, TX 78701, USA',
            url: 'https://lu.ma/vybxr9na',
            cover_url: 'https://images.lumacdn.com/uploads/ab/de221c8a-f284-418b-9302-4c308ce09ba7.png',
            platform: 'luma',
            raw_date: '2026-12-16T00:30:00.000Z',
        });
    });
});

describe('runCalendarJobs isolates the two calendars', () => {
    const quiet = { log: () => {}, error: () => {} };

    function setup() {
        const dir = mkdtempSync(join(tmpdir(), 'luma-sync-'));
        const events = join(dir, 'events.json');
        const workshops = join(dir, 'workshops.json');
        writeFileSync(events, '["previous meetups"]');
        writeFileSync(workshops, '["previous workshops"]');
        return { events, workshops };
    }

    function meetupsJob(outputFile: string, scrape: () => Promise<unknown[]>) {
        return { name: 'meetups', url: 'https://lu.ma/IFN_ATX', outputFile, allowEmpty: false, scrape, toRecords: (items: unknown[]) => items };
    }

    function workshopsJob(outputFile: string, scrape: () => Promise<unknown[]>) {
        return { name: 'workshops', url: 'https://luma.com/claudeworkshops', outputFile, allowEmpty: true, scrape, toRecords: toWorkshopRecords };
    }

    it('a failed workshops scrape leaves workshops.json untouched and meetups still write', async () => {
        const { events, workshops } = setup();
        const results = await runCalendarJobs(
            [
                meetupsJob(events, async () => [{ id: 'm1' }]),
                workshopsJob(workshops, async () => {
                    throw new Error('get-items answered 500 on page 3');
                }),
            ],
            { log: quiet },
        );
        expect(results.map((r) => [r.name, r.ok])).toEqual([['meetups', true], ['workshops', false]]);
        expect(JSON.parse(readFileSync(events, 'utf8'))).toEqual([{ id: 'm1' }]);
        expect(readFileSync(workshops, 'utf8')).toBe('["previous workshops"]');
    });

    it('a failed meetups scrape leaves events.json untouched and workshops still write', async () => {
        const { events, workshops } = setup();
        const results = await runCalendarJobs(
            [
                meetupsJob(events, async () => {
                    throw new Error('No __NEXT_DATA__ on the calendar page');
                }),
                workshopsJob(workshops, async () => [GLOBAL_AUSTIN, DEC_3]),
            ],
            { log: quiet },
        );
        expect(results.map((r) => r.ok)).toEqual([false, true]);
        expect(readFileSync(events, 'utf8')).toBe('["previous meetups"]');
        expect(JSON.parse(readFileSync(workshops, 'utf8')).map((w: { slug: string }) => w.slug)).toEqual(['awlxti59']);
    });

    it('never writes an empty meetup list, but does write an empty workshop list', async () => {
        const { events, workshops } = setup();
        await runCalendarJobs(
            [meetupsJob(events, async () => []), workshopsJob(workshops, async () => [GLOBAL_AUSTIN])],
            { log: quiet },
        );
        expect(readFileSync(events, 'utf8')).toBe('["previous meetups"]');
        expect(JSON.parse(readFileSync(workshops, 'utf8'))).toEqual([]);
    });
});

describe('scripts/sync-all.js', () => {
    it('re-runs only the meetup calendar, so it cannot rewrite workshops.json', () => {
        const source = readFileSync(resolve(__dirname, '../../scripts/sync-all.js'), 'utf8');
        expect(source).toContain("execSync('node scripts/update-events.js --only=meetups'");
        expect(source).not.toMatch(/claudeworkshops|--only=workshops|readFileSync\(.*workshops/);
    });
});
