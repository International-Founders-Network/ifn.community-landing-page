import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { load } from 'cheerio';
import type { ReactElement } from 'react';
import { Workshops } from './Workshops';
import { Events } from './Events';
import { EventsPreview } from '../components/EventsPreview';
import { SYNCED_WORKSHOPS, upcomingWorkshops, withImageOverride, type Workshop } from '../data/workshopsData';
import { WORKSHOP_IMAGE_OVERRIDES } from '../data/workshop-image-overrides';
import { seoFor } from '../data/seo';
import { graphFor } from '../data/structuredData';
import { LUMA_CALENDAR_URL, SOCIAL_LINKS } from '../data/socialLinks';
import eventsData from '../data/events.json';

/**
 * /workshops lists IFN's Claude workshops synced from Luma into
 * src/data/workshops.json, rendered with the meetup EventCard.
 *
 * The page tests render from DEC_WORKSHOPS, a verbatim copy of the two records
 * the local sync wrote on Nov 25, 2026, mocked in as workshops.json. The real
 * file is rewritten by the Sync Events workflow and drops events once they are
 * over, so rendering it directly would break these tests after December.
 * The committed file itself is checked separately below.
 */
const { DEC_WORKSHOPS } = vi.hoisted(() => {
    const COVER = 'https://images.lumacdn.com/uploads/dv/29073328-6cfd-4455-8c68-cd57dcafd7f2.jpg';
    const TITLE = 'Claude SMB Workshop with International Founders Network - Austin';
    return {
        DEC_WORKSHOPS: [
            {
                id: 'evt-cgHLpg8sSDms4cH',
                slug: 'awlxti59',
                title: TITLE,
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
                title: TITLE,
                start_at: '2026-12-17T20:00:00.000Z',
                end_at: '2026-12-17T23:00:00.000Z',
                timezone: 'America/Chicago',
                cover_url: COVER,
                host: 'IFN Community',
                registrations: [{ platform: 'luma', url: 'https://lu.ma/lx5nu5r6' }],
            },
        ],
    };
});

vi.mock('../data/workshops.json', () => ({ default: DEC_WORKSHOPS }));

const TITLE = 'Claude SMB Workshop with International Founders Network - Austin';
const COVER = 'https://images.lumacdn.com/uploads/dv/29073328-6cfd-4455-8c68-cd57dcafd7f2.jpg';
const DEC_3_HREF = 'https://lu.ma/awlxti59';
const DEC_17_HREF = 'https://lu.ma/lx5nu5r6';

const BEFORE_DEC_3 = new Date('2026-11-25T21:00:00-06:00');
const DURING_DEC_3 = new Date('2026-12-03T15:30:00-06:00');
const AFTER_DEC_3_END = new Date('2026-12-03T17:00:01-06:00');
const AFTER_DEC_17_END = new Date('2026-12-17T17:00:01-06:00');

function render(element: ReactElement, path = '/') {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
    const $ = load(html);
    const text = $.root().text().replace(/\s+/g, ' ');
    return { $, text };
}

function at(now: Date) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
}

afterEach(() => {
    vi.useRealTimers();
    for (const key of Object.keys(WORKSHOP_IMAGE_OVERRIDES)) delete WORKSHOP_IMAGE_OVERRIDES[key];
});

/** The Upcoming block on /workshops: everything inside its rounded panel. */
function upcoming($: ReturnType<typeof load>) {
    return $('#upcoming-workshops').parent();
}

function registerLinks($: ReturnType<typeof load>) {
    return upcoming($)
        .find('a')
        .filter((_, a) => $(a).text().replace(/\s+/g, ' ').trim().startsWith('Register on Luma'))
        .map((_, a) => $(a).attr('href'))
        .get();
}

function covers($: ReturnType<typeof load>) {
    return upcoming($)
        .find('img')
        .map((_, img) => $(img).attr('src'))
        .get();
}

const HERO_LINE = 'One problem per session, for international founders in Austin.';

const HOST_LINE =
    'IFN runs most sessions. To propose a practical 60 to 90 minute session, tell us the pillar, the problem you solve, and whether it is free, paid, or members-preferred.';

const MEMBERS_LINE =
    'When a session has a member price, it is listed on its Luma page. Members also get the private member channel and the monthly members-only call.';

const DISCLAIMER =
    'This is not licensed legal, tax, or immigration advice. Bring your situation. Leave with next steps and people who have done it.';

