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

## Revision 2 (mega panel)

The IA above stays locked. The desktop menus now use Radix Navigation Menu's
shared `Viewport` and `Indicator`, reversing the first design's "No Radix
Viewport" call: one mega panel under the bar holds every menu, panels slide
between menus in the direction of travel, and an ink indicator travels under
the open trigger. Each panel gains a group label and intro line above one row
of icon tiles. Mobile rows gain the same icon tile, and stay flat. No new
dependency; a few CSS keyframes are added to `src/index.css`.

## Revision 3 (locked IA, Kyra and Venkat)

Feedback on PR #38 locked the IA again, and this revision supersedes the About
menu above:

| Top level | Kind | Contents |
| --- | --- | --- |
| Events | menu | Meetups `/events`, Accountability Pod `/accountability-pods`, Workshops `/workshops` |
| Resources | menu | Library `/resources`, Blogs `/blog` |
| Gallery | link | `/gallery` |
| Collaborate | menu | Sponsors `/sponsors`, Partners `/partners` |
| About | link | `/about` |
| Become a member | pill action | `/membership` |

- Sponsors and Partners move out of About into a Collaborate menu, which now
  matches the footer's Collaborate group. About is a plain link again.
- Events gains Accountability Pod. `/accountability-pods` is new: a ComingSoon
  stub like `/mentorship` and `/chapters`, non-indexable, with a 200 rewrite
  and `noindex, follow` headers, so the nav entry is never a dead link. The
  copy says what a pod is and that it is not open for signup; it claims no pod,
  count or schedule.
- `/workshops` already exists and is only linked. `Workshops.tsx` is untouched.
- Panels drop the lucide icon tiles for photos reused from the gallery frames
  in `public/photos/`. The Events panel is two columns: a feature photo with
  the group intro on the left, a vertical list of its three rows on the right.
  Resources and Collaborate set their two rows as photo cards under the intro.
- Radix `Viewport` and `Indicator` stay. The panel widens from 40rem to 44rem,
  still capped at `100vw - 3rem`.
- Still no Discover and no separate Membership link.


## Revision 4 (Kyra and Venkat feedback on PR #38)

Menus felt heavy with gallery photos on every row. Visuals only; IA unchanged.

- Keep the Events left feature photo (one hero max for the whole nav).
- Replace gallery photo thumbs on Events list rows, Resources cards,
  Collaborate cards, and mobile row thumbs with the IFN period-mark on soft
  tiles (band / paper / ink wash / accent wash). Drawn inline from the brand
  master geometry so it follows theme tokens.
- No lucide icon tiles as the primary visual. Workshops page and the
  `/accountability-pods` stub stay untouched. Radix Viewport and Indicator stay.

## Revision 5 (Venkat via Kyra, PR #38)

The mark tiles all looked the same, and the nav wanted a little more
photography, but selectively. Visuals only; IA unchanged.

- Each row gets its own composition of the period-mark (crop, scale, offset,
  rotation, optional soft ink geometry) on top of its ground, so no two tiles
  share a drawing.
- Keep the Events feature photo. Add a Collaborate feature photo
  (`aug-networking`), using the Events stack layout.
- Give the Library card on the Resources grid a photo (`feb-slide`) in place
  of its mark tile. Blogs and every other row stay marks; mobile keeps marks
  throughout.

## Revision 6 (PR #38 feedback)

The period-mark crops still did not read as distinct destinations, and the
Collaborate list looked loose next to Events. Visuals only; IA unchanged.

- Drop every period-mark tile and composition. The mark stays in the wordmark,
  not in the menu.
- Bring back the lucide ink tile from revision 2 wherever a row has no photo,
  with a different icon per row: Meetups `Users`, Accountability Pod `Target`,
  Workshops `Presentation`, Library `BookOpen` (mobile), Blogs `PenLine`,
  Sponsors `Award`, Partners `Handshake`. 40px on desktop, 32px on mobile,
  stroke 1.5, inverting to an `--ink` fill on hover, focus and the current
  route.
