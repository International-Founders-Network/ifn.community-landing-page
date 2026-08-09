## Why

About, Privacy Policy, Terms and Conditions, and Code of Conduct are stable, fully-static pages with no data fetching. They're grouped into one lightweight capability rather than four, since none has independent behavior worth separate acceptance criteria.

## What Changes

No code changes. Establishes `legal-static-pages` as a tracked capability. Also records a real bug found while cataloging: `About.tsx`'s "Apply to Join" button has no click handler.

## Capabilities

### New Capabilities
- `legal-static-pages`: About, Privacy Policy, Terms and Conditions, Code of Conduct.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/{About,PrivacyPolicy,TermsAndConditions,CodeOfConduct}.tsx`.
