/**
 * THE SINGLE SOURCE OF TRUTH FOR PER-ROUTE SEARCH METADATA.
 *
 * Two consumers read this file and they must never diverge:
 *
 *   1. src/components/Head.tsx, at runtime, for client-side navigation. A
 *      visitor who lands on "/" and clicks through to "/membership" never
 *      re-fetches a document, so the only thing that can update the title,
 *      description and canonical is JavaScript.
 *
 *   2. scripts/prerender.mjs, at build time, which bakes the same values into
 *      the raw HTML of dist/<route>/index.html. This is the copy that matters
 *      for search and for answer engines: GPTBot, ClaudeBot, PerplexityBot and
 *      CCBot do not execute JavaScript, so anything only Head.tsx sets is
 *      invisible to them. Facebook, LinkedIn, Slack and iMessage unfurlers do
 *      not execute JavaScript either, which is why og:* lives here rather than
 *      being left to the runtime.
 *
 * Adding a route means adding it in three places: the <Route> in App.tsx, an
 * entry here, and (if it should be indexed) nothing else, because the sitemap
 * and the prerender list are both generated from ROUTE_SEO rather than
 * maintained by hand. That is deliberate: a hand-maintained sitemap is a
 * sitemap that goes stale.
 */

export const SITE_URL = 'https://ifn.community';
export const SITE_NAME = 'International Founders Network';

/**
 * The description that ships when a route has none of its own. It is NOT a
 * generic fallback in practice, because every indexable route below defines
 * one; it exists so that a route added without thought still gets prose rather
 * than an empty tag.
 */
export const DEFAULT_DESCRIPTION =
    'A community of international and immigrant founders in Austin, Texas. Monthly in-person meetups, a founder resource library, and a paid membership.';

