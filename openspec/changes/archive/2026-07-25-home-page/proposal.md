## Why

The repo has no written spec for any existing feature — behavior only exists as code. This is a retroactive baseline: it documents the Home page as it exists in production today, so future changes have something concrete to diff against instead of re-deriving intent from `src/pages/Home.tsx` each time.

## What Changes

No code changes. Establishes `home-page` as a tracked capability with its current, already-shipped behavior as the baseline requirements.

## Capabilities

### New Capabilities
- `home-page`: The composed marketing landing page at `/` — Hero, ValueProps, HowItWorks, FounderStory, EventsPreview, ResourcesPreview, FAQ, FinalCTA, and the Join-modal CTA wiring shared across them.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (for reference, unchanged by this proposal): `src/pages/Home.tsx`, `src/components/{Hero,ValueProps,HowItWorks,FounderStory,EventsPreview,ResourcesPreview,FAQ,FinalCTA}.tsx`.
