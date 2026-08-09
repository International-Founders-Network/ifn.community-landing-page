## Why

Careers, Chapters, Membership, Mentorship, Newsletter, Partners, and Playbooks are all intentionally-unbuilt "coming soon" stubs. Documenting this explicitly also corrects a stale mismatch in `BACKLOG.md`, which describes Partners as having "a loading issue" — the actual code has no async logic at all, so there's no loading bug to fix; it's simply not built yet.

## What Changes

No code changes. Establishes `placeholder-pages` as a tracked capability covering all seven stub routes, and corrects the `BACKLOG.md` Partners entry (handled in the `BACKLOG.md` rewrite that accompanies this spec adoption).

## Capabilities

### New Capabilities
- `placeholder-pages`: The seven routes that render a title and "Coming soon" with no data or async logic.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/{Careers,Chapters,Membership,Mentorship,Newsletter,Partners,Playbooks}.tsx`.