export interface RouteSeo {
    /** The full <title>. Written out rather than templated so each can be tuned. */
    title: string;
    /**
     * The meta description. 150-160 characters is the practical display limit;
     * longer is not an error, it is simply truncated in the SERP, and the tail
     * still feeds answer-engine extraction.
     */
    description: string;
    /**
     * Whether this route belongs in sitemap.xml and should be prerendered.
     * `false` means the route is real but should not be advertised: the six
     * placeholder pages, /admin, and the 404.
     */
    indexable: boolean;
    /** Relative sitemap weight. Only meaningful against its siblings. */
    priority?: number;
    /** Sitemap changefreq hint. Advisory only; crawlers largely infer this. */
    changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Descriptions are written against the queries this audience actually types,
 * not against the page's internal section names. The competitive research is
 * unambiguous that IFN cannot win generic "startup networking austin" — those
 * SERPs belong to Eventbrite, Meetup and Built In — so the copy here targets
 * the intersection that is genuinely winnable: Austin AND international or
 * immigrant founders. Every description states the city, because a local
 * community that does not name its city in its own metadata is competing
 * nationally by accident.
 */
export const ROUTE_SEO: Record<string, RouteSeo> = {
    '/': {
        title: 'International Founders Network | Founder Community in Austin, Texas',
        description:
            'A community for international and immigrant founders in Austin, Texas. Monthly in-person meetups at Station Austin, a founder resource library, and a paid membership.',
        indexable: true,
        priority: 1.0,
        changefreq: 'weekly',
    },
    '/about': {
        title: `About IFN | ${SITE_NAME}`,
        description:
            'Built in Austin, for founders who came from somewhere else. How the International Founders Network started, who it is for, and what happens when you show up.',
        indexable: true,
        priority: 0.8,
        changefreq: 'monthly',
    },
    '/events': {
        title: `Monthly Founder Meetups in Austin, Texas | ${SITE_NAME}`,
        description:
            'The IFN meetup runs every month in Austin, Texas, for international and immigrant founders. See upcoming dates, the venue, and how to register.',
        indexable: true,
        priority: 0.9,
        changefreq: 'weekly',
    },
    '/membership': {
        title: `Membership | ${SITE_NAME}`,
        description:
            'IFN membership for international founders in Austin: a private member channel, the full resource library, and introductions between meetups. One annual price, one tier.',
        indexable: true,
        priority: 0.8,
        changefreq: 'monthly',
    },
    '/resources': {
        title: `Founder Resources for International Founders | ${SITE_NAME}`,
        description:
            'A resource library for international and immigrant founders: incorporating in the US as a non-resident, banking, visas, fundraising, and the first hires.',
        indexable: true,
        priority: 0.8,
        changefreq: 'monthly',
    },
    '/gallery': {
        title: `Photographs from the Meetups | ${SITE_NAME}`,
        description:
            'Photographs from the monthly International Founders Network meetups in Austin, Texas. The rooms, the conversations, and the people who keep showing up.',
        indexable: true,
        priority: 0.5,
        changefreq: 'monthly',
    },
    '/partners': {
        title: `Partners | ${SITE_NAME}`,
        description:
            'The venues, firms and organisations that make the International Founders Network meetups in Austin possible, and what each of them does for founders.',
        indexable: true,
        priority: 0.6,
        changefreq: 'monthly',
    },
    '/contact': {
        title: `Contact | ${SITE_NAME}`,
        description:
            'Get in touch with the International Founders Network in Austin, Texas. Questions about the meetups, membership, partnering, or speaking.',
        indexable: true,
        priority: 0.5,
        changefreq: 'yearly',
    },
    '/code-of-conduct': {
        title: `Code of Conduct | ${SITE_NAME}`,
        description:
            'The behaviour expected at every International Founders Network meetup and in every member channel, and how to report a problem.',
        indexable: true,
        priority: 0.3,
        changefreq: 'yearly',
    },
    '/privacy-policy': {
        title: `Privacy Policy | ${SITE_NAME}`,
        description:
            'What the International Founders Network collects, why, how long it is kept, and how to ask for it to be deleted.',
        indexable: true,
        priority: 0.3,
        changefreq: 'yearly',
    },
    '/terms-and-conditions': {
        title: `Terms and Conditions | ${SITE_NAME}`,
        description:
            'The terms that govern use of ifn.community, attendance at International Founders Network events, and IFN membership.',
        indexable: true,
        priority: 0.3,
        changefreq: 'yearly',
    },

    /**
     * NON-INDEXABLE ROUTES. Present here so that Head.tsx has a correct title
     * and description for them, absent from the sitemap and the prerender list
     * because `indexable` is false.
     *
     * They earn entries rather than being left to fall through to the 404
     * metadata for one specific reason: Head.tsx sends the GA4 pageview using
     * whatever title it just set, so a route with no entry would report itself
     * as "Page not found" in every content report. ComingSoon.tsx sets its own
     * title afterwards from inside a lazily-loaded chunk, which corrects the
     * visible tab but arrives too late for the pageview.
     */
    '/blog': {
        title: `Blog | ${SITE_NAME}`,
        description: 'Writing from the International Founders Network. Coming soon.',
        indexable: false,
    },
    '/careers': {
        title: `Careers | ${SITE_NAME}`,
        description: 'Roles at the International Founders Network. Coming soon.',
        indexable: false,
    },
    '/chapters': {
        title: `Chapters | ${SITE_NAME}`,
        description: 'International Founders Network chapters beyond Austin. Coming soon.',
        indexable: false,
    },
    '/mentorship': {
        title: `Mentorship | ${SITE_NAME}`,
        description: 'The International Founders Network mentorship programme. Coming soon.',
        indexable: false,
    },
    '/newsletter': {
        title: `Newsletter | ${SITE_NAME}`,
        description: 'The International Founders Network newsletter. Coming soon.',
        indexable: false,
    },
    '/playbooks': {
        title: `Playbooks | ${SITE_NAME}`,
        description: 'Founder playbooks from the International Founders Network. Coming soon.',
        indexable: false,
    },
    '/admin': {
        title: `Admin | ${SITE_NAME}`,
        description: 'Internal dashboard.',
        indexable: false,
    },
};

/**
 * Routes that exist and render, but must never be indexed or prerendered.
 *
 * The six placeholders are real URLs with a "coming soon" body. /admin is an
 * internal dashboard whose real access control is server-side; the exclusion
 * here only keeps it out of search results.
 *
 * These are held separately from ROUTE_SEO rather than as `indexable: false`
 * entries because nothing should have to remember to filter them: if a path is
 * absent from ROUTE_SEO it is not prerendered and not in the sitemap, full
 * stop, and this list is only consumed by the code that emits `noindex`.
 */
export const NOINDEX_PATHS = [
    '/blog',
    '/careers',
    '/chapters',
    '/mentorship',
    '/newsletter',
    '/playbooks',
    '/admin',
] as const;

/** Every path that should be prerendered to static HTML and listed in the sitemap. */
export const INDEXABLE_PATHS = Object.keys(ROUTE_SEO).filter(
    (path) => ROUTE_SEO[path].indexable,
);

/**
 * The canonical URL for a path.
 *
 * Derived from the MATCHED ROUTE, never from `location.pathname` directly.
 * That distinction is the whole point of this function: the site answers HTTP
 * 200 on `/events/`, `/EVENTS` and `/events?utm_source=luma` alike, and a
 * canonical built from the raw pathname would emit a different self-referencing
 * canonical for each, consolidating nothing. Passing an unknown path returns
 * the origin, which is correct for the 404 page — though the 404 also carries
 * `noindex`, so its canonical is academic.
 */
export function canonicalFor(pathname: string): string {
    const normalised = normalisePath(pathname);
    if (normalised in ROUTE_SEO) {
        return normalised === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalised}`;
    }
    return `${SITE_URL}/`;
}

/**
 * Collapse the URL variants that the SPA rewrite makes indistinguishable.
 * Lowercases, strips a trailing slash (except at the root) and drops query and
 * hash. `/Events/?utm_source=luma#faq` and `/events` become the same key.
 */
export function normalisePath(pathname: string): string {
    const withoutQuery = pathname.split('?')[0].split('#')[0];
    const lowered = withoutQuery.toLowerCase();
    if (lowered === '/' || lowered === '') return '/';
    return lowered.endsWith('/') ? lowered.slice(0, -1) : lowered;
}

/** Metadata for a path, falling back to the homepage's for anything unmatched. */
export function seoFor(pathname: string): RouteSeo {
    const normalised = normalisePath(pathname);
    return (
        ROUTE_SEO[normalised] ?? {
            title: `Page not found | ${SITE_NAME}`,
            description: DEFAULT_DESCRIPTION,
            indexable: false,
        }
    );
}
