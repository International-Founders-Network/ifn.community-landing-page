# Proposal: Admin UX — Blog review drawer, schedule prefill, Links Approve

## Why
Venkat’s Admin review feedback (Blog + Links screenshots in chat with IFN Developer, not GitHub review threads on #29): he needs to read the full post before Approve, schedule from the written frontmatter date (America/Chicago) instead of scrolling from “now”, and Approve a third-party link so outbound works on posts that are already published.

## What changes
- Admin → Blog: Review drawer loads full compiled body via `GET /api/admin-blog?slug=` (server-only bodies JSON; not in the client bundle). Approve / Schedule / Mark live / Hold stay available.
- Schedule picker prefills `09:00` Chicago on the post’s frontmatter `date` when `publishAt` is empty.
- Admin → Links: Approve / Hold for sponsors & potentials with a website; Neon `link_allowlist` overlay; always triggers `NETLIFY_BUILD_HOOK_URL`.
- Compile-time outbound gate: gated hosts (sponsors/potentials) keep copy but lose `<a href>` until approved; next rebuild enables links on already-live HTML without republishing editorial status.

## Out of scope
Runtime client-side link rewriter; inventing new URLs; merging #29; publishing Week 1.
