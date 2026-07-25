## Context

Four routes render fixed content with no async logic: mission/values/stats (About), legal copy (Privacy, Terms), and community standards with a `mailto:` report link (Code of Conduct).

## Goals / Non-Goals

**Goals:**
- Confirm each route renders and its links resolve; no further behavioral contract needed for static content.

**Non-Goals:**
- Not specifying the copy itself — that's editorial, not a spec concern.
- Not covering `ExperimentalHero` (see `home-page` capability's non-goals — same reasoning).

## Decisions

- Grouped as one capability rather than four; will split out individually only if one of these pages gains real behavior.

## Risks / Trade-offs

- **`About.tsx`'s "Apply to Join" button has no `onClick` handler** — found while cataloging pages for this backfill. It's a dead button in production. Not fixed in this pass (out of scope for a spec-adoption change); recommend a follow-up wiring it to `openJoinModal`, matching the pattern used elsewhere on the same page.
