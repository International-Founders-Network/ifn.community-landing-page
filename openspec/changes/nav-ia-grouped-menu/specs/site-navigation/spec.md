# Spec Delta

## Purpose

The fixed primary navigation bar: which routes it exposes, how they are grouped,
and how visitors reach them by pointer, keyboard and touch on desktop and mobile.

## ADDED Requirements

### Requirement: Grouped primary navigation
The primary navigation SHALL show exactly these top-level entries, in this
order: a "Discover" group, a "Collaborate" group, an "About" link to `/about`,
and a "Become a member" action linking to `/membership`. The Discover group
SHALL contain Events `/events`, Workshops `/workshops`, Gallery `/gallery`,
Blog `/blog` and Resources `/resources`, in that order. The Collaborate group
SHALL contain Sponsors `/sponsors` and Partners `/partners`. The navigation
SHALL NOT contain a separate "Membership" link, and SHALL NOT link to any route
that `src/App.tsx` does not define.

#### Scenario: Desktop bar entries
- **WHEN** a visitor loads any page at a viewport of 768px or wider
- **THEN** the bar shows Discover, Collaborate, About and the "Become a member" action on one line, and no other top-level entries

#### Scenario: Every destination exists
- **WHEN** each nav destination is requested from the built site
- **THEN** each resolves to a real route and none renders the not-found page

### Requirement: Desktop group menus
On desktop, each group SHALL open a panel listing its links when the visitor
hovers or clicks its trigger, or activates it with Enter or Space. Escape SHALL
close an open panel and return focus to its trigger. Clicking outside SHALL
close it. Following a link or any route change SHALL close it. A mouse click on
a trigger whose panel is already open SHALL NOT close it. Triggers SHALL expose
`aria-expanded`, and the panels SHALL contain plain links, not menu items.

#### Scenario: Keyboard open and Escape
- **WHEN** a keyboard user focuses the Discover trigger, presses Enter, then presses Escape
- **THEN** the panel opens showing its five links, then closes, and focus is on the Discover trigger

#### Scenario: Hover then click
- **WHEN** a mouse user hovers Discover until its panel opens and then clicks the trigger
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
- **THEN** the Discover trigger shows the active treatment

#### Scenario: Active child link
- **WHEN** a visitor on `/events` opens Discover
- **THEN** the Events link has `aria-current="page"`

### Requirement: Mobile navigation parity
Below 768px, a menu button SHALL toggle a panel that lists the same entries as
desktop: each group as an uppercase muted label followed by its links, then
About, then the "Become a member" action. The panel SHALL NOT nest a
disclosure inside it. Escape SHALL close the panel and return focus to the menu
button, and a route change SHALL close it. The panel SHALL animate open and
closed, and SHALL NOT animate when the visitor prefers reduced motion.

#### Scenario: Mobile groups
- **WHEN** a visitor on a 375px viewport opens the menu
- **THEN** they see a "Discover" label with Events, Workshops, Gallery, Blog and Resources, a "Collaborate" label with Sponsors and Partners, an About link and the "Become a member" action, all without further taps

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
- **WHEN** a keyboard user tabs into an open Discover panel
- **THEN** the focused link shows the two-layer paper and ink ring
