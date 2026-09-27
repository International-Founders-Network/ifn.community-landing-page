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
