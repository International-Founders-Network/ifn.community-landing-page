# Spec Delta

## Purpose

The fixed primary navigation bar: which routes it exposes, how they are grouped,
and how visitors reach them by pointer, keyboard and touch on desktop and mobile.

Revision 3 (Kyra and Venkat feedback on PR #38) locks the IA below: Events
gains Accountability Pod, Sponsors and Partners move out of About into a
Collaborate menu, and About becomes a plain link. Revision 4 keeps that IA and
trims panel visuals to abstract brand marks (period-mark on soft tiles).
Revision 5 varies each row's mark composition and allows three selective
gallery photos: the Events and Collaborate feature columns and the Library
card. The requirements are written against that final state.

## ADDED Requirements

### Requirement: Grouped primary navigation
The primary navigation SHALL show exactly these top-level entries, in this
order: an "Events" group, a "Resources" group, a "Gallery" link to `/gallery`,
a "Collaborate" group, an "About" link to `/about`, and a "Become a member"
action linking to `/membership`. The Events group SHALL contain Meetups
`/events`, Accountability Pod `/accountability-pods` and Workshops
`/workshops`, in that order. The Resources group SHALL contain Library
`/resources` and Blogs `/blog`. The Collaborate group SHALL contain Sponsors
`/sponsors` and Partners `/partners`, in that order, matching the footer's
Collaborate group. About SHALL be a link, not a group. The navigation SHALL NOT
contain a "Discover" entry or a separate "Membership" link, and SHALL NOT link
to any route that `src/App.tsx` does not define.

#### Scenario: Desktop bar entries
- **WHEN** a visitor loads any page at a viewport of 768px or wider
- **THEN** the bar shows Events, Resources, Gallery, Collaborate, About and the "Become a member" action on one line, and no other top-level entries

#### Scenario: Sponsors and Partners reachable from the bar
- **WHEN** a visitor opens the Collaborate group
- **THEN** it lists Sponsors and Partners

#### Scenario: About is a link
- **WHEN** a visitor activates About in the bar
- **THEN** `/about` renders and no panel opens

#### Scenario: Every destination exists
- **WHEN** each nav destination is requested from the built site
- **THEN** each resolves to a real route and none renders the not-found page

### Requirement: Accountability Pods placeholder
`/accountability-pods` SHALL render a ComingSoon placeholder that describes
accountability pods as small peer groups of founders who check in on goals
regularly and states that they are not open for signup. It SHALL NOT claim any
pod exists, any member count or any schedule. It SHALL be listed in
`ROUTE_SEO` as non-indexable and in `NOINDEX_PATHS`, SHALL be served with a
200 rewrite ahead of the 404 catch-all, and SHALL send
`X-Robots-Tag: noindex, follow` on the bare path and on `/accountability-pods/*`.

#### Scenario: Placeholder is reachable and not indexed
- **WHEN** a crawler requests `/accountability-pods` on the deployed site
- **THEN** it receives 200 with `X-Robots-Tag: noindex, follow`, and the path is absent from `sitemap.xml`

### Requirement: Desktop group menus
On desktop, each group SHALL open a panel listing its links when the visitor
hovers or clicks its trigger, or activates it with Enter or Space. Each panel
link SHALL show a decorative leading visual, the item name and a one line
description, and SHALL expose the item name as its accessible name. The leading
visual SHALL be the IFN period-mark on a soft tile, in a composition (crop,
scale, offset or rotation) that no other row in the nav shares, except that the
Library card on desktop SHALL show a gallery photo instead. Panel links SHALL
NOT lead with lucide icon tiles as the primary visual. The Events and
Collaborate panels SHALL be two columns: a feature photo carrying the group
intro on the left, and the group's links as a vertical list on the right. No
other panel region SHALL use a gallery photo, and mobile rows SHALL use marks
only. Escape SHALL
close an open panel and return focus to its trigger. Every group's panel SHALL
render in one shared panel under the bar that lies wholly inside the viewport
at 768px and wider, and an indicator SHALL mark the open trigger. Clicking outside SHALL
close it. Following a link or any route change SHALL close it. A mouse click on
a trigger whose panel is already open SHALL NOT close it. Triggers SHALL expose
`aria-expanded`, and the panels SHALL contain plain links, not menu items.

#### Scenario: Keyboard open and Escape
- **WHEN** a keyboard user focuses the Events trigger, presses Enter, then presses Escape
- **THEN** the panel opens showing Meetups, Accountability Pod and Workshops, then closes, and focus is on the Events trigger

#### Scenario: Selective photos, varied marks
- **WHEN** a visitor opens Events, Resources and Collaborate in turn
- **THEN** Events and Collaborate each show one feature photo on the left with mark tiles on their rows, Resources shows a photo on the Library card and a mark tile on Blogs, and no two mark tiles share a composition

#### Scenario: Shared panel and indicator
- **WHEN** a visitor on a 768px viewport opens Events and then moves to Collaborate
- **THEN** both open in the same panel, the panel stays inside the viewport, and the indicator moves from under Events to under Collaborate

#### Scenario: Hover then click
- **WHEN** a mouse user hovers Events until its panel opens and then clicks the trigger
- **THEN** the panel stays open

#### Scenario: Route change closes the panel
- **WHEN** a visitor opens Collaborate and chooses Partners
- **THEN** `/partners` renders and no panel is open

### Requirement: Active section indication
A link to the current route SHALL carry `aria-current="page"` and the active
treatment (heavier weight and ink colour). A group trigger SHALL show the
active treatment when the current route equals, or is nested under, one of its
children.

#### Scenario: Nested blog route
- **WHEN** a visitor is on `/blog/some-post`
- **THEN** the Resources trigger shows the active treatment

#### Scenario: Active child link
- **WHEN** a visitor on `/events` opens Events
- **THEN** the Meetups link has `aria-current="page"`

### Requirement: Mobile navigation parity
Below 768px, a menu button SHALL toggle a panel that lists the same entries as
desktop, in the same order: each group as an uppercase muted label followed by
its links, Gallery and About as plain links, and the "Become a member" action
last. The panel SHALL NOT nest a
disclosure inside it. Escape SHALL close the panel and return focus to the menu
button, and a route change SHALL close it. The panel SHALL animate open and
closed, and SHALL NOT animate when the visitor prefers reduced motion. Desktop
panels and their rows SHALL likewise render at rest under reduced motion.

#### Scenario: Mobile groups
- **WHEN** a visitor on a 375px viewport opens the menu
- **THEN** they see an "Events" label with Meetups, Accountability Pod and Workshops, a "Resources" label with Library and Blogs, a Gallery link, a "Collaborate" label with Sponsors and Partners, an About link, and the "Become a member" action, all without further taps

#### Scenario: Mobile Escape
- **WHEN** the mobile panel is open and the visitor presses Escape
- **THEN** the panel closes and focus is on the menu button

### Requirement: Bar visual contract
The bar SHALL remain fixed, 64px tall plus a 1px rule, solid paper colour, with
no scroll listener and no height change on scroll. Nav links and group
triggers SHALL have square corners; only the action SHALL be a pill. Every
focusable in the bar SHALL show the two-layer focus ring (paper inner, ink
outer).

#### Scenario: Focus ring on a group link
- **WHEN** a keyboard user tabs into an open Events panel
- **THEN** the focused link shows the two-layer paper and ink ring
