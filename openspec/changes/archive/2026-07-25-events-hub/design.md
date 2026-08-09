## Context

Events are read from a live Postgres `events` table via `GET /api/events`; if the table is empty or the query errors, the function falls back to the bundled `src/data/events.json`. Separately, a cron GitHub Action (1st/15th of month, plus manual dispatch) runs three scripts: `update-events.js` (Puppeteer-scrapes Luma), `sync-meetup.js` (Puppeteer-scrapes Meetup), and `sync-all.js` (re-runs both scrapers again, then merges/dedupes by start time into a unified `events.json`, committed to `main`). `useEvents.ts` and `useLumaEvents.ts` are two near-identical hooks doing the same fetch-with-fallback.

## Goals / Non-Goals

**Goals:**
- Document the current filter/fallback/signup contract and the sync automation as one coherent capability.

**Non-Goals:**
- Not merging the live DB store and the scraped-JSON store in this change — they remain two independent, never-reconciled data sources.
- Not consolidating `useEvents`/`useLumaEvents` in this change.

## Decisions

- Grouped the page, hooks, signup, and sync automation as one capability since `BACKLOG.md` already treats them as a single delivered feature ("Unified Event Hub").

## Risks / Trade-offs

- **`useEvents.ts` and `useLumaEvents.ts` are near-duplicate hooks** doing the same fetch-with-fallback logic — a maintenance hazard; a future change should consolidate them.
- **The live `events` Postgres table and the scraped `events.json` are never reconciled** — the DB is never seeded from the scrape output and vice versa, so they can silently diverge.
- **`sync-all.js` redundantly re-invokes both scraper scripts** that the GitHub Action already ran individually earlier in the same job, roughly doubling scrape time per run.
