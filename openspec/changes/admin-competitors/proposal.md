# Proposal

## Why

Venkat needs an internal competitive-landscape board for Austin peer communities vs IFN. Research delivered an 18-row public-source board; it should live behind the existing Google-allowlist `/admin` gate (same as Roadmap), not on a public marketing route.

## What Changes

- Add static typed seed `src/data/competitorsData.ts` mapped from IFN Research `austin-competitors-board.json` (18 rows). All seed rows `status: 'draft'`. No invented metrics.
- Extend `/admin` with a **Competitors** tab (searchable table + link-outs), modeled on RoadmapPanel / submission search.
- Keep `/admin` noindex; no public route, no nav link, no sitemap entry. Never import competitors data from public pages.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `admin-dashboard`: add static Competitors tab gated by existing Google allowlist session; still no public surface.

## Impact

Affected: `src/pages/Admin.tsx`, new `src/data/competitorsData.ts`, OpenSpec change artifacts. Auth/Netlify/SEO for `/admin` unchanged. Branch `site/admin-competitors`; **do not merge** without Venkat preview approve.
