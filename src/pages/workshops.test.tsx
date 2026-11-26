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
import { SCHEDULED_WORKSHOPS, upcomingWorkshops } from '../data/workshopsData';
import { seoFor } from '../data/seo';
import { LUMA_CALENDAR_URL, SOCIAL_LINKS } from '../data/socialLinks';
import eventsData from '../data/events.json';

/**
 * December 2026 Claude workshops preview. Every visible string below is copied
 * from ifn-copy/workshops/2026-11-25-dec-workshops-listing.md and must match
 * it exactly.
 */

const BEFORE_DEC_3 = new Date('2026-11-25T21:00:00-06:00');
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
});

const HERO = [
    'Meetups are the room. Membership is the private channel and member call. Workshops are where we dig into one problem for one session.',
    'Two free Claude workshops are scheduled in Austin this December. Dates and RSVP links are below. The rest of this page is the longer skill and ops track: visas, banking, housing, hiring, fundraising, US go-to-market, entity and tax.',
    'IFN hosts most sessions. Guest and member hosts are welcome when the topic is useful. The December Claude workshops are free. When another session has a price or a member offer, that is listed on its Luma page.',
];

const HOW_IT_WORKS = [
    'Pick a session. When a date is set, the topic, date, and host are on this page, and on Luma.',
    'RSVP on Luma. The December Claude workshops are free and need host approval.',
    'When a session offers a member price, that offer is listed on its Luma page.',
];

const LEAD_IN =
    'Two free, hands-on Claude workshops in Austin this December. RSVP on each Luma page. Registration needs host approval.';

const SHARED = [
    '7820 Burnet Rd, Austin, TX 78757',
    'Free. In person. Bring your laptop. Registration needs host approval.',
    'One free month of Claude Max for people new to Claude Max',
    'Hosted by International Founders Network and Approved Claude SMB Trainers, with Yani Partners as AI technology partner.',
    '2:00 to 5:00 PM CT',
];

const CARD_1 = [
    'Run the week. A free, hands-on Claude workshop for business owners.',
    'Buried in admin again this week?',
    'Thursday, December 3',
    'A free, in-person afternoon to put Claude on the weekly admin you still do by hand.',
    'Walk out with Claude set up for your business, connected to a tool you use, and a weekly routine on a schedule.',
];

const CARD_2 = [
    'Grow and close. A free, hands-on Claude workshop for business owners.',
    'Behind on marketing and month end?',
    'Thursday, December 17',
    'A free, in-person afternoon to put Claude on marketing and month end.',
    'Walk out with Claude set up for your business, your first skill built, and your numbers turned into a clear one-page view.',
];

const STALE = [
    'Price on Luma',
    'Price is set per workshop on Luma',
    'RSVP and pay',
    'Dates, prices, and seats live on Luma',
    'See upcoming on Luma',
    'Browse workshops on Luma',
];

const HOME_MENTION = ['Two free Claude workshops in Austin this December.', 'See dates and RSVP on the workshops page.'];
const EVENTS_MENTION = 'Two free Claude workshops are also scheduled in December. See dates on the workshops page.';

function rsvpLinks($: ReturnType<typeof load>) {
    return $('a')
        .filter((_, a) => $(a).text().replace(/\s+/g, ' ').startsWith('RSVP on Luma'))
        .map((_, a) => $(a).attr('href'))
        .get();
}

