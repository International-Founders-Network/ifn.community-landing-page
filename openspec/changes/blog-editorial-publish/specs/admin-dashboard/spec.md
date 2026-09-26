## ADDED Requirements

### Requirement: Admin dashboard includes a Blog editorial tab
The system SHALL render a "Blog" tab on `/admin` listing every post from `GET /api/admin-blog` (queue metadata merged with the Neon overlay) with title, slug, status, `publishAt` shown in America/Chicago, and date, plus a month view grouping approved, scheduled, and live-with-publishAt posts by Chicago calendar day. The tab SHALL NOT import the public generated blog module.

#### Scenario: Viewing the queue
- **WHEN** an authenticated admin opens the Blog tab
- **THEN** all posts, including drafts and in-review posts, are listed from the admin API, with publish times labelled America/Chicago

#### Scenario: Unauthenticated API access
- **WHEN** `/api/admin-blog` is called without a valid allowlisted session
- **THEN** it responds 401 and returns no post metadata

### Requirement: Editorial actions are restricted to the approval path
`PATCH /api/admin-blog` with `{ slug, action, publishAt? }` SHALL allow only: `approve` (in_review → approved), `schedule` (approved or scheduled → scheduled, requiring `publishAt` with offset), `mark_live` (approved or scheduled → live), and `hold` (approved or scheduled → in_review, clearing `publishAt`). Any other transition SHALL return 400. When no database is configured, writes SHALL return 503. After schedule, mark_live or hold the function SHALL request a rebuild via `NETLIFY_BUILD_HOOK_URL` when configured.

#### Scenario: Scheduling in Chicago time
- **WHEN** the admin enters 2026-10-01 09:00 in the America/Chicago picker and clicks Schedule on an approved post
- **THEN** the overlay stores `publishAt` `2026-10-01T09:00:00-05:00` and status `scheduled`

#### Scenario: Skipping approval is refused
- **WHEN** `mark_live` or `schedule` is sent for an `in_review` or `draft` post
- **THEN** the API responds 400 and nothing is written

#### Scenario: Hold
- **WHEN** hold is applied to a scheduled post
- **THEN** it returns to `in_review` with `publishAt` cleared and is not public after the next build
