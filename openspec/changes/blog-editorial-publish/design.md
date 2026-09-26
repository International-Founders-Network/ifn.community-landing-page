# Design: blog editorial publish pipeline (Phase 1)

## Context

The blog (`blog-host`) compiles `content/blog/*.md` into `src/data/blog.generated.ts` at build time; `Blog.tsx`, `BlogPost.tsx`, sitemap, RSS and prerender all read `BLOG_POSTS`. The only gate was `draft: true`. Admin already has Google-allowlist sessions and Neon (`NETLIFY_DATABASE_URL`). `stripe-webhook` already triggers rebuilds via `NETLIFY_BUILD_HOOK_URL`.

## Decisions

### 1. Durable editorial store: Neon overlay table

| Option | Verdict |
|--------|---------|
| GitHub Contents API writing frontmatter | Needs a GitHub token/App on Netlify; not present. |
| **Neon `blog_editorial` overlay** | **Chosen.** Already wired for Admin. |
| Netlify Blobs | Fallback only; not built. |

Columns: `slug` PK, `status` (CHECK enum), `publish_at timestamptz`, `updated_at`, `updated_by` (admin email or `blog-publish-due`). The overlay overrides **only** `status` and `publishAt`; title, body, date and tags always come from Markdown. The table is created by the migration and, per repo convention, by `CREATE TABLE IF NOT EXISTS` at request time.

At build, `compile-blog.mjs` reads the overlay when `NETLIFY_DATABASE_URL` is set:
- unset (local, CI): frontmatter only;
- table missing (`42P01`): frontmatter only, with a warning;
- **any other error fails the build.** Silently dropping the overlay would unpublish every post made live through Admin; a failed build leaves the previous deploy serving.

### 2. Schedule → live: build-time filter + scheduled function + build hook

Static prerendered HTML cannot change on its own, so publishing at a time means building at (or just after) that time.

1. Admin `schedule` writes `scheduled` + `publishAt` to Neon and fires the build hook (the post stays hidden until due; this keeps the Admin "on site in current build" flag honest).
2. `blog-publish-due` (`schedule('*/15 * * * *')`) finds effective `scheduled` posts with `publishAt <= now`, upserts them to `live`, and fires the build hook if any were promoted.
3. The next build merges the overlay; compile includes them.

Publishing lag is therefore up to 15 minutes plus build time. The compile gate independently treats `scheduled` + due as public, so any unrelated build after `publishAt` also publishes the post; promoting to `live` keeps Admin state and semantics clear. Netlify runs scheduled functions on the production deploy only.

### 3. Time handling

`publishAt` is stored as an instant with its offset. Gating compares instants (`Date.parse(publishAt) <= Date.now()`), which is exactly "now in America/Chicago" because the offset is part of the value; no wall-clock conversion happens server-side.

Admin's `<input type="datetime-local">` gives zone-less wall time, interpreted as Chicago. `src/lib/chicagoTime.ts` converts it without Temporal or a tz library: read the wall time as UTC, subtract Chicago's offset at that guess (`Intl` `timeZoneName: 'longOffset'`), recheck at the result, prefer the candidate whose Chicago wall time matches. Nonexistent spring-forward times resolve one hour later; repeated fall-back times resolve to the first (CDT) occurrence. Unit tested.

### 4. Drafts never reach the client bundle

`BLOG_POSTS` contains public posts only. The all-posts queue is written to `netlify/functions/_data/blog-queue.json` (metadata, no HTML), imported by the functions via esbuild's JSON import so it is inlined into the function bundle. Nothing under `src/` imports it, and `AdminBlogPanel` fetches `/api/admin-blog` rather than importing any generated module. `_data/` is a subdirectory without an entry file, so Netlify does not treat it as a function (same as `_lib/`).

### 5. Transitions

| Action | From | To | Notes |
|--------|------|----|-------|
| approve | in_review | approved | clears publishAt |
| schedule | approved, scheduled | scheduled | requires ISO publishAt with offset; `scheduled → scheduled` is a reschedule |
| mark_live | approved, scheduled | live | keeps publishAt as record; publishes on next build |
| hold | approved, scheduled | in_review | clears publishAt |

No action reaches `approved`, `scheduled` or `live` from `draft` / `in_review` without passing through approve. The scheduled function only ever promotes `scheduled`. An unknown frontmatter status fails closed to `draft`.

## Risks

- Build hook unset: schedule still gates correctly, but nothing rebuilds on time. Admin surfaces "no build hook configured".
- Neon outage at build fails the build (intended; see 1).
- Deploy Previews may share the production database; an Admin action on a preview writes the real overlay.

## Non-goals

Phase 2 syndication; editing post bodies in Admin; per-post preview of unpublished HTML; changing the Week 1 PR branches.
