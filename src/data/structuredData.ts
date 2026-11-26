/**
 * SCHEMA.ORG JSON-LD.
 *
 * This is the machine-readable half of the site. Search engines use it for
 * knowledge-panel and rich-result eligibility; answer engines (ChatGPT search,
 * Perplexity, Claude, Google AI Overviews) use it because it is the one part of
 * a page whose meaning does not have to be inferred from prose.
 *
 * THE ONE RULE THAT GOVERNS EVERY FUNCTION BELOW: structured data must state
 * only what the rendered page also states. Marking up a fact the visitor cannot
 * see is a Google structured-data policy violation and risks a manual action,
 * which is a far worse outcome than having no markup at all. Every value here
 * is therefore sourced from the same constants the components render from, not
 * re-typed. Where a fact is not on the page, it is not in the graph.
 *
 * Event SCHEMA, AND WHY IT WAS ONCE ABSENT. src/data/events.json is
 * regenerated on the 1st and 15th of every month by .github/workflows/
 * sync-events.yml, which runs scripts/update-events.js. Luma used to say
 * "Capital Factory, 701 Brazos St" while every surface of this site said
 * Station Austin, so Event markup from that file would have published a venue
 * that contradicted the visible page. scripts/update-events.js now rewrites
 * the known stale venue strings to the Station Austin address on the way in,
 * and /events renders `location_name` from that same file, so the markup and
 * the page read the same value by construction. eventSchemas() below states
 * only fields the data carries: no invented end time, price or description.
 */

import {
    MEMBERSHIP_PRICE_STANDARD,
    MEMBERSHIP_TIER_NAME,
} from './membershipData';
import { SOCIAL_LINKS } from './socialLinks';
import { getPostBySlug } from './blog.generated';
import eventsData from './events.json';
import { SITE_NAME, SITE_URL, absoluteUrl, canonicalFor, normalisePath, seoFor } from './seo';
import { isoToChicagoOffsetIso } from '../lib/chicagoTime';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Only verified profiles go into `sameAs`. SOCIAL_LINKS carries a `verified`
 * flag precisely because two of its entries are unconfirmed guesses at IFN's
 * handle, and `sameAs` is an identity assertion: pointing it at an account IFN
 * may not own is how an unrelated profile gets merged into IFN's knowledge
 * graph entity. Filtering on the flag that already exists keeps that honest,
 * and means confirming a handle in socialLinks.ts is all it takes to add it.
 */
const verifiedProfiles = SOCIAL_LINKS.filter(
    (link) => link.verified && link.external,
).map((link) => link.href);

/**
 * The organisation. Emitted on every page, because `@id` lets every other node
 * in the graph reference one canonical definition rather than restating it.
 *
 * Typed as `Organization`, not `LocalBusiness`. LocalBusiness implies a place a
 * customer can visit during posted opening hours; IFN is a community that meets
 * monthly at a venue it does not own. Claiming LocalBusiness would invite a
 * Google Business Profile mismatch against Station Austin's own listing at the
 * same address.
 */
export function organizationSchema() {
    return {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: 'IFN',
        url: `${SITE_URL}/`,
        email: 'hello@ifn.community',
        description:
            'A community of international and immigrant founders based in Austin, Texas, running monthly in-person meetups, an optional paid membership, and practical sessions between gatherings.',
        /**
         * `areaServed` rather than `address`. IFN has no premises of its own,
         * so an address would either be false or would be Station Austin's,
         * which belongs to Station Austin.
         */
        areaServed: {
            '@type': 'City',
            name: 'Austin',
            containedInPlace: {
                '@type': 'State',
                name: 'Texas',
            },
        },
        ...(verifiedProfiles.length > 0 ? { sameAs: verifiedProfiles } : {}),
    };
}

/**
 * The website itself. Distinct from the organisation: one is the publisher, the
 * other is the thing published, and search engines treat them as separate
 * entities.
 *
 * No `SearchAction` / sitelinks-searchbox node, because the site has no search
 * endpoint. Declaring one that 404s is worse than declaring none.
 */
export function webSiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: { '@id': ORGANIZATION_ID },
        inLanguage: 'en-US',
    };
}

/** The current page, tied back to the site and the publisher. */
export function webPageSchema(pathname: string) {
    const seo = seoFor(pathname);
    return {
        '@type': 'WebPage',
        '@id': `${canonicalFor(pathname)}#webpage`,
        url: canonicalFor(pathname),
        name: seo.title,
        description: seo.description,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID },
        inLanguage: 'en-US',
    };
}

/**
 * Breadcrumbs. Two levels at most, because the site is two levels deep. Google
 * renders these in place of the raw URL in the SERP, which is a small but real
 * click-through gain, and they give answer engines the site's shape for free.
 * Omitted on the homepage, where a one-item breadcrumb is noise.
 */
