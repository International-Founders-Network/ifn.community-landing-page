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

**No Radix Viewport.** Without a `Viewport`, each `Content` renders inline in
its `Item` and we position it absolutely under the trigger. A shared viewport
would animate size between panels, which is more motion than two short lists
need.

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

**Motion.** Desktop panels fade and drop 4px on enter over 150ms using
framer-motion inside `Content`; under `useReducedMotion` they render at rest.
The mobile panel keeps its height/opacity animation; under reduced motion the
transition duration is 0. No new animation library.

**Active state.** A trigger renders in the active treatment (`font-semibold
text-ink`) when any child route matches `pathname` exactly or as a prefix
(`/blog/:slug` keeps Discover active). Child links are `NavLink`s wrapped in
Radix `Link asChild`, so `aria-current="page"` comes from React Router.

**Mobile structure.** Group labels are plain uppercase muted text above a
left-ruled list, the existing Collaborate treatment applied to Discover too.
About is a plain row after the groups. No nested disclosure.

## Risks / Trade-offs

- [Radix adds a visually hidden focus proxy next to an open trigger] → It is
  part of Radix's Tab order handling and is not announced; accepted.
- [Hover-open can feel twitchy] → Radix default 200ms open delay and 150ms
  close delay kept.
- [Privacy policy copy is otherwise out of scope] → Only the two quoted button
  labels change, so the policy keeps naming real buttons.

## Migration Plan

Ship as a normal PR. Rollback is a revert; no data or storage changes. Existing
stored consent choices are unaffected because the storage key and values do
not change.
