## Context

`Home.tsx` composes eight sections in a fixed order; `FounderStory`, `EventsPreview`, and `ResourcesPreview` are lazy-loaded. The page reads `openJoinModal` from `useOutletContext` (set up by the root `Layout`) to trigger the shared Join modal from any CTA.

## Goals / Non-Goals

**Goals:**
- Capture the current section composition and CTA wiring as the durable spec of "what the Home page does."

**Non-Goals:**
- Not covering `src/pages/ExperimentalHero.tsx` — it's a separate, unlinked route (no nav entry) used for design review, not part of the canonical Home experience. It gets its own future spec only if it's promoted to production.
- Not specifying visual/animation details (Framer Motion transitions, exact copy) — those change often and aren't contract-worthy; only structural/behavioral requirements are in scope.

## Decisions

- Treated as a single capability rather than one per section, since the sections have no independent behavior outside this composition (they're not routed or reused elsewhere as standalone features).

## Risks / Trade-offs

- Low risk — purely descriptive of stable, already-shipped behavior. The main risk is drift: if a section is added/removed/reordered in code without updating this spec, the spec silently goes stale. No automated sync exists yet (see `/opsx:sync`, usable manually going forward).