- Photos only on three slots: the Events feature (`sep-group`), the
  Collaborate feature (`aug-networking`) and the Library card (`feb-slide`).
  No photo on any other row, and mobile uses icons only.
- Collaborate matches Events exactly: same feature grid, and stack rows share
  the column's height evenly, so two rows fill it the way three do instead of
  floating in the middle.
- Workshops page and the `/accountability-pods` stub stay untouched. Radix
  Viewport and Indicator stay.

## Revision 7 (Venkat via Kyra, PR #38)

Drop the Library photo card (`feb-slide`) from the Resources panel. Visuals
only; IA unchanged.

- Library and Blogs are both lucide icon stack rows (`BookOpen`, `PenLine`),
  the same layout as the Events and Collaborate stack rows (flex-1, icon tile,
  name, description, left border-l-2 active edge, ArrowRight).
- Resources uses the stack layout, consistent with Events and Collaborate rows
  rather than a two-across grid of cards.
- Photos remain on two feature slots only: Events (`sep-group`) and Collaborate
  (`aug-networking`). `feb-slide` is no longer used in the nav.
- Library `BookOpen` is now desktop and mobile (revision 6 was mobile-only).
- Dead code removed: `photo` field on `NavChildItem`, `layout: 'grid'` branch,
  `HOVER_SCALE` constant, photo-card rendering path.

## Revision 8 (Venkat via Kyra, PR #38)

Resources submenu should be horizontal — Library and Blog side by side in a
2-column grid, not a vertical stack. Visuals only; IA unchanged.

- Resources panel renders Library and Blogs as a horizontal 2-column grid
  instead of a vertical stack. Both keep their lucide icon tiles (`BookOpen`,
  `PenLine`).
- Grid cards are vertical: icon tile on top, name and description stacked
  below, border-t-2 on hover/active/current (not border-l-2). No ArrowRight.
- Events and Collaborate remain stack layout (feature photo on left, vertical
  rows on right with icon tile, name, description, border-l-2, ArrowRight).
- `PanelRows` component restored `layout` prop (`'stack' | 'grid'`). Events and
  Collaborate pass `layout="stack"`, Resources passes `layout="grid"`.
- Photos remain Events (`sep-group`) and Collaborate (`aug-networking`)
  features only. No Library photo.

## Capabilities

### New Capabilities
- `site-navigation`: the fixed primary bar, its grouped IA, desktop menus,
  mobile panel, active state and keyboard behaviour.
- `analytics-consent`: the bottom consent banner, its copy, its two
  equal-weight choices and when it is shown.

### Modified Capabilities
None. No existing spec describes the nav or the banner.

## Impact

- `src/components/Navbar.tsx` (rewritten around Radix Navigation Menu, then
  its Viewport and Indicator, then the revision 3 IA, then revision 4 mark
  tiles, then revision 5 varied mark compositions and selective photos).
- `src/index.css` (`nav-*` keyframes for the Viewport, panels and Indicator).
- `src/components/Footer.tsx` (one code comment that named the old Collaborate
  nav group).
- `src/components/ConsentBanner.tsx` (strings only).
- `src/pages/PrivacyPolicy.tsx` (two quoted button labels).
- `DESIGN.md` Navigation section (records the grouped IA).
- New dependency: `@radix-ui/react-navigation-menu`. No new animation library;
  framer-motion stays.
- Revision 3 adds one route: `src/pages/AccountabilityPods.tsx`, its lazy
  `<Route>` in `src/App.tsx`, a non-indexable `ROUTE_SEO` entry and a
  `NOINDEX_PATHS` entry in `src/data/seo.ts`, and a 200 rewrite plus
  `noindex, follow` headers in `netlify.toml`. It is not prerendered and not
  in the sitemap, like the other placeholders.
- No new image assets; the panels reuse existing gallery derivatives.
- `src/lib/analytics.ts` untouched.
