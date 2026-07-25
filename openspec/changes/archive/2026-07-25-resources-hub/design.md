## Context

`Resources`/`ResourcesPreview` render a segment/stage-tabbed, tag-filterable, searchable directory driven by `RESOURCES_DATA`. A trailing script in `resourcesData.ts` auto-marks only the first 3 resources per segment as live (`isComingSoon = false`); the rest are flagged `isComingSoon = true` regardless of content readiness — it's a blunt positional heuristic, not deliberate per-resource curation.

## Goals / Non-Goals

**Goals:**
- Document the current filter/search behavior and the phased-content status.

**Non-Goals:**
- Not authoring the missing Phase 2-4 content in this change.

## Decisions

- Treated as one capability (page + data layer), since the data layer has no behavior independent of this page.

## Risks / Trade-offs

- The "first 3 per segment are live" flag is a positional default baked into data, not a curation decision — worth a deliberate human pass rather than assuming position implies readiness.