/** The hand-written v1 card copy. None of it may come back. */
const OLD_CARD_COPY = [
    'Buried in admin again this week?',
    'Behind on marketing and month end?',
    'Run the week. A free, hands-on Claude workshop for business owners.',
    'Grow and close. A free, hands-on Claude workshop for business owners.',
    '7820 Burnet Rd',
    'Free. In person. Bring your laptop. Registration needs host approval.',
    'One free month of Claude Max',
    'Yani Partners',
    'Two free, hands-on Claude workshops in Austin this December. RSVP on each Luma page.',
    'RSVP on Luma ',
];

const STALE = [
    'Price on Luma',
    'Price is set per workshop on Luma',
    'RSVP and pay',
    'Dates, prices, and seats live on Luma',
    'See upcoming on Luma',
    'Browse workshops on Luma',
    'See the December workshops',
    'Two free Claude workshops are scheduled in Austin this December',
    'The December Claude workshops are free',
    'this December',
    'in December',
];

const HOME_MENTION = ['Workshops are also scheduled in Austin.', 'See dates and RSVP on the workshops page.'];
const EVENTS_MENTION = 'Workshops are also scheduled. See dates on the workshops page.';

describe('/workshops renders the synced Luma workshops', () => {
    it('shows both Dec events with the Luma title, CT date and time, Luma cover, and own Luma link', () => {
        at(BEFORE_DEC_3);
        const { $ } = render(<Workshops />, '/workshops');
        const block = upcoming($);
        const text = block.text().replace(/\s+/g, ' ');

        expect(block.find('h3').map((_, h) => $(h).text().trim()).get()).toEqual([TITLE, TITLE]);
        expect(text).toContain('Thu, Dec 3, 2026');
        expect(text).toContain('Thu, Dec 17, 2026');
        expect(text.match(/2:00 PM CST/g)).toHaveLength(2);
        expect(block.find('time').map((_, t) => $(t).attr('datetime')).get()).toEqual([
            '2026-12-03T20:00:00.000Z',
            '2026-12-17T20:00:00.000Z',
        ]);
        expect(covers($)).toEqual([COVER, COVER]);
        expect(registerLinks($)).toEqual([DEC_3_HREF, DEC_17_HREF]);
    });

    it('uses the concise hero and section order, with no How it works block', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<Workshops />, '/workshops');
        expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe('Workshops');
        expect(text).toContain(HERO_LINE);
        expect(text).not.toContain('Skill and ops track');
        expect(text).not.toContain('How it works');
        expect(text).not.toContain('See the December workshops');
        expect($('a').filter((_, a) => $(a).text().trim() === 'See the December workshops')).toHaveLength(0);
        expect($('#upcoming-workshops').text().trim()).toBe('Upcoming workshops');
        expect($('a').filter((_, a) => $(a).text().trim() === 'Become a member').length).toBeGreaterThan(0);

        const headings = $('h1, h2')
            .map((_, h) => $(h).text().replace(/\s+/g, ' ').trim())
            .get();
        expect(headings).toEqual([
            'Workshops',
            'Upcoming workshops',
            'What we cover',
            'Host a workshop',
            'Members get better workshop access',
        ]);
        expect(text).toContain(HOST_LINE);
        expect(text).toContain(MEMBERS_LINE);
        expect(text).toContain(DISCLAIMER);
        expect(text).toContain('Ops cadence for a 2 to 10 person company');
        expect(text).not.toContain('Seven pillars');
        expect(text).not.toContain('Pillar 01');
        expect(text).not.toContain('Workshop types');
    });

    it('has none of the hand-written card copy, the venue, or the stale price and pay lines', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<Workshops />, '/workshops');
        for (const line of [...OLD_CARD_COPY, ...STALE]) expect(text).not.toContain(line);
        expect($(`a[href="${LUMA_CALENDAR_URL}"]`)).toHaveLength(0);
        expect($('a[href*="IFN_ATX"]')).toHaveLength(0);
    });

    it('never shows the past-meetup state, even while a workshop is under way', () => {
        at(DURING_DEC_3);
        const { $ } = render(<Workshops />, '/workshops');
        const text = upcoming($).text();
        expect(registerLinks($)).toEqual([DEC_3_HREF, DEC_17_HREF]);
        expect(text).not.toContain('Past meetup');
        expect(text).not.toContain('View on Luma');
        expect(text.toLowerCase()).not.toContain('meetup');
    });

    it('keeps the pillars, host section, and membership teaser', () => {
        at(BEFORE_DEC_3);
        const { text } = render(<Workshops />, '/workshops');
        expect(text).toContain('What we cover');
        expect(text).toContain('Host a workshop');
        expect(text).toContain('Members get better workshop access');
    });
});

