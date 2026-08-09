## Context

All seven routes share the identical stub pattern: a page title and a "Coming soon..." message, with zero data fetching, zero async state, zero loading logic.

## Goals / Non-Goals

**Goals:**
- State plainly, in one place, that these are placeholders by design — not partially-broken features.

**Non-Goals:**
- Not building out any of this content in this change.

## Decisions

- Grouped as one capability while all seven share the identical stub pattern. Split any individual page into its own capability once real content/behavior is built for it.

## Risks / Trade-offs

- `BACKLOG.md` currently describes Partners as having "a loading issue to investigate and fix" — this doesn't match the code, which has no loading logic to have a bug in. Likely either stale (referring to a since-reverted version) or conflating a route-transition Suspense flicker with the page itself. Corrected in the accompanying `BACKLOG.md` rewrite.
