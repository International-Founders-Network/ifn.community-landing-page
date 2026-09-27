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

- Group the primary nav into four top-level entries plus the action. Every
  route below already exists in `src/App.tsx`; no page is added.

  | Top level | Contents |
  | --- | --- |
  | Events (menu) | Meetups `/events`, Workshops `/workshops` |
  | Resources (menu) | Library `/resources`, Blogs `/blog` |
  | Gallery (link) | `/gallery` |
  | About (menu) | About IFN `/about`, Sponsors `/sponsors`, Partners `/partners` |
  | Action (pill) | Become a member `/membership` |

- Remove the separate "Membership" nav link. The "Become a member" action
  already covers that intent (one label per intent).
- Desktop menus move from the hand-rolled Collaborate disclosure to
  `@radix-ui/react-navigation-menu`, which supplies hover/click open, Escape
  with focus return, outside-click dismissal and arrow-key movement. Each
  panel row shows a lucide icon, the item name and a one line description.
- Mobile panel lists the same groups as flat sections under uppercase muted
  labels (no nested disclosures), keeps the framer-motion open/close animation,
  and respects reduced motion.
- Consent banner: copy only. Body becomes "Optional analytics help us improve
  the site. Decline anytime. Privacy policy." Buttons become "No thanks"
  (decline) and "OK" (accept). Behaviour is unchanged.
- The two places in the Privacy policy that quote the old accept label
  ("Allow analytics") are synced to "OK" so the policy does not name a button
  that no longer exists. No other policy text changes.

## Revision (after PR #36)

PR #36 shipped this change with a Discover group (Events, Workshops, Gallery,
Blog, Resources) and a Collaborate group (Sponsors, Partners). The IA was then
locked as above: Events and Resources menus, Gallery on its own, and Sponsors
and Partners under an About menu so they stay reachable from the bar. The
alternative of leaving Sponsors and Partners in the footer only was
considered and not taken. Discover and Collaborate are gone from the nav. The
panels also gained icons, descriptions and a staggered entrance. The consent
banner requirements are unchanged by the revision.

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
- `src/components/Footer.tsx` (one code comment that named the old Collaborate
  nav group).
- `src/components/ConsentBanner.tsx` (strings only).
- `src/pages/PrivacyPolicy.tsx` (two quoted button labels).
- `DESIGN.md` Navigation section (records the grouped IA).
- New dependency: `@radix-ui/react-navigation-menu`. No new animation library;
  framer-motion stays.
- No route, sitemap, prerender or SEO change. `src/lib/analytics.ts` untouched.
