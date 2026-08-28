## Why

Two capabilities ship and neither has a spec of record.

`AGENTS.md` requires a `/opsx:propose` cycle before non-trivial change. The
archive shows nine changes between 2026-07-25 and 2026-07-29, then nothing until
2026-08-28. Everything in that month — prerendering, the SEO asset pipeline,
`Head.tsx` as the sole head writer, `src/data/seo.ts` as the route table, the
404 catch-all, `public/_headers`, the `/gallery` route and the photo build —
landed without one. `BACKLOG.md` already admits the `/gallery` half of this.

The consequence is practical, not procedural: a future change touching routes,
head tags or crawlability has nothing to write a delta against, and `AGENTS.md`
is the only prose describing behaviour that 204 files implement.

## What Changes

**Nothing in the code.** This is documentation of what already ships, written by
reading the implementation rather than the intent. Both specs are marked as
written after the fact, in the same spirit as the dated correction notes already
carried by `membership-page` and `partners-page`.

- `seo-and-crawlability`: new capability. The `ROUTE_SEO` table as the single
  source of routes, `Head.tsx` as the only writer of head tags, build-time
  generation of `sitemap.xml`, `llms.txt` and `prerender-routes.json`, the
  prerender pass, the 404 catch-all, and the noindex policy.
- `gallery`: new capability. The `/gallery` route and the manifest-driven photo
  build.

## Non-goals

- **No behaviour is corrected here.** Where the implementation has a known gap,
  the gap is written into the spec as a gap rather than quietly specified away.
- **No retroactive proposal or design document is invented.** The decisions were
  recorded in `AGENTS.md` and `REDESIGN-PLAN.md` at the time; these specs point
  at them rather than paraphrasing them into a fictional history.
- `partners-page` is **not** modified. Its 2026-08-10 correction reads
  accurately against the shipped code, and the artwork that has since landed is
  exactly the `logo`-field mechanism it already specifies.

## Capabilities

### New Capabilities
- `seo-and-crawlability`
- `gallery`

## Impact

Documentation only: two new files under `openspec/specs/`, and `BACKLOG.md`
updated to retire the "shipped and NOT yet spec'd" note.
