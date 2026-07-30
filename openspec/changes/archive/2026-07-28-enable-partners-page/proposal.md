## Why

`/partners` has been a static "Coming soon" stub since before this repo adopted OpenSpec (tracked under the `placeholder-pages` capability). It's the page a prospective sponsor gets pointed to, and per the `EXECUTION-PLAN.md` in the sibling `ifn-strategy` repo, shipping a working `/partners` page is a Week-1/Week-2 v2 execution item — it needs to exist before sponsor outreach can credibly point anywhere.

## What Changes

Build a real `/partners` page listing IFN's current partners: Station Austin (venue partner), Reuneo (speed-networking partner), and Yani Partners (business & technology partner — the founder's own fractional CTO/consulting company, listed plainly as such, not as an arm's-length sponsor). Text-only for now — no logo image assets exist yet for any of the three.

## Capabilities

### New Capabilities
- `partners-page`: the `/partners` route displaying IFN's partner roster.

### Modified Capabilities
- `placeholder-pages`: `/partners` is removed from the list of intentionally-unbuilt routes, since it's no longer one.

## Impact

Affected code: `src/pages/Partners.tsx` (real content, replacing the stub), new `src/data/partnersData.ts` (partner roster, following the existing `resourcesData.ts` pattern).
