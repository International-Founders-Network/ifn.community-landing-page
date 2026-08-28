# gallery Specification

## Purpose
The `/gallery` route and the manifest-driven photo build that feeds it and the landing-page photographic slots.

> **Written after the fact, 2026-08-28.** This capability shipped without a
> `/opsx:propose` cycle, along with everything else between 2026-07-29 and
> 2026-08-28. These requirements were derived by reading the implementation, not
> by recovering an intent that was never written down — so they describe what
> ships, including where it falls short. Where the code has a known gap, the gap
> is stated as a gap rather than specified away. The decisions behind it were
> recorded at the time in `AGENTS.md` and `REDESIGN-PLAN.md`; this file points at
> them rather than inventing a history.

## Requirements
### Requirement: `/gallery` shows photographs from IFN's own meetups
The system SHALL render `/gallery` from `src/data/photos.generated.ts`, with no
data fetching and no loading state, as an authored composition rather than a
uniform grid.

The page SHALL NOT display dates, evening labels or any per-night grouping. A
set of dated evenings reads as a claim that those evenings are all there have
been, which is false. The source filename survives only as an internal key
tracing a frame back to its original, and the build records the slot-to-source
mapping as a comment in the generated file so it never reaches a component at
runtime.

The page SHALL NOT display captions. Alt text is a different object from a
caption and SHALL be present on every frame: it is invisible to a sighted reader
and is the only way a screen-reader user perceives that a photograph exists.

#### Scenario: Visiting the gallery
- **WHEN** a visitor navigates to `/gallery`
- **THEN** the photographs render immediately with no loading state, no dates, no evening grouping and no captions

#### Scenario: Reading the gallery with a screen reader
- **WHEN** the page is read by assistive technology
- **THEN** every frame exposes hand-written alt text describing that photograph

### Requirement: Published photographs are derived, never the originals
`scripts/build-photos.mjs` SHALL generate every published derivative from
`scripts/photos.manifest.json`, and the sources in `assets/photos-source/` SHALL
NOT be published.

Vite copies `public/` verbatim, so a source placed there ships; the originals are
roughly 41 MB and only the named derivatives belong in `dist/`.

Crop boxes in the manifest are expressed in SOURCE pixels. Each derivative's
width SHALL be chosen from the cell it occupies in the composition, on the rule
`tileWidth = max(cell tier, 640)`.

**The 640 floor under-serves a 2× phone by 16 px, and that is accepted rather
than rounded away.** Below a 640 px viewport every frame renders at the full
328 px container measure, which wants 656 px at DPR 2 — a 2.4% shortfall. Buying
it would add a fifth tier to every frame sitting on the floor.

#### Scenario: Building the photo derivatives
- **WHEN** `npm run photos` runs
- **THEN** each manifest entry produces its derivative and `src/data/photos.generated.ts` is rewritten

#### Scenario: Inspecting the published output
- **WHEN** `dist/` is searched for the source photographs
- **THEN** only the named derivatives are present

### Requirement: The manifest is the only place a frame is selected or excluded
Frame selection, crop and alt text SHALL live in `scripts/photos.manifest.json`.
Components SHALL NOT decide which photographs appear.

The manifest SHALL NOT record reasons beside frames that ship. A reason written
next to a published frame is a reason the next reader will try to act on; the
audit trail belongs in git history and `REDESIGN-PLAN.md`.

Participants consented to appearing in IFN marketing material (founder ruling,
2026-08-09). The venue's signage in these frames predates its rebrand from
Capital Factory to Station Austin — dated, not dishonest.

#### Scenario: Adding or removing a photograph
- **WHEN** a frame is added to or removed from the manifest and the build is re-run
- **THEN** the gallery and any landing slots change with no component edit
