# seo-and-crawlability Delta

## ADDED Requirements

### Requirement: Published blog posts participate in the SEO route table
The system SHALL register `/blog` and each published `/blog/:slug` as indexable routes for sitemap, prerender list, and head tags. Post title and description SHALL come from frontmatter so `seoFor('/blog/:slug')` does not fall through to "Page not found" metadata.

#### Scenario: Post meta is real
- **WHEN** Head or prerender resolves SEO for a published post path
- **THEN** title and description match that post's frontmatter (not the 404 title)

#### Scenario: Sitemap includes blog
- **WHEN** the site is built with at least one published post
- **THEN** `sitemap.xml` includes `/blog` and each published `/blog/:slug`

### Requirement: Blog index and posts are prerendered
The system SHALL prerender `/blog` and each published `/blog/:slug` to real HTML under `dist/`. Production MUST NOT rely on a soft-200 SPA rewrite for published post URLs.

#### Scenario: Crawler fetches a post without JavaScript
- **WHEN** `/blog/<published-slug>` is fetched without executing JavaScript after a successful build
- **THEN** the response is HTTP 200 with the post's real headings and body in HTML

### Requirement: Coordinated noindex lift for blog
When the blog is made indexable, the system SHALL set `/blog` (and post paths) indexable in the SEO route table AND SHALL remove Netlify `X-Robots-Tag: noindex` headers for `/blog` and `/blog/*` in the same change. Remaining placeholders keep noindex.

#### Scenario: Blog is crawlable when indexable
- **WHEN** `/blog` is fetched after the indexable flip
- **THEN** the response does not carry `X-Robots-Tag: noindex` for `/blog` or `/blog/*`, and robots meta does not noindex the blog index or published posts

### Requirement: BlogPosting structured data on posts
Each published post page SHALL include JSON-LD appropriate for an article/blog post (for example `BlogPosting` or `Article`) in addition to the shared graph patterns, without inventing legal/advice claims.

#### Scenario: Post JSON-LD present
- **WHEN** a prerendered published post is inspected for `application/ld+json`
- **THEN** the graph includes a blog-post or article type with headline matching the post title