describe('auto-hide after each workshop ends', () => {
    it('hides Dec 3 at its exact Luma end_at, and still shows it one millisecond before', () => {
        at(new Date('2026-12-03T22:59:59.999Z'));
        expect(upcomingWorkshops().map((w) => w.slug)).toEqual(['awlxti59', 'lx5nu5r6']);
        at(new Date('2026-12-03T23:00:00.000Z'));
        expect(upcomingWorkshops().map((w) => w.slug)).toEqual(['lx5nu5r6']);
    });

    it('shows only Dec 17 between the Dec 3 end and the Dec 17 end', () => {
        at(AFTER_DEC_3_END);
        const { $ } = render(<Workshops />, '/workshops');
        expect(registerLinks($)).toEqual([DEC_17_HREF]);
        expect(upcoming($).text()).toContain('Thu, Dec 17, 2026');
        expect(upcoming($).text()).not.toContain('Thu, Dec 3, 2026');
    });

    it('leaves only the Upcoming workshops heading after both have ended', () => {
        at(AFTER_DEC_17_END);
        expect(upcomingWorkshops()).toHaveLength(0);
        const { $ } = render(<Workshops />, '/workshops');
        const block = upcoming($);
        expect(block.text().replace(/\s+/g, ' ').trim()).toBe('Upcoming workshops');
        expect(block.find('a')).toHaveLength(0);
        expect(block.find('img')).toHaveLength(0);
    });

    it('falls back to start_at when Luma gives no end_at', () => {
        const noEnd: Workshop = { ...DEC_WORKSHOPS[0], end_at: undefined } as Workshop;
        expect(upcomingWorkshops(new Date('2026-12-03T19:59:59.999Z'), [noEnd])).toHaveLength(1);
        expect(upcomingWorkshops(new Date('2026-12-03T20:00:00.000Z'), [noEnd])).toHaveLength(0);
    });

    it('sorts soonest first whatever order the file is in', () => {
        const reversed = [...SYNCED_WORKSHOPS].reverse();
        expect(upcomingWorkshops(BEFORE_DEC_3, reversed).map((w) => w.slug)).toEqual(['awlxti59', 'lx5nu5r6']);
    });
});

describe('poster override', () => {
    it('ships empty, so the Luma covers show', () => {
        expect(WORKSHOP_IMAGE_OVERRIDES).toEqual({});
    });

    it('replaces the cover for an event id entry and leaves the other card alone', () => {
        at(BEFORE_DEC_3);
        WORKSHOP_IMAGE_OVERRIDES['evt-cgHLpg8sSDms4cH'] = '/workshops/posters/2026-12-03.jpg';
        const { $ } = render(<Workshops />, '/workshops');
        expect(covers($)).toEqual(['/workshops/posters/2026-12-03.jpg', COVER]);
    });

    it('accepts the Luma slug as the key, and the event id wins over the slug', () => {
        const dec17 = SYNCED_WORKSHOPS[1];
        expect(withImageOverride(dec17, { lx5nu5r6: '/workshops/posters/b.jpg' }).cover_url).toBe(
            '/workshops/posters/b.jpg',
        );
        expect(
            withImageOverride(dec17, {
                lx5nu5r6: '/workshops/posters/slug.jpg',
                'evt-h19tj8hBUCMXlbz': '/workshops/posters/id.jpg',
            }).cover_url,
        ).toBe('/workshops/posters/id.jpg');
        expect(withImageOverride(dec17, {}).cover_url).toBe(COVER);
    });
});

