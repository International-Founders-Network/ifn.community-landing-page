import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NOINDEX_PATHS, canonicalFor, normalisePath, seoFor } from '../data/seo';
import { graphFor } from '../data/structuredData';
import { trackPageview } from '../lib/analytics';

/**
 * THE DOCUMENT HEAD, DRIVEN BY THE ROUTE.
 *
 * This replaces the old RouteTitle, which set `document.title` and nothing
 * else. Every other head tag on the site was static, which meant all twenty
 * routes shared one meta description and one Open Graph block: every link to
 * /membership or /events unfurled in Slack, LinkedIn and iMessage as the
 * homepage, and every route offered search engines the same description.
 *
 * WHAT THIS DOES AND DOES NOT BUY. Everything here runs in an effect, so it is
 * invisible to any consumer that does not execute JavaScript — which is every
 * social unfurler and most AI crawlers. This component alone would fix nothing
 * for them. It is half of a pair: scripts/prerender.mjs renders each route in a
 * real browser at build time and serialises the resulting document, so the tags
 * this component sets are what ends up baked into the static HTML. Runtime
 * updates then keep client-side navigation correct for the visitor. Neither
 * half is redundant, and the prerender depends on this component being the only
 * thing that writes these tags — so do not add a second writer.
 *
 * WHY IT MUTATES RATHER THAN RENDERS. React 19 hoists <title>, <meta> and
 * <link> rendered inside a component into <head> on its own, which would be the
 * idiomatic approach. It is not used here because the hoisting happens during
 * render and the prerender snapshot needs the tags to be present, complete and
 * de-duplicated at a moment it can detect. Direct mutation against stable
 * selectors is dull, but it is observable and it cannot produce two competing
 * description tags.
 */

const NOINDEX_SET = new Set<string>(NOINDEX_PATHS);

/**
 * Find an existing tag or create it. Every tag this component owns carries
 * `data-head-managed`, which is what tells the prerender script that the tag
 * came from here and is safe to trust, and what stops repeated navigations from
 * appending a second copy of anything.
 */
function upsert(
    selector: string,
    create: () => HTMLElement,
): HTMLElement {
    let element = document.head.querySelector<HTMLElement>(selector);
    if (!element) {
        element = create();
        element.setAttribute('data-head-managed', '');
        document.head.appendChild(element);
    }
    return element;
}

function setMetaByName(name: string, content: string) {
    const element = upsert(`meta[name="${name}"]`, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        return meta;
    });
    element.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
    const element = upsert(`meta[property="${property}"]`, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        return meta;
    });
    element.setAttribute('content', content);
}

function setCanonical(href: string) {
    const element = upsert('link[rel="canonical"]', () => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        return link;
    });
    element.setAttribute('href', href);
}

/**
 * `noindex` is applied by ADDING a robots meta on the routes that need it and
 * REMOVING it everywhere else. The removal matters: this is a single-page app,
 * so a visitor who lands on /admin and navigates to / would otherwise carry the
 * noindex with them into a route that must be indexed, and a prerender pass
 * that visited the routes in the wrong order would bake it into the HTML.
 */
function setRobots(shouldNoindex: boolean) {
    const existing = document.head.querySelector('meta[name="robots"]');
    if (shouldNoindex) {
        const element =
            existing ??
            (() => {
                const meta = document.createElement('meta');
                meta.setAttribute('name', 'robots');
                meta.setAttribute('data-head-managed', '');
                document.head.appendChild(meta);
                return meta;
            })();
        element.setAttribute('content', 'noindex, follow');
    } else if (existing?.hasAttribute('data-head-managed')) {
        existing.remove();
    }
}

/**
 * The JSON-LD graph, written into one script tag that is replaced wholesale on
 * every route change. Replaced rather than mutated because a stale node left
 * behind from the previous route (an Offer on a page with no price, say) is a
 * structured-data policy problem, not merely untidy.
 */
function setStructuredData(pathname: string) {
    const id = 'ifn-structured-data';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.setAttribute('data-head-managed', '');
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graphFor(pathname), null, 2);
}

export function Head() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        const normalised = normalisePath(pathname);
        const seo = seoFor(pathname);
        const canonical = canonicalFor(pathname);
        const isNoindex = NOINDEX_SET.has(normalised) || !seo.indexable;

        document.title = seo.title;
        setMetaByName('description', seo.description);
        setCanonical(canonical);

        setMetaByProperty('og:title', seo.title);
        setMetaByProperty('og:description', seo.description);
        setMetaByProperty('og:url', canonical);
        setMetaByName('twitter:title', seo.title);
        setMetaByName('twitter:description', seo.description);

        setRobots(isNoindex);
        setStructuredData(pathname);

        /**
         * The pageview fires LAST, from inside this same effect, and that
         * placement is load-bearing rather than stylistic. GA4 records
         * `page_title` from `document.title` at the moment the event is sent.
         * A separate sibling component would run its effect in mount order, so
         * a pageview tracker mounted beside this one would send the PREVIOUS
         * route's title with the current route's path on every navigation —
         * a class of bug that is invisible in the network tab and silently
         * corrupts every content report. Sending from here makes the ordering
         * a fact of the code rather than a convention someone has to preserve.
         *
         * `search` is passed through so UTM parameters survive; without it,
         * every campaign IFN ever runs is attributed to "direct".
         */
        trackPageview(normalised + search, seo.title);
    }, [pathname, search]);

    return null;
}
