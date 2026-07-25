## Why

The Events page, its data hooks, the signup form, and the scheduled Luma/Meetup scraper together form the "Unified Events Hub" `BACKLOG.md` describes as shipped — but there's no written spec tying these pieces together, and cataloging them surfaced real maintenance gaps (duplicate hooks, two never-reconciled data stores) worth recording explicitly.

## What Changes

No code changes. Establishes `events-hub` as a tracked capability spanning the page, its data fetching, signup, and the sync automation behind it, with known gaps recorded as risks.

## Capabilities

### New Capabilities
- `events-hub`: Event browsing/filtering, event-notification signup, and the scheduled scrape-and-merge automation that keeps the fallback dataset current.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Events.tsx`, `src/hooks/{useEvents,useLumaEvents}.ts`, `src/components/{EventCard,EventsPreview}.tsx`, `netlify/functions/{events,event-signup}.ts`, `scripts/{update-events,sync-meetup,sync-all}.js`, `.github/workflows/sync-events.yml`.