describe('homepage and /events notes follow the synced data', () => {
    it('show while an IFN workshop is still upcoming, linking only "workshops page"', () => {
        for (const now of [BEFORE_DEC_3, AFTER_DEC_3_END]) {
            at(now);
            const home = render(<EventsPreview />);
            for (const line of HOME_MENTION) expect(home.text).toContain(line);
            expect(home.$('a[href="/workshops"]').text().trim()).toBe('workshops page');

            const events = render(<Events />, '/events');
            expect(events.text).toContain(EVENTS_MENTION);
            expect(events.$('a[href="/workshops"]').text().trim()).toBe('workshops page');
        }
    });

    it('hide once no synced workshop is upcoming', () => {
        at(AFTER_DEC_17_END);
        const home = render(<EventsPreview />).text;
        for (const line of HOME_MENTION) expect(home).not.toContain(line);
        expect(render(<Events />, '/events').text).not.toContain(EVENTS_MENTION);
    });

    it('hide before December too when workshops.json has no IFN workshop', () => {
        at(BEFORE_DEC_3);
        const saved = DEC_WORKSHOPS.splice(0, DEC_WORKSHOPS.length);
        try {
            expect(render(<EventsPreview />).text).not.toContain(HOME_MENTION[0]);
            expect(render(<Events />, '/events').text).not.toContain(EVENTS_MENTION);
            const { $ } = render(<Workshops />, '/workshops');
            expect(upcoming($).text().replace(/\s+/g, ' ').trim()).toBe('Upcoming workshops');
        } finally {
            DEC_WORKSHOPS.push(...saved);
        }
    });

    it('workshops are never meetup cards on /events or the homepage', () => {
        at(BEFORE_DEC_3);
        for (const { $ } of [render(<Events />, '/events'), render(<EventsPreview />)]) {
            for (const href of [DEC_3_HREF, DEC_17_HREF, 'https://luma.com/awlxti59', 'https://luma.com/lx5nu5r6']) {
                expect($(`a[href="${href}"]`)).toHaveLength(0);
            }
            expect($.root().text()).not.toContain(TITLE);
        }
    });
});

describe('the committed sync output', () => {
    const committed = JSON.parse(readFileSync(resolve(__dirname, '../data/workshops.json'), 'utf8')) as Workshop[];

    it('holds only IFN workshops, each with its own lu.ma link and no invented venue', () => {
        for (const workshop of committed) {
            expect(workshop.host === 'IFN Community' || workshop.title.includes('International Founders Network')).toBe(
                true,
            );
            expect(workshop.registrations).toEqual([{ platform: 'luma', url: `https://lu.ma/${workshop.slug}` }]);
            expect(JSON.stringify(workshop)).not.toContain('Burnet');
        }
    });

    // The sync only fetches future events, so after Dec 17 they leave the file.
    it.runIf(Date.now() < Date.parse('2026-12-17T23:00:00.000Z'))(
        'still has both Dec IFN events exactly as the page tests render them',
        () => {
            for (const expected of DEC_WORKSHOPS) {
                expect(committed.find((workshop) => workshop.id === expected.id)).toEqual(expected);
            }
        },
    );
});

describe('meta and meetup data that must not move', () => {
    it('keeps title option A and the approved description', () => {
        const seo = seoFor('/workshops');
        expect(seo.title).toBe('Workshops for international founders | IFN');
        expect(seo.description).toBe(
            'Practical workshops for international founders in Austin. One problem per session: visas, banking, hiring, fundraising, and more. Dates and RSVP on Luma.',
        );
    });

    it('leaves the meetup calendar constant on IFN_ATX', () => {
        expect(LUMA_CALENDAR_URL).toBe('https://lu.ma/IFN_ATX');
        expect(SOCIAL_LINKS.find((link) => link.id === 'luma')?.href).toBe('https://lu.ma/IFN_ATX');
    });

    it('keeps workshops out of events.json', () => {
        const raw = readFileSync(resolve(__dirname, '../data/events.json'), 'utf8');
        for (const needle of ['awlxti59', 'lx5nu5r6', 'evt-cgHLpg8sSDms4cH', 'evt-h19tj8hBUCMXlbz', 'claudeworkshops', 'Claude SMB Workshop']) {
            expect(raw).not.toContain(needle);
        }
        expect(eventsData.every((event) => /meetup/i.test(event.title))).toBe(true);
    });

    it('keeps workshops out of the /events Event JSON-LD', () => {
        const nodes = graphFor('/events', [], BEFORE_DEC_3.getTime())['@graph'];
        const events = nodes.filter((node) => node['@type'] === 'Event');
        expect(events.length).toBeGreaterThan(0);
        for (const node of events) {
            expect(String(node.name)).toMatch(/meetup/i);
            expect(JSON.stringify(node)).not.toMatch(/awlxti59|lx5nu5r6|Claude SMB Workshop/);
        }
        expect(JSON.stringify(graphFor('/workshops', [], BEFORE_DEC_3.getTime()))).not.toMatch(
            /"Event"|awlxti59|lx5nu5r6/,
        );
    });
});
