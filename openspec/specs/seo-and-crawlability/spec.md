# seo-and-crawlability Specification

## Purpose
Prerendering, the route table, head-tag management, structured data, and the crawl/index policy. This capability exists because every URL on ifn.community once returned the same 3.3 KB empty shell: Google renders JavaScript, but GPTBot, ClaudeBot, PerplexityBot, CCBot and every social unfurler do not, so for answer engines the site was blank.

> **Written after the fact, 2026-08-28.** This capability shipped without a
> `/opsx:propose` cycle, along with everything else between 2026-07-29 and
> 2026-08-28. These requirements were derived by reading the implementation, not
> by recovering an intent that was never written down — so they describe what
> ships, including where it falls short. Where the code has a known gap, the gap
> is stated as a gap rather than specified away. The decisions behind it were
> recorded at the time in `AGENTS.md` and `REDESIGN-PLAN.md`; this file points at
> them rather than inventing a history.

## Requirements
### Requirement: One route table feeds every SEO surface
The system SHALL define every route's title, description and indexability once,
in `ROUTE_SEO` in `src/data/seo.ts`, and SHALL derive the sitemap, the
prerender list and the per-page head tags from that table rather than from
separate lists.

`sitemap.xml`, `llms.txt` and `prerender-routes.json` SHALL be generated into
`dist/` at build time from `INDEXABLE_PATHS`, so the set of prerendered pages
and the set of sitemapped pages are the same set by construction.

A route marked `indexable: false` SHALL appear in neither the sitemap nor the
prerender list. This covers the six placeholder routes, `/admin`, and the 404.

**Known gap, recorded rather than specified away.** A `<Route>` added to
`App.tsx` without a matching `ROUTE_SEO` entry is silently not prerendered, not
sitemapped and not in `llms.txt`. The sitemap and prerender list cannot drift
from each other, but both can drift from `App.tsx`, and nothing catches it.

#### Scenario: Adding an indexable route
- **WHEN** a route is added to `ROUTE_SEO` with `indexable: true`
- **THEN** it appears in `sitemap.xml`, in `llms.txt` and in the prerender list without any other file being edited

#### Scenario: A route exists in the router but not in the table
- **WHEN** a `<Route>` is added to `App.tsx` with no `ROUTE_SEO` entry
- **THEN** it renders for a browser but is absent from the sitemap and is served as the unprerendered shell — a known gap, not intended behaviour

### Requirement: Indexable routes are served as real HTML
The system SHALL prerender every indexable route at build time and write
`dist/<route>/index.html`, so a client that does not execute JavaScript receives
the page's actual content.

The prerender SHALL wait for the app to finish rendering before snapshotting,
detected by the `data-head-managed` canonical link that `Head.tsx` writes, and
SHALL NOT snapshot a page whose data request failed.

A route that fails to prerender SHALL fail the build. Falling back to the empty
shell is the exact condition this capability exists to eliminate, and it would
otherwise happen silently.

#### Scenario: A crawler that does not run JavaScript requests a page
- **WHEN** `/membership` is fetched without JavaScript execution
- **THEN** the response contains the page's real headings, copy and JSON-LD, not an empty `<div id="root">`

#### Scenario: A route fails to render during the build
- **WHEN** any indexable route cannot be rendered
- **THEN** the build fails rather than publishing the shell for that URL

### Requirement: Head tags have exactly one writer
The system SHALL manage `title`, `description`, canonical, `og:*`, `twitter:*`,
the robots meta and the JSON-LD graph from `src/components/Head.tsx` alone, and
SHALL tag every element it writes with `data-head-managed`.

No other component SHALL write these tags. A second writer breaks `Head`'s
ability to remove a stale `noindex` during client-side navigation, and the
duplicate effects that previously lived in `ComingSoon.tsx` and `Admin.tsx` were
removed for that reason.

`noindex` SHALL be applied by ADDING a robots meta on the routes that need it,
never by writing `index` on the routes that do not, so that a stale tag cannot
follow a client-side navigation into a route that must be indexed.

#### Scenario: Navigating between an indexed and a noindexed route
- **WHEN** a visitor navigates client-side from `/blog` to `/membership`
- **THEN** the `noindex` robots meta is removed rather than overwritten, and `/membership` carries no robots meta

### Requirement: Every page carries a structured-data graph
The system SHALL emit one JSON-LD `@graph` per page from
`src/data/structuredData.ts`, replaced wholesale on navigation, containing
Organization, WebSite, WebPage and BreadcrumbList, plus Offer on `/membership`
and FAQPage where the page carries FAQ entries.

The membership Offer's price SHALL be read from the generated pricing data
rather than written out, so the marked-up price cannot diverge from the price
the page displays or the one Stripe charges.

`Event` markup is deliberately ABSENT. The event feed's venue can contradict the
rendered page while the Luma records are stale, and marking up a venue that
contradicts the page is a structured-data policy violation rather than merely
untidy. It SHALL be added once the Luma venue is corrected — see `BACKLOG.md`.

#### Scenario: Inspecting the membership page's structured data
- **WHEN** the prerendered `/membership` is parsed for `application/ld+json`
- **THEN** exactly one graph is present containing an Offer whose price matches the price rendered on the page

### Requirement: Crawling is allowed everywhere so that noindex can be obeyed
`robots.txt` SHALL NOT disallow any path. Routes that must stay out of search
SHALL be excluded with `X-Robots-Tag` response headers in `netlify.toml`
instead.

The two directives SHALL NOT be combined on the same path: a compliant crawler
never fetches a disallowed URL, so it never receives the noindex, and the page
can be indexed as a URL-only result that nothing can then remove.

Access control for `/admin` SHALL remain server-side; `robots.txt` is not and
never was part of it.

#### Scenario: A crawler encounters a placeholder route
- **WHEN** `/blog` is fetched
- **THEN** the response carries `X-Robots-Tag: noindex, follow` and `robots.txt` does not disallow it

### Requirement: A nonexistent URL returns 404
The catch-all SHALL return status 404 rather than 200, so a missing page and a
missing asset are both reported as missing.

Routes that are real but unprerendered — the six placeholders and `/admin` —
SHALL be listed as explicit 200 rewrites BEFORE the catch-all, or they would
answer 404 while rendering correctly.

`public/_headers` marks hashed assets `immutable`, and that is safe ONLY while
the catch-all returns 404. If the catch-all is ever reverted to 200, a stale
hashed-chunk request would receive an HTML body with a 200 and pin an HTML
document at a `.js` URL for a year; `public/_headers` SHALL be deleted in the
same commit as any such revert.

#### Scenario: Requesting a URL that does not exist
- **WHEN** `/no-such-page` is requested
- **THEN** the response status is 404

#### Scenario: Requesting a real but unprerendered route
- **WHEN** `/blog` is requested
- **THEN** the response status is 200 and the placeholder renders
