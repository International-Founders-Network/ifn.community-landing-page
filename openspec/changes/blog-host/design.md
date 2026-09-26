# Design

## Context

See proposal.md for motivation. The landing site is a Vite React SPA on Netlify with Puppeteer prerender from `INDEXABLE_PATHS` in `src/data/seo.ts`. Catch-all `/*` returns HTTP 404; only prerendered files (or explicit 200 rewrites) serve real routes. `/blog` is currently a ComingSoon stub, `indexable: false`, SPA 200 rewrite, and `X-Robots-Tag: noindex` on `/blog` and `/blog/*`. There is no Markdown pipeline and no `/blog/:slug` route. Existing generated-data pattern: `scripts/*.mjs` → committed `src/data/*.generated.ts` (pricing, photos).

## Goals / Non-Goals

**Goals:**
- CMS-lite: `content/blog/<slug>.md` + frontmatter → build-time typed posts module.
- Index + post routes with real meta, prerender, sitemap, RSS.
- Coordinated indexability (seo.ts + Netlify headers + remove `/blog` rewrite).
- Navbar Blog link (required); Footer Blog optional.
- One sample post; build passes; preview PR only.

**Non-Goals:**
- MDX, headless CMS, Netlify CMS UI.
- Tag routes, draft/member-gated public posts, Resources freemium content in this repo.
- Wiring newsletter CTA; replacing `/playbooks`.
- Full editorial backlog; merge to `main`.

## Decisions

1. **Markdown + gray-matter + remark/rehype (not MDX)**  
   Matches Vite/Netlify and Copy's git workflow. MDX deferred until a post needs React components.

2. **Filename stem is slug SoT; frontmatter `slug` optional override**  
   Stable kebab-case paths; dates stay in frontmatter, not the URL.

3. **Generated module merges into SEO SoT**  
   `scripts/compile-blog.mjs` writes `blog.generated.ts` (post list + HTML bodies). `seo.ts` imports published posts and exposes `/blog/:slug` meta so `seoFor()`, sitemap, prerender, and Head stay consistent. Do not hand-maintain every slug in `ROUTE_SEO`.

4. **Prerender each post (mandatory)**  
   Without `dist/blog/<slug>/index.html`, Netlify catch-all returns 404. Prefer prerender over a permanent `/blog/*` 200 rewrite.

5. **RSS at `/rss.xml`**  
   Written into `dist/` by seo-assets (or compile step); `rel="alternate"` on `/blog`.

6. **Navbar required; Footer optional**  
   Venkat lock: Blog in primary nav. Also add Footer Community link for consistency.

7. **Copy locks enforced in sample + comments**  
   No em dashes; no founding-team/ownership disclosure; Yani = technology partner for founders only; membership = "private member channel"; Newsletter stays dark.

## Risks / Trade-offs

- [Post path 404] → Prerender every published slug; fail build if prerender fails.
- [Stale noindex] → Flip seo.ts indexable, remove Netlify blog noindex headers, and drop `/blog` 200 rewrite in the same change.
- [seoFor 404 fallback] → Register generated post paths before Head runs.
- [Resources bleed] → Sample and docs forbid dumping paid library Markdown into landing.
- [Nav crowding] → Add Blog as a top-level item near Resources; keep Collaborate disclosure unchanged.

## Migration Plan

1. Ship on branch `site/blog-host` → Netlify Deploy Preview.
2. Venkat previews; hold merge.
3. After merge (future): archive OpenSpec change; Content publishes via MD PRs.

## Open Questions

None blocking scaffold. Primary-nav placement relative to Resources is an IA tweak Venkat can adjust in preview without changing the host design.
