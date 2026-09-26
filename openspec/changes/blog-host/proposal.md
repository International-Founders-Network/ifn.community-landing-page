# Proposal

## Why

`/blog` is still a ComingSoon stub with Netlify `noindex` and no `/blog/:slug` route. Austin founder presence needs a free editorial surface that is crawlable and prerendered, without waiting on Resources freemium or a headless CMS. Content/Copy will publish Markdown after the host is live; Venkat must preview before any production merge.

## What Changes

- Replace the `/blog` ComingSoon stub with a real index of published posts.
- Add `/blog/:slug` post pages backed by Markdown in `content/blog/<slug>.md`.
- Build-time compile (gray-matter + remark/rehype) to a typed generated module; prerender index + each post; extend sitemap and add RSS.
- Make `/blog` and published posts indexable: flip `seo.ts` + remove Netlify `X-Robots-Tag: noindex` on `/blog` and `/blog/*` together; drop the `/blog` SPA 200 rewrite once prerendered.
- **Main nav (Navbar) Blog link is required** (Venkat lock). Footer Blog link optional in addition.
- One sample on-brand post so `/blog/:slug` is demonstrable.
- Newsletter stays dark (no newsletter CTA wiring). Free blog stays separate from Resources freemium (no paid PDF library content in this repo).

## Capabilities

### New Capabilities
- `blog`: public blog index and post pages, Markdown CMS-lite pipeline, RSS, sample post, main-nav discoverability.

### Modified Capabilities
- `placeholder-pages`: remove `/blog` from the intentionally-unbuilt placeholder set (other five stay).
- `seo-and-crawlability`: dynamic post paths feed sitemap/prerender/RSS; `/blog` and posts become indexable; coordinated noindex lift; post meta must not fall through to "Page not found".

## Impact

Affected: `src/pages/Blog.tsx`, new `BlogPost` page, `src/App.tsx`, `src/data/seo.ts`, `src/components/Head.tsx`, `src/data/structuredData.ts`, `src/components/Navbar.tsx` (required Blog link), optional `Footer.tsx`, `vite.config.ts` (`ifn-seo-assets`), `scripts/prerender.mjs` (consumes generated routes), `netlify.toml`, new `content/blog/`, new `scripts/compile-blog.mjs` (or equivalent), new deps (`gray-matter`, `remark`/`rehype` stack), generated `src/data/blog.generated.ts` (committed like pricing/photos). Build must pass. Branch `site/blog-host`; **do not merge to main** without Venkat preview.
