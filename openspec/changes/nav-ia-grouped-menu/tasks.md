# Tasks

## 1. Setup

- [x] 1.1 Add `@radix-ui/react-navigation-menu` and verify it appears in `package.json` and `npm ls @radix-ui/react-navigation-menu` resolves

## 2. Grouped navigation

- [x] 2.1 Replace `NAV_LINKS` with the grouped `NAV_ITEMS` table (Discover, Collaborate, About; no Membership link) and verify every href is a `<Route>` in `src/App.tsx`
- [x] 2.2 Build desktop groups on Radix Navigation Menu (Root as `div`, inline Content, `Link asChild` around `NavLink`, controlled value reset on route change, mouse click does not close an open trigger) and verify `npx tsc -b` passes
- [x] 2.3 Apply group active state, `FOCUS_RING`, radius 0 and the reduced-motion aware panel entrance, and verify in a browser that Escape returns focus to the trigger and `/blog/<slug>` marks Discover active
- [x] 2.4 Rebuild the mobile panel from the same table with uppercase muted group labels, keep the framer-motion height/opacity animation with a zero-duration reduced-motion path, and verify at 375px that all links are reachable without nested taps
- [x] 2.5 Update the DESIGN.md Navigation section to record the grouped IA and verify it no longer describes a flat list

## 3. Consent banner copy (Option B)

- [x] 3.1 Change the banner body and button labels to the locked Option B strings in `src/components/ConsentBanner.tsx`, keeping `decide()`, region role and hydrate guard, and verify `src/lib/analytics.ts` has no diff
- [x] 3.2 Sync the two quoted "Allow analytics" labels in `src/pages/PrivacyPolicy.tsx` to "OK" and verify `grep "Allow analytics" src` returns nothing

## 4. Verification

- [x] 4.1 Run `npm test`, `npx tsc -b`, eslint on touched files, and `npm run build` (prerender) and verify all pass

## 5. IA revision (Events, Resources, Gallery, About)

- [x] 5.1 Replace Discover and Collaborate in `NAV_ITEMS` with Events (Meetups, Workshops), Resources (Library, Blogs), Gallery, and About (About IFN, Sponsors, Partners), and verify every href is a `<Route>` in `src/App.tsx`
- [x] 5.2 Give each panel row a lucide icon, name and one line description sourced from `ROUTE_SEO`, with the name as accessible name and the line as description, and verify with `npx tsc -b`
- [x] 5.3 Stagger row entrance after the panel, at rest under reduced motion, and pin the About panel to the trigger's right edge
- [x] 5.4 Render the same table on mobile (Events, Resources, About labels, Gallery row, pill last) with no nested disclosure
- [x] 5.5 Update the DESIGN.md Navigation section and the Footer comment that named the old Collaborate nav group
- [x] 5.6 Run `npm test`, `npx tsc -b`, eslint on touched files, `npm run build`, and a headless check that the bar reads Events, Resources, Gallery, About plus the action with no Discover or Collaborate

## 6. Mega panel (Radix Viewport and Indicator)

- [x] 6.1 Render the Root onto the desktop cluster and add one `NavigationMenu.Viewport` hanging from its right edge, 40rem capped at `100vw - 3rem`, `box-content` so the border does not clip measured content, and verify with a headless check that the panel stays inside a 768px viewport
- [x] 6.2 Add `NavigationMenu.Indicator` as a 2px `--ink` bar on the panel's top edge, drop `relative` from Items so offsets measure against the track, and verify it moves between triggers
- [x] 6.3 Add `nav-*` keyframes (Viewport scale and fade, `data-motion` slides, Indicator fade), transform and opacity only, all `motion-safe:`, and verify panels still open and close under reduced motion
- [x] 6.4 Rebuild panel content as a group label, intro line and one row of equal height icon tiles (hover inverts the icon tile, arrow slides in, active tile has a top edge), remove `align`, and add icon tiles to mobile rows without nesting
- [x] 6.5 Reverse "No Radix Viewport" in design.md and update the DESIGN.md Navigation section
- [x] 6.6 Run `npm test`, `npx tsc -b`, eslint on touched files, `npm run build`, and a headless check of the bar entries, keyboard open, Escape focus return, hover then click, and route change close
