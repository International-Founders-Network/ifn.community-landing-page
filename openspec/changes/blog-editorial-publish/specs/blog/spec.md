## ADDED Requirements

### Requirement: Posts carry an editorial status that gates publication
Each post SHALL have a status in `draft | in_review | approved | scheduled | live`, read from frontmatter `status`. When `status` is absent, `draft: true` SHALL mean `draft` and `draft: false` or omitted SHALL mean `live`. An unrecognised status SHALL be treated as `draft`. A post SHALL be included in the public post list (index, post pages, prerender, sitemap, RSS) if and only if its effective status is `live`, or `scheduled` with a `publishAt` at or before the build time.

#### Scenario: In-review post stays private
- **WHEN** a post has `status: in_review`, `draft: true`, `publishAt: null`
- **THEN** it is absent from `BLOG_POSTS`, `/blog`, the sitemap and RSS, and its HTML is not in the client bundle

#### Scenario: Approved post with a past publishAt stays private
- **WHEN** a post's effective status is `approved` and it has a `publishAt` in the past
- **THEN** it is not public

#### Scenario: Scheduled post becomes public once due
- **WHEN** a post is `scheduled` with `publishAt` earlier than the build time
- **THEN** it is included in `BLOG_POSTS`; if `publishAt` is later, it is excluded

#### Scenario: Legacy welcome post
- **WHEN** a post has `status: live` (or no status and `draft: false`)
- **THEN** it is public

### Requirement: publishAt is an instant with an explicit offset
`publishAt` SHALL be ISO-8601 date-time with a `Z` or `±HH:MM` offset; the intended zone for authoring and display is America/Chicago. Any other value SHALL be treated as unset with a build warning. A `scheduled` post without a valid `publishAt` SHALL NOT be public.

#### Scenario: Invalid publishAt
- **WHEN** frontmatter has `publishAt: "2026-10-01 09:00"`
- **THEN** compile warns and treats `publishAt` as unset

### Requirement: Neon editorial overlay overrides status and publishAt at build
When `NETLIFY_DATABASE_URL` is set, the compile step SHALL read `blog_editorial` and, for each matching slug, use the overlay's `status` and `publish_at` in place of frontmatter. Title, description, body, date and tags SHALL always come from Markdown. A missing table SHALL fall back to frontmatter; any other overlay read failure SHALL fail the build.

#### Scenario: Admin-approved post published through the overlay
- **WHEN** Markdown says `in_review` and the overlay says `live`
- **THEN** the build publishes the post

### Requirement: Metadata-only editorial queue for every post
The compile step SHALL write `netlify/functions/_data/blog-queue.json` listing every post (slug, title, date, status, publishAt, tags, draft, syndication, publicInBuild) and SHALL NOT include post HTML. No module under `src/` SHALL import it.

#### Scenario: Draft title visible to admin API only
- **WHEN** an in-review post exists
- **THEN** its title appears in the queue JSON served by `/api/admin-blog` but not in any public generated module

### Requirement: Scheduled posts go live automatically without further approval steps
A scheduled function SHALL run every 15 minutes, promote posts whose effective status is `scheduled` and whose `publishAt` has passed to `live` in the overlay, and request a rebuild via `NETLIFY_BUILD_HOOK_URL` when any were promoted. It SHALL NOT change posts in `draft`, `in_review` or `approved`.

#### Scenario: Due post promoted
- **WHEN** a post is `scheduled` for 09:00 America/Chicago and the function runs at 09:05
- **THEN** the overlay row becomes `live` and a rebuild is requested

#### Scenario: Unapproved post never promoted
- **WHEN** a post is `in_review` with any `publishAt`
- **THEN** the function leaves it unchanged

### Requirement: Syndication stubs are inert
Frontmatter `syndication.{medium,linkedin,x,instagram}` SHALL be parsed as booleans defaulting to `false` and SHALL NOT trigger any external posting in this phase.

#### Scenario: Stub set true
- **WHEN** a post sets `syndication.medium: true`
- **THEN** nothing is posted anywhere; the flag is recorded in queue metadata only