describe('/workshops copy', () => {
    it('renders the hero, how-it-works, lead-in, and both cards verbatim', () => {
        at(BEFORE_DEC_3);
        const { text } = render(<Workshops />, '/workshops');
        for (const line of [...HERO, ...HOW_IT_WORKS, LEAD_IN, ...SHARED, ...CARD_1, ...CARD_2]) {
            expect(text).toContain(line);
        }
    });

    it('shows Dec 3 before Dec 17 with a per-event RSVP link on each', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<Workshops />, '/workshops');
        expect(text.indexOf('Buried in admin again this week?')).toBeLessThan(
            text.indexOf('Behind on marketing and month end?'),
        );
        expect(rsvpLinks($)).toEqual(['https://luma.com/awlxti59', 'https://luma.com/lx5nu5r6']);
    });

    it('keeps Become a member and jumps the primary hero button to the Upcoming heading', () => {
        at(BEFORE_DEC_3);
        const { $ } = render(<Workshops />, '/workshops');
        const jump = $('a').filter((_, a) => $(a).text().trim() === 'See the December workshops');
        expect(jump).toHaveLength(1);
        expect(jump.attr('href')).toBe('/workshops#upcoming-workshops');
        expect($('#upcoming-workshops').text().trim()).toBe('Upcoming workshops');
        expect($('a').filter((_, a) => $(a).text().trim() === 'Become a member').length).toBeGreaterThan(0);
    });

    it('drops the stale price and calendar lines and never links the meetup calendar', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<Workshops />, '/workshops');
        for (const line of STALE) expect(text).not.toContain(line);
        expect($(`a[href="${LUMA_CALENDAR_URL}"]`)).toHaveLength(0);
    });

    it('does not use the official Luma title as a visible card title', () => {
        at(BEFORE_DEC_3);
        const { $ } = render(<Workshops />, '/workshops');
        const titles = $('article h3').map((_, h) => $(h).text().trim()).get();
        expect(titles).toEqual(['Buried in admin again this week?', 'Behind on marketing and month end?']);
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
    it('shows both cards and both mentions before Dec 3', () => {
        at(BEFORE_DEC_3);
        expect(upcomingWorkshops().map((w) => w.id)).toEqual(['claude-2026-12-03', 'claude-2026-12-17']);
        const { $, text } = render(<Workshops />, '/workshops');
        expect(rsvpLinks($)).toHaveLength(2);
        expect(text).toContain(LEAD_IN);
        expect(render(<EventsPreview />).text).toContain(HOME_MENTION[0]);
        expect(render(<Events />, '/events').text).toContain(EVENTS_MENTION);
    });

    it('still shows Dec 3 at its exact end time', () => {
        at(new Date('2026-12-03T23:00:00.000Z'));
        expect(upcomingWorkshops()).toHaveLength(1);
        at(new Date('2026-12-03T22:59:59.999Z'));
        expect(upcomingWorkshops()).toHaveLength(2);
    });

    it('shows only card 2 between the Dec 3 end and the Dec 17 end', () => {
        at(AFTER_DEC_3_END);
        const { $, text } = render(<Workshops />, '/workshops');
        expect(rsvpLinks($)).toEqual(['https://luma.com/lx5nu5r6']);
        expect(text).not.toContain('Buried in admin again this week?');
        expect(text).toContain('Behind on marketing and month end?');
        expect(render(<EventsPreview />).text).toContain(HOME_MENTION[0]);
        expect(render(<Events />, '/events').text).toContain(EVENTS_MENTION);
    });

    it('shows no cards, no lead-in, and no mentions after the Dec 17 end', () => {
        at(AFTER_DEC_17_END);
        expect(upcomingWorkshops()).toHaveLength(0);
        const { $, text } = render(<Workshops />, '/workshops');
        expect($('#upcoming-workshops').text().trim()).toBe('Upcoming workshops');
        expect(rsvpLinks($)).toHaveLength(0);
        expect(text).not.toContain(LEAD_IN);
        expect(text).not.toContain('Dates, prices, and seats live on Luma');
        expect(text).not.toContain('Browse workshops on Luma');

        const home = render(<EventsPreview />).text;
        for (const line of HOME_MENTION) expect(home).not.toContain(line);
        expect(render(<Events />, '/events').text).not.toContain(EVENTS_MENTION);
    });

    it('takes end times from data, not from the component', () => {
        expect(SCHEDULED_WORKSHOPS.map((w) => Date.parse(w.endsAt))).toEqual([
            Date.parse('2026-12-03T23:00:00.000Z'),
            Date.parse('2026-12-17T23:00:00.000Z'),
        ]);
    });
});

describe('homepage and /events mentions', () => {
    it('homepage note links only "workshops page" to /workshops', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<EventsPreview />);
        for (const line of HOME_MENTION) expect(text).toContain(line);
        const links = $('a[href="/workshops"]');
        expect(links).toHaveLength(1);
        expect(links.text().trim()).toBe('workshops page');
    });

    it('/events note links only "workshops page" to /workshops', () => {
        at(BEFORE_DEC_3);
        const { $, text } = render(<Events />, '/events');
        expect(text).toContain(EVENTS_MENTION);
        const links = $('a[href="/workshops"]');
        expect(links).toHaveLength(1);
        expect(links.text().trim()).toBe('workshops page');
    });

    it('workshops are not meetup cards on /events or the homepage', () => {
        at(BEFORE_DEC_3);
        for (const { $ } of [render(<Events />, '/events'), render(<EventsPreview />)]) {
            for (const workshop of SCHEDULED_WORKSHOPS) {
                expect($(`a[href="${workshop.rsvpUrl}"]`)).toHaveLength(0);
                expect($.root().text()).not.toContain(workshop.title);
            }
        }
    });
});

describe('meta and data that must not move', () => {
    it('keeps title option A and uses the new description', () => {
        const seo = seoFor('/workshops');
        expect(seo.title).toBe('Workshops for international founders | IFN');
        expect(seo.description).toBe(
            'Free Claude workshops in Austin on December 3 and 17. Hands-on sessions for business owners. RSVP on Luma.',
        );
    });

    it('leaves the meetup calendar constant on IFN_ATX', () => {
        expect(LUMA_CALENDAR_URL).toBe('https://lu.ma/IFN_ATX');
        expect(SOCIAL_LINKS.find((link) => link.id === 'luma')?.href).toBe('https://lu.ma/IFN_ATX');
    });

    it('does not add the workshops to events.json', () => {
        const raw = readFileSync(resolve(__dirname, '../data/events.json'), 'utf8');
        for (const needle of ['awlxti59', 'lx5nu5r6', 'claudeworkshops', 'Claude SMB Workshop']) {
            expect(raw).not.toContain(needle);
        }
        expect(eventsData.every((event) => /meetup/i.test(event.title))).toBe(true);
    });
});
