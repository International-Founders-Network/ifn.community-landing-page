## Why

The Contact page and `/api/contact` are already built and validated, but undocumented. This retroactive spec establishes the baseline so future changes to the form or its backend have a contract to check against.

## What Changes

No code changes. Establishes `contact-flow` as a tracked capability with its current, already-shipped behavior as the baseline requirements.

## Capabilities

### New Capabilities
- `contact-flow`: The Contact page form and its `/api/contact` backend.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Contact.tsx`, `netlify/functions/contact.ts`.
