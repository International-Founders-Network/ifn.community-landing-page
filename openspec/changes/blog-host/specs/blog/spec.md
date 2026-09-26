# blog Specification

## Purpose
Public free editorial blog on the landing site: Markdown-backed index and post pages, build-time compile, prerender, sitemap/RSS integration, and primary-nav discoverability. Separate from Resources freemium.

## ADDED Requirements

### Requirement: Blog index lists published posts
The system SHALL render `/blog` as an index of published posts (newest first) showing at least title, date, and excerpt or description. Draft posts SHALL be excluded from the public index.

#### Scenario: Visiting the blog index with published posts
- **WHEN** a visitor navigates to `/blog` and at least one non-draft post exists
- **THEN** the page lists those posts newest-first with title, date, and a short summary linking to `/blog/:slug`

### Requirement: Post pages render Markdown by slug
The system SHALL render `/blog/:slug` from a Markdown file whose stem (or frontmatter slug) matches, converting body Markdown to HTML at build time. An unknown slug SHALL render the site 404 behavior (not a soft-200 empty post).

#### Scenario: Visiting a published post
- **WHEN** a visitor navigates to `/blog/welcome-to-the-ifn-blog` (or the shipped sample slug) for a published post
- **THEN** the page shows the post title, date, and body content derived from that Markdown file

#### Scenario: Visiting an unknown slug
- **WHEN** a visitor navigates to `/blog/does-not-exist`
- **THEN** the response is handled as not found (client NotFound and, when unprerendered, HTTP 404 from the catch-all)

### Requirement: Sample post ships with the host
The repository SHALL include at least one published sample Markdown post under `content/blog/` so `/blog/:slug` is demonstrable on Deploy Preview. Sample copy SHALL follow IFN copy locks: no em dashes, no founding-team or ownership disclosure, Yani only as technology partner for founders when mentioned, membership described as private member channel, and no newsletter signup CTA.

#### Scenario: Sample post is reachable
- **WHEN** the Deploy Preview is opened at the sample post path
- **THEN** the post renders with on-brand Austin founders presence copy and no prohibited disclosure or newsletter CTA

### Requirement: Primary nav links to Blog
The primary Navbar SHALL include a Blog link to `/blog` (desktop and mobile). A Footer Blog link MAY also be present but MUST NOT be the only discoverability path.

#### Scenario: Finding Blog from the main nav
- **WHEN** a visitor views the primary navigation
- **THEN** a Blog control navigates to `/blog`

### Requirement: RSS feed lists published posts
The system SHALL emit an RSS feed of published posts at build time (path `/rss.xml` or `/blog/rss.xml`) and SHALL advertise it with a `rel="alternate"` link on the blog index.

#### Scenario: Fetching the RSS feed
- **WHEN** `/rss.xml` (or the chosen feed path) is requested after a successful build
- **THEN** the response is an RSS document listing published posts with title, link, description, and publish date

### Requirement: Free blog stays separate from Resources freemium
The public blog MUST NOT embed or ship paid Resources library PDF/guide bodies from the private freemium library. Soft CTAs MAY point to meetup, membership, and the Resources hub without auto-publishing Resources catalog links from blog frontmatter.

#### Scenario: Blog content boundary
- **WHEN** a post is added under `content/blog/`
- **THEN** it is free editorial Markdown in the landing repo and does not require membership to read