export function breadcrumbSchema(pathname: string) {
    const normalised = normalisePath(pathname);
    if (normalised === '/') return null;

    const seo = seoFor(pathname);
    /** The page's own crumb uses its H1-ish short name, not the full <title>. */
    const shortName = seo.title.split('|')[0].trim();

    const postMatch = normalised.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (postMatch && getPostBySlug(postMatch[1])) {
        return {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: `${SITE_URL}/`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Blog',
                    item: `${SITE_URL}/blog`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: shortName,
                    item: canonicalFor(pathname),
                },
            ],
        };
    }

    return {
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${SITE_URL}/`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: shortName,
                item: canonicalFor(pathname),
            },
        ],
    };
}

/**
 * The membership offer, emitted only on /membership where the price is visible.
 *
 * The price is read from MEMBERSHIP_PRICE_STANDARD rather than written out, so
 * the markup cannot drift from the page. Note the deliberate omission: a second,
 * lower warm-lead price exists and is documented in membershipData.ts as
 * explicitly non-public. It must never reach this graph — structured data is
 * more public than the page, not less, and a price in JSON-LD is quoted back by
 * answer engines to people who were never meant to be offered it.
 */
export function membershipOfferSchema() {
    return {
        '@type': 'Offer',
        name: MEMBERSHIP_TIER_NAME,
        description:
            'Annual membership of the International Founders Network: a private member channel, monthly members-only call, and the founder resource library.',
        price: MEMBERSHIP_PRICE_STANDARD.replace('$', ''),
        priceCurrency: 'USD',
        // Checkout adds sales tax on top of the listed price.
        priceSpecification: {
            '@type': 'PriceSpecification',
            price: MEMBERSHIP_PRICE_STANDARD.replace('$', ''),
            priceCurrency: 'USD',
            valueAddedTaxIncluded: false,
        },
        url: `${SITE_URL}/membership`,
        availability: 'https://schema.org/InStock',
        offeredBy: { '@id': ORGANIZATION_ID },
    };
}

export interface FaqEntry {
    question: string;
    answer: string;
}

/**
 * FAQPage, built from question/answer pairs harvested at build time from the
 * page's own rendered DOM rather than from a second hand-maintained list.
 *
 * That indirection is the point. Google requires the marked-up answer to match
 * the visible answer; the FAQ answers in FAQ.tsx are JSX with inline links, so
 * any plain-text copy of them kept alongside would drift on the first edit and
 * the drift would be invisible. scripts/prerender.mjs reads the rendered
 * accordion instead, which cannot drift by construction.
 *
 * Rich-result eligibility for FAQPage is now limited to government and health
 * sites, so this earns no SERP decoration. It is here for answer engines, which
 * still extract it, and it is the single most quotable asset on the site.
 */
export function faqPageSchema(entries: FaqEntry[]) {
    if (entries.length === 0) return null;
    return {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: entries.map((entry) => ({
            '@type': 'Question',
            name: entry.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: entry.answer,
            },
        })),
    };
}

/**
 * Assemble the graph for a route.
 *
 * One `@graph` array in one <script> tag, rather than several sibling scripts.
 * Both are valid; a single graph lets the nodes reference each other by `@id`
 * so the organisation is defined once and pointed at thereafter, which is both
 * smaller and less likely to produce two conflicting Organization entities.
 */

/**
 * BlogPosting for a published post. Headline and description match frontmatter
 * and the rendered page. Peer editorial only; no invented advice claims.
 */
export function blogPostingSchema(pathname: string) {
    const normalised = normalisePath(pathname);
    const match = normalised.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (!match) return null;
    const post = getPostBySlug(match[1]);
    if (!post) return null;

    return {
        '@type': 'BlogPosting',
        '@id': `${canonicalFor(pathname)}#blogposting`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        ...(post.updated ? { dateModified: post.updated } : { dateModified: post.date }),
        mainEntityOfPage: { '@id': `${canonicalFor(pathname)}#webpage` },
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        inLanguage: 'en-US',
        isPartOf: { '@id': WEBSITE_ID },
        url: canonicalFor(pathname),
        image: absoluteUrl(post.ogImage),
    };
}

/** The subset of an events.json record the Event markup reads. Loose on purpose. */
export interface EventRecord {
    id?: unknown;
    title?: unknown;
    start_at?: unknown;
    end_at?: unknown;
    location_name?: unknown;
    cover_url?: unknown;
    registrations?: unknown;
}

