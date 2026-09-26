# Design: Admin Blog review + Links outbound gate

## Blog full-content review
`compile-blog.mjs` writes `netlify/functions/_data/blog-bodies.json` (all posts, sanitized gated HTML + `heldLinks`). Only `admin-blog` imports it via `_lib/blogBodies.ts`. `GET ?slug=` returns body to allowlisted sessions. AdminBlogPanel opens an in-admin drawer (dialog focus trap). Unpublished HTML never ships in `src/` / `BLOG_POSTS`.

## Schedule prefill
`defaultPublishWallTime(publishAt, date)` → Chicago wall time from `publishAt`, else `${date}T09:00`. Picker remains editable.

## Links Approve → live outbound
Seed stays in `linkAllowlistData.ts`. Neon `link_allowlist` overrides `status` + `allow_outbound` for actionable sponsor/potential rows. `scripts/lib/outboundGate.mjs` strips `<a>` for gated hosts not effectively allowed. Approve/Hold upsert + `triggerBuildHook`.

**Honest constraint:** static prerender means **one rebuild is required** after Approve for outbound hrefs to appear (or disappear on Hold) in already-published HTML. No zero-rebuild runtime rewriter.

## Auth
All new endpoints use the existing Google allowlist session (`getSessionEmail`), same as admin-blog / admin-submissions.
