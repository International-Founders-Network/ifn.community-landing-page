# Design

## Context

`Navbar.tsx` renders a flat `NAV_LINKS` array with one hand-rolled disclosure
(Collaborate) that wires its own Escape, outside-click and route-change close.
The bar is fixed, 64px, flat `--paper`, one `--rule` hairline, with a shared
two-layer `FOCUS_RING` (2px `--paper` inner, 2px `--ink` outer) and no scroll
listener. The mobile panel is a framer-motion `AnimatePresence` height/opacity
animation. See proposal.md for why the IA changes.

## Goals / Non-Goals

**Goals:**
- One data table (`NAV_ITEMS`) drives desktop and mobile, so they cannot drift.
- Accessible desktop menus without writing our own focus and dismissal logic.
- Keep every existing bar contract: 64px, radius 0 links, pill only for the
  action, `FOCUS_RING`, no scroll listener, route change closes everything.

**Non-Goals:**
- Footer IA (already has a Collaborate group; left as is).
- Sign-in or members.ifn.community links in the bar.
- Any change to consent behaviour, storage or `src/lib/analytics.ts`.

## Decisions

**Radix Navigation Menu over Headless UI.** Radix's Navigation Menu is built
for site navigation (links in panels, `aria-expanded` triggers, Escape returns
focus to the trigger, outside pointer dismisses, arrow keys move between
triggers, hover intent with open/close delays). Headless UI's `Menu` applies
`role="menu"`, which is wrong for navigational links, and its `Popover` would
leave hover intent and roving focus to us. Radix is also tree-shakable per
primitive, so the cost is one package.

**Radix Viewport and Indicator (reverses the earlier "No Radix Viewport").**
The first version rendered each `Content` inline in its `Item` and positioned
it by hand, on the grounds that a shared viewport was more motion than two
short lists need. The panels are no longer two short lists: they carry icon
tiles, an intro line and up to three destinations, and visitors move between
three menus. One shared `Viewport` now holds every panel, and an `Indicator`
marks the open trigger:

- Panels cross with Radix's `data-motion` (`from-start`, `from-end`,
  `to-start`, `to-end`) as a 32px directional slide plus fade, instead of one
  unmounting and the next mounting.
- The Indicator, a 2px `--ink` bar on the panel's top edge, travels between
  triggers, so the open menu is marked without a custom underline.
- The panel sits in one place at one size, which is what reads as a mega panel
  rather than three dropdowns.

The Root is rendered onto the whole desktop cluster (list plus action), and the
Viewport hangs from the cluster's right edge at the bar's bottom line, 40rem
wide and capped at `100vw - 3rem`, so it stays on screen at 768px without a
per-panel `align`. Its size comes from Radix's measured
`--radix-navigation-menu-viewport-*` variables and is not transitioned (width
and height are layout properties; MOTION_INTENSITY 4 animates transform and
opacity only). Tiles share a minimum height and each panel is one row of
tiles, so every panel measures the same and the switch never resizes. Items
are not `relative`, because the Indicator reads each trigger's `offsetLeft`
against the List's track. Open, close and focus handling stay Radix's; nothing
here is hand-built. No new dependency.

**Root rendered as a `div`.** Radix Root renders `<nav aria-label="Main">` by
default, but the bar is already `<nav aria-label="Main">`. `asChild` onto a
`div` with the label cleared avoids a nested duplicate landmark.

**Controlled value, reset on route change.** The open menu is controlled state
cleared during render when `pathname` changes (same pattern the file already
uses for the mobile panel), so a menu never stays open over the page it just
linked to. Radix `Link` also closes on select.

**Hover then click does not close.** Radix toggles on click, so a mouse user
who hovers a trigger open and then clicks it would close it. For mouse
pointers, a click on an already open trigger is ignored (the menu still closes
on pointer leave, outside click, Escape). Keyboard and touch clicks toggle
normally.

**Motion.** Radix unmounts the Viewport, Content and Indicator through
Presence, which waits for a CSS `animationend`, so their enter and exit are CSS
keyframes (`nav-*` in `src/index.css`), not framer-motion. The Viewport scales
0.98 to 1 from its top right corner and fades over 200ms, reversing over 140ms;
panels slide 32px between menus; the Indicator fades and its transform
transitions over 200ms. Every call site is `motion-safe:`, and the global
reduced motion rule flattens them regardless. Tiles inside a panel still follow
40ms apart with a 6px rise in framer-motion, at rest under `useReducedMotion`.
The mobile panel keeps its height/opacity animation; under reduced motion the
transition duration is 0. No new animation library.

**Active state.** A trigger renders in the active treatment (`font-semibold
text-ink`) when any child route matches `pathname` exactly or as a prefix
(`/blog/:slug` keeps Resources active; `/sponsors` keeps About active). Child links are `NavLink`s wrapped in
Radix `Link asChild`, so `aria-current="page"` comes from React Router.

**Mobile structure.** Group labels (Events, Resources, About) are plain
uppercase muted text above a left-ruled list. Gallery is a plain row between
Resources and About. No nested disclosure.

**Sponsors and Partners under About (revision).** About becomes a menu whose
first row is About IFN `/about`, followed by Sponsors and Partners. This keeps
both one click from the bar without a fifth top-level entry. The trigger is a
button, so `/about` is reached through its first row, the same as every other
group. Footer only was the alternative; it was rejected because it would drop
both pages out of the bar entirely.

**Richer panels (revision).** Each panel opens with the group label and one
intro line, then one row of tiles (two across for Events and Resources, three
for About). A tile is a lucide icon in a square `--rule` tile (ink, stroke 1.5,
never the accent), the item name, and one `--muted` line; the intro and the
lines are paraphrased from `ROUTE_SEO` so the panel never claims more than the
page. The link is `aria-labelledby` the name and `aria-describedby` the line,
so screen readers hear a short name. Hover and focus fill the tile with
`--band`, invert the icon tile to `--ink`, and slide in an arrow. The active
tile keeps the inverted icon tile and adds a 2px `--ink` top edge. Mobile rows
carry a smaller copy of the icon tile, still flat.

## Risks / Trade-offs

- [The shared panel is right aligned, so the Events panel does not start under
  the Events trigger] → The 40rem panel spans the whole cluster at every width
  from 768px up, so it always sits beneath every trigger, and the Indicator
  marks which one is open.
- [Indicator width snaps rather than animating] → Only its transform is
  transitioned, to stay within transform and opacity; a 2px bar's width change
  reads as part of the slide.

- [Radix adds a visually hidden focus proxy next to an open trigger] → It is
  part of Radix's Tab order handling and is not announced; accepted.
- [About is now a menu, so `/about` takes two actions from the bar instead of
  one] → Accepted to keep Sponsors and Partners in the bar; the footer still
  links About Us directly.
- [Hover-open can feel twitchy] → Radix default 200ms open delay and 150ms
  close delay kept.
- [Privacy policy copy is otherwise out of scope] → Only the two quoted button
  labels change, so the policy keeps naming real buttons.

## Migration Plan

Ship as a normal PR. Rollback is a revert; no data or storage changes. Existing
stored consent choices are unaffected because the storage key and values do
not change.
