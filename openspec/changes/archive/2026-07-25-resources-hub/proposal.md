## Why

The Resources Hub's page shell shipped as "Phase 1" per `BACKLOG.md`, with content rollout explicitly phased across months. This retroactive spec captures the current filter/search contract and the phased-content status precisely, so `BACKLOG.md` can point here instead of restating it in prose.

## What Changes

No code changes. Establishes `resources-hub` as a tracked capability, noting Phase 1 (shell) as complete and Phases 2-4 (per-segment content) as open.

## Capabilities

### New Capabilities
- `resources-hub`: The `/resources` page — audience/stage tabs, tag filtering, search — and its `resourcesData.ts` data layer.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/ResourcesHub.tsx`, `src/components/{Resources,ResourcesPreview}.tsx`, `src/data/resourcesData.ts`.
