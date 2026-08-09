## Why

`JoinModal` and `/api/join` are already live, but the flow has no written contract — and writing one surfaces a real gap: `join.ts` performs no server-side validation at all, unlike its sibling endpoints (`contact.ts`, `event-signup.ts`). This retroactive spec documents current behavior including that gap, so it's tracked rather than silently discovered again later.

## What Changes

No code changes. Establishes `join-flow` as a tracked capability with its current behavior as the baseline, and records the missing-validation gap as a known risk for a future change.

## Capabilities

### New Capabilities
- `join-flow`: The Join modal (name/email/linkedin/stage) and its `/api/join` backend.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/components/JoinModal.tsx`, `netlify/functions/join.ts`.
