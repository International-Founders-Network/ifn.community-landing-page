# Tasks

## 1. OpenSpec + route shell
- [x] 1.1 Complete proposal/design/specs/tasks (this change)
- [x] 1.2 Add `Workshops.tsx` and `Sponsors.tsx` pages using Container/Button/ButtonLink/Emphasis patterns and The Sign voice
- [x] 1.3 Wire routes in `App.tsx`; add `ROUTE_SEO` entries; update Navbar + Footer (Workshops, Sponsors, Gallery; demote Resources)

## 2. Conversion copy fixes
- [x] 2.1 Hero + FinalCTA + HowItWorks + Navbar: Luma primary, Become a member secondary; demote join-modal CTA
- [x] 2.2 Rewrite library claims in Membership, FAQ, structuredData Offer, benefits.json, pricing.generated.ts snapshot, ValueProps, ResourcesPreview, vite llms blurb, seo defaults
- [x] 2.3 Fix Hero H1: static accessible name; client-only carousel; remove Grow/Succeed slogan from H1
- [x] 2.4 Contact: honor `?intent=sponsor|workshops` message prefills

## 3. Brand hygiene
- [x] 3.1 Delete `public/logo.png` if present; confirm OG tags use `og-image.png`
- [x] 3.2 Partners page: optional cross-link to `/sponsors`

## 4. Verify and ship
- [x] 4.1 `npm run lint`, `npx tsc -b` / project typecheck, `npm test`
- [x] 4.2 Commit, push, `gh pr create` against main; report PR + Netlify preview; list ops deferrals