function text(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

const US_STATE_AND_ZIP = /^([A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/;
const US_COUNTRY = /^(USA|US|United States(?: of America)?)$/i;

/**
 * A Place from Luma's one-line address, e.g. "Station Austin, 701 Brazos St,
 * Austin, TX 78701, USA". Read right to left: optional country, then "ST
 * 12345" (zip optional), then the city; of what is left, the first part is
 * the venue name and the rest is the street. A bare "Austin, TX" (the older
 * Meetup records) yields a Place named as written with only city and state.
 * A string that does not parse keeps its text as the Place name and address
 * rather than guessing at fields.
 */
export function placeFromLocation(locationName: string) {
    const raw = locationName.trim();
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);

    if (parts.length > 0 && US_COUNTRY.test(parts[parts.length - 1])) parts.pop();
    const stateZip = parts.length >= 2 ? US_STATE_AND_ZIP.exec(parts[parts.length - 1]) : null;
    if (!stateZip) {
        return { '@type': 'Place', name: raw, address: raw };
    }
    parts.pop();
    const locality = parts.pop() as string;
    const venue = parts.length >= 2 ? parts.shift() : undefined;
    const street = parts.length > 0 ? parts.join(', ') : undefined;

    return {
        '@type': 'Place',
        name: venue ?? raw,
        address: {
            '@type': 'PostalAddress',
            ...(street ? { streetAddress: street } : {}),
            addressLocality: locality,
            addressRegion: stateZip[1],
            ...(stateZip[2] ? { postalCode: stateZip[2] } : {}),
            addressCountry: 'US',
        },
    };
}

/** Luma first, because it is where IFN registration lives; else the first link. */
function registrationUrl(registrations: unknown): string | undefined {
    if (!Array.isArray(registrations)) return undefined;
    const links = registrations
        .filter((entry): entry is { platform?: unknown; url?: unknown } => !!entry && typeof entry === 'object')
        .map((entry) => ({ platform: text(entry.platform), url: text(entry.url) }))
        .filter((entry): entry is { platform: string | undefined; url: string } => !!entry.url);
    return (links.find((entry) => entry.platform === 'luma') ?? links[0])?.url;
}

/**
 * One schema.org Event per meetup that has not started yet, soonest first.
 *
 * "Not started" uses the same `start >= now` test as the Upcoming filter on
 * /events, and `now` is the moment the graph is built: at build time inside
 * scripts/prerender.mjs, which is what crawlers read, and again in the
 * visitor's browser, where Head replaces the graph wholesale, so a meetup
 * that has since happened drops out without a rebuild.
 *
 * Dates are America/Chicago wall time with that date's offset (-06:00 CST,
 * -05:00 CDT), because IFN only meets in Austin. A record with no parseable
 * start or no location is skipped: an in-person Event without a place is
 * invalid markup, and the venue is not something to guess.
 */
export function eventSchemas(events: readonly EventRecord[], now: number) {
    return events
        .map((event) => {
            const name = text(event.title);
            const start = text(event.start_at);
            const location = text(event.location_name);
            const startMs = start ? Date.parse(start) : Number.NaN;
            if (!name || !start || !location || Number.isNaN(startMs) || startMs < now) return null;

            const startDate = isoToChicagoOffsetIso(start);
            const end = text(event.end_at);
            const endDate = end ? isoToChicagoOffsetIso(end) : null;
            const id = text(event.id);
            const url = registrationUrl(event.registrations);
            const image = text(event.cover_url);

            return {
                startMs,
                node: {
                    '@type': 'Event',
                    ...(id ? { '@id': `${SITE_URL}/events#event-${id}` } : {}),
                    name,
                    startDate,
                    ...(endDate ? { endDate } : {}),
                    eventStatus: 'https://schema.org/EventScheduled',
                    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                    location: placeFromLocation(location),
                    ...(image ? { image } : {}),
                    ...(url ? { url } : {}),
                    organizer: {
                        '@type': 'Organization',
                        '@id': ORGANIZATION_ID,
                        name: SITE_NAME,
                        url: `${SITE_URL}/`,
                    },
                },
            };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => a.startMs - b.startMs)
        .map((entry) => entry.node);
}

export function graphFor(pathname: string, faq: FaqEntry[] = [], now: number = Date.now()) {
    const normalised = normalisePath(pathname);

    const nodes: Record<string, unknown>[] = [
        organizationSchema(),
        webSiteSchema(),
        webPageSchema(pathname),
    ];

    const breadcrumb = breadcrumbSchema(pathname);
    if (breadcrumb) nodes.push(breadcrumb);

    if (normalised === '/membership') {
        nodes.push(membershipOfferSchema());
    }

    const blogPosting = blogPostingSchema(pathname);
    if (blogPosting) nodes.push(blogPosting);

    /** The meetup list renders on /events from the same events.json. */
    if (normalised === '/events') {
        nodes.push(...eventSchemas(eventsData as EventRecord[], now));
    }

    /** The FAQ component renders on the homepage, so its markup belongs there. */
    if (normalised === '/') {
        const faqNode = faqPageSchema(faq);
        if (faqNode) nodes.push(faqNode);
    }

    return {
        '@context': 'https://schema.org',
        '@graph': nodes,
    };
}
