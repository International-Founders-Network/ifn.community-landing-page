# Proposal

## Why

Merging a PR is currently the only way to publish a blog post, which conflates code review with editorial approval and gives no way to publish at a chosen time. Content is opening draft PRs for Week 1 posts (#22-24, HOLD); Venkat needs to approve each post, pick a publish time (America/Chicago), and have the site publish on its own at that time, without anything going public that he has not approved.

Spec: `/workspace/ifn-copy/2026-09-26-blog-editorial-publish-pipeline.md` (Phase 1).

## What Changes

- Post status machine `draft → in_review → approved → scheduled → live`, with `hold` returning `approved | scheduled` to `in_review`.
- Frontmatter gains `status`, `publishAt` (ISO-8601 with offset), and inert `syndication.*` stubs (Phase 2 only). Legacy `draft:` boolean still honoured.
- `scripts/compile-blog.mjs` public gate: a post reaches `BLOG_POSTS` only if `live`, or `scheduled` with `publishAt <= now`. Also writes a metadata-only queue (`netlify/functions/_data/blog-queue.json`) covering every post, no HTML.
- Neon overlay table `blog_editorial` (`db/migrations/04_blog_editorial.sql`) wins over frontmatter for `status` / `publishAt` at build time.
- `GET/PATCH /api/admin-blog` (allowlisted session) lists the queue and applies approve / schedule / mark_live / hold.
- Scheduled function `blog-publish-due` (every 15 min) promotes due `scheduled` rows to `live` and fires `NETLIFY_BUILD_HOOK_URL`.
- Admin → **Blog** tab: queue table, month calendar grouped by Chicago day, action buttons, Chicago datetime picker.
- Welcome post frontmatter gains `status: live`, `publishAt: null`, syndication stubs `false`.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `blog`: status-gated publishing, scheduled publish, Neon overlay, metadata queue.
- `admin-dashboard`: Blog tab with editorial actions.

## Impact

Affected: `scripts/compile-blog.mjs`, `src/data/blog.generated.ts`, `netlify/functions/{admin-blog,blog-publish-due}.ts`, `netlify/functions/_lib/blogEditorial.ts`, `netlify/functions/_data/blog-queue.json`, `src/pages/Admin.tsx`, `src/components/admin/AdminBlogPanel.tsx`, `src/lib/chicagoTime.ts`, `db/migrations/04_blog_editorial.sql`, `.env.example`, welcome post frontmatter. Public page components, sitemap, RSS and prerender are untouched: they still consume `BLOG_POSTS` only.

Out of scope: Phase 2 syndication (Medium / LinkedIn / X / Instagram), changes to the Week 1 PR branches. Branch `site/blog-editorial`, draft PR, **HOLD merge**.
