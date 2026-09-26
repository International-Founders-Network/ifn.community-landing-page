## ADDED Requirements

### Requirement: Admin Blog review shows full post body before approve
The system SHALL let an allowlisted admin open a Review drawer for any queue post that loads the full compiled body from `GET /api/admin-blog?slug=`, which SHALL require the same allowlisted session as other admin APIs and SHALL NOT expose unpublished bodies on any public route.

#### Scenario: Review in_review post
- **WHEN** an allowlisted admin opens Review on an `in_review` post
- **THEN** the drawer shows the post’s compiled body and Approve remains available

### Requirement: Schedule picker prefills from frontmatter date
When `publishAt` is empty, the Admin Blog schedule control SHALL prefill America/Chicago wall time as 09:00 on the post’s frontmatter `date`.

#### Scenario: Approved post with no publishAt
- **WHEN** an approved post has `publishAt` null and frontmatter date `2026-09-29`
- **THEN** the datetime-local value defaults to `2026-09-29T09:00`

### Requirement: Admin Links Approve enables outbound after rebuild
Allowlisted admins SHALL be able to Approve (verified + allow outbound) or Hold a sponsor/potential row with a website via `/api/admin-links`. Approve and Hold SHALL persist to Neon and SHALL request a Netlify rebuild. Compile-blog SHALL gate outbound anchors for sponsor/potential hosts so approved hosts become real links on the next build without changing editorial publish status.

#### Scenario: Approve Cooley on a live post
- **WHEN** Venkat Approves the Cooley potential and the build hook runs
- **THEN** the next compile keeps Cooley hrefs in published HTML for posts that already contain that citation
