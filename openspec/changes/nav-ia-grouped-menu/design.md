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

**Motion.** Desktop panels fade and drop 6px on enter over 180ms using
framer-motion inside `Content`, and their rows follow 40ms apart; under
`useReducedMotion` the panel and rows render at rest.
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

**Richer panels (revision).** Each row is a lucide icon in a square `--rule`
tile (ink, stroke 1.5, never the accent), the item name, and one `--muted`
line paraphrased from the route's `ROUTE_SEO` description so the panel never
claims more than the page. The link is `aria-labelledby` the name and
`aria-describedby` the line, so screen readers hear a short name. The active
row gets a `--band` fill plus a 2px `--ink` left edge. The About panel is
anchored to its trigger's right edge (`align: 'end'`) so it stays inside a
768px viewport.

## Risks / Trade-offs

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
