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
 * WHY THERE IS NO Event SCHEMA HERE. It is the single most valuable type this
 * site could emit and it is deliberately absent. src/data/events.json is
 * regenerated on the 1st and 15th of every month by .github/workflows/
 * sync-events.yml, which runs scripts/update-events.js and takes the venue
 * verbatim from Luma's `geo_address_info.full_address`. Luma currently says
 * "Capital Factory, 701 Brazos St" while every surface of this site says
 * Station Austin. Emitting Event markup from that file would publish a venue
 * that contradicts the visible page, and would silently revert to the wrong
 * value on the next sync. Fix the venue in Luma first, then add Event markup
 * and not before. See the note in scripts/update-events.js.
 */

import {
    MEMBERSHIP_PRICE_STANDARD,
    MEMBERSHIP_TIER_NAME,
} from './membershipData';
import { SOCIAL_LINKS } from './socialLinks';
import { SITE_NAME, SITE_URL, canonicalFor, normalisePath, seoFor } from './seo';

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
            'A community of international and immigrant founders based in Austin, Texas, running monthly in-person meetups, a founder resource library and a paid membership.',
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
            'Annual membership of the International Founders Network: a private member channel, the full founder resource library, and introductions between the monthly Austin meetups.',
        price: MEMBERSHIP_PRICE_STANDARD.replace('$', ''),
        priceCurrency: 'USD',
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
export function graphFor(pathname: string, faq: FaqEntry[] = []) {
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
