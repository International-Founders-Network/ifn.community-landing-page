# Proposal

## Why

The primary nav carries eight items plus the action (Events, Membership,
Workshops, Collaborate, Resources, Blog, Gallery, About, then "Become a
member"). DESIGN.md says the bar is full at about five links plus the action
and must stay on one line at desktop, so the flat list has outgrown the bar.
Separately, the analytics consent banner copy was re-locked on 2026-09-26
(Option B in `ifn-copy/2026-09-26-analytics-consent-banner.md`): the bar should
not lead with the vendor name, and the detail belongs in the Privacy policy.

## What Changes

- Group the primary nav into three top-level entries plus the action. Every
  route below already exists in `src/App.tsx`; no page is added.

  | Top level | Contents |
  | --- | --- |
  | Discover (menu) | Events `/events`, Workshops `/workshops`, Gallery `/gallery`, Blog `/blog`, Resources `/resources` |
  | Collaborate (menu) | Sponsors `/sponsors`, Partners `/partners` |
  | About (link) | `/about` |
  | Action (pill) | Become a member `/membership` |

- Remove the separate "Membership" nav link. The "Become a member" action
  already covers that intent (one label per intent).
- Desktop menus move from the hand-rolled Collaborate disclosure to
  `@radix-ui/react-navigation-menu`, which supplies hover/click open, Escape
  with focus return, outside-click dismissal and arrow-key movement.
- Mobile panel lists the same groups as flat sections under uppercase muted
  labels (no nested disclosures), keeps the framer-motion open/close animation,
  and respects reduced motion.
- Consent banner: copy only. Body becomes "Optional analytics help us improve
  the site. Decline anytime. Privacy policy." Buttons become "No thanks"
  (decline) and "OK" (accept). Behaviour is unchanged.
- The two places in the Privacy policy that quote the old accept label
  ("Allow analytics") are synced to "OK" so the policy does not name a button
  that no longer exists. No other policy text changes.

## Capabilities

### New Capabilities
- `site-navigation`: the fixed primary bar, its grouped IA, desktop menus,
  mobile panel, active state and keyboard behaviour.
- `analytics-consent`: the bottom consent banner, its copy, its two
  equal-weight choices and when it is shown.

### Modified Capabilities
None. No existing spec describes the nav or the banner.

## Impact

- `src/components/Navbar.tsx` (rewritten around Radix Navigation Menu).
- `src/components/ConsentBanner.tsx` (strings only).
- `src/pages/PrivacyPolicy.tsx` (two quoted button labels).
- `DESIGN.md` Navigation section (records the grouped IA).
- New dependency: `@radix-ui/react-navigation-menu`. No new animation library;
  framer-motion stays.
- No route, sitemap, prerender or SEO change. `src/lib/analytics.ts` untouched.
