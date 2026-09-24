## ADDED Requirements

### Requirement: Overflow after the hang is a subject-scale mosaic
The system SHALL place every gallery frame the authored hang does not claim
into a subject-scale mosaic that continues the hang's rhythm, rather than as
one full-measure solo row per frame.

Each overflow frame SHALL receive a deliberate size class derived from an
audited subject scale of `lg`, `md`, or `sm` (manifest field and/or editorial
mapping keyed by slot). The system SHALL NOT invent random column spans, and
SHALL NOT default every overflow frame to a full-measure solo cell.

Mosaic rows SHALL pack two or three cells where the scale sequence allows, and
MAY use a solo cell with an intentional void when a large subject stands alone.
Rows SHALL alternate top and bottom rail alignment. Asymmetry SHALL come from
grid geometry and whitespace (the Ragged Edge Rule), not from rules drawn on
photographs. Photographs remain the only texture.

Phone collapse for overflow SHALL use the same three size classes as the hang
(`BLEED`, `MEASURE`, `INSET`), declared in the same file, mapped from subject
scale rather than left as a uniform stack. Focus ring, hover edge, and row
reveal motion conventions SHALL match the hang. The header and first hang row
SHALL still render at rest (LCP guard).

Tile widths for overflow cells SHALL keep every mosaic cell at or above 1x
coverage against its CSS width at the desktop measure, or the build SHALL raise
the affected tiles. Byte and tile budget reporting SHALL remain honest: the
gallery tile budget is a full-scroll sum, not arrival cost.

#### Scenario: Visiting the gallery with hang and overflow frames
- **WHEN** a visitor navigates to `/gallery` and the pipeline ships more frames than the authored hang claims
- **THEN** the hang renders unchanged as unnamed highlights, and the remaining frames render as a subject-scale mosaic of unequal cells with voids and alternating rails, not as stacked full-measure solos

#### Scenario: Overflow on a phone viewport
- **WHEN** the gallery is viewed below 640px with overflow frames present
- **THEN** overflow frames collapse into `BLEED`, `MEASURE`, and `INSET` classes by subject scale, preserving hang rhythm rather than a uniform stack

#### Scenario: Subject scale is audited
- **WHEN** an overflow frame is assigned a mosaic size
- **THEN** that size comes from an audited `lg` / `md` / `sm` subject scale for that slot, not from a random or round-robin span

## MODIFIED Requirements

### Requirement: `/gallery` shows photographs from IFN's own meetups
The system SHALL render `/gallery` from `src/data/photos.generated.ts`, with no
data fetching and no loading state, as an authored composition rather than a
uniform grid.

The page SHALL NOT display dates, evening labels, volume chapters, or any
per-night or per-volume grouping. A set of dated evenings or volume chapters
reads as a claim that those evenings or volumes are all there have been, which
is false. The source filename survives only as an internal key tracing a frame
back to its original, and the build records the slot-to-source mapping as a
comment in the generated file so it never reaches a component at runtime.

The page SHALL NOT display captions. Alt text is a different object from a
caption and SHALL be present on every frame: it is invisible to a sighted reader
and is the only way a screen-reader user perceives that a photograph exists.

The composition SHALL keep an authored hang of highlight cells, then continue
with a subject-scale overflow mosaic for every remaining published frame.

#### Scenario: Visiting the gallery
- **WHEN** a visitor navigates to `/gallery`
- **THEN** the photographs render immediately with no loading state, no dates, no evening or volume grouping, and no captions

#### Scenario: Reading the gallery with a screen reader
- **WHEN** the page is read by assistive technology
- **THEN** every frame exposes hand-written alt text describing that photograph

#### Scenario: Overflow is not volume chapters
- **WHEN** Vol. 08 and Vol. 09 frames appear after the hang
- **THEN** they appear inside the subject-scale mosaic with no volume heading, date, or chapter label
