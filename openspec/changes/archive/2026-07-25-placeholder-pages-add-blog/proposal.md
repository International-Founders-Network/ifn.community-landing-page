## Why

`Blog.tsx` (`/blog`) is the identical "Coming soon" stub as the other seven routes covered by `placeholder-pages`, but it was missed during the original catalog pass and left out of that spec. This corrects the omission.

## What Changes

No code changes. Updates the `placeholder-pages` capability's requirement to include `/blog` in its list of covered routes.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `placeholder-pages`: the "Unbuilt routes render a placeholder rather than error" requirement now also covers `/blog`.

## Impact

Documentation only. Affected code (unchanged): `src/pages/Blog.tsx`.
