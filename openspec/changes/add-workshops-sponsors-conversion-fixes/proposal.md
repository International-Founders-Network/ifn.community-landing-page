# Proposal

## Why

The 2026-09-24 critical audit found IFN.community converting like a brochure with false product claims: the loudest CTA opens a lead modal that does not email anyone, membership sells a "full founder resource library" that has zero published guides, `/workshops` and `/sponsors` 404, Gallery is buried, and the prerendered H1 concatenates carousel words into crawler garbage. This change ships the conversion-first page + copy wave so paid and RSVP paths match what actually exists.

## What Changes

- Add `/workshops` — honest interest + member-fit framing (office hours / practical sessions); no invented dates, prices, or instructors; clear paths to Luma RSVP and `/membership`.
- Add `/sponsors` — distinct from `/partners`; audience facts (100–300), meetup cadence, deliverable menu, tier structure without public dollar amounts ("packages start on request"); CTA to `/contact?intent=sponsor`.
- Wire both into `App.tsx`, `ROUTE_SEO` (sitemap/prerender/llms), Navbar, Footer.
- Nav IA (F12): add Workshops, Sponsors, Gallery; demote Resources to footer/secondary; keep `/partners` for Station/Reuneo/Yani collaborators.
- CTA hierarchy (F01/F07): primary home/events CTAs toward Luma RSVP; secondary Become a member → `/membership`; demote "Join the community" join-modal as the loudest CTA.
- Stop selling a shipped library (F02): rewrite membership copy, Offer JSON-LD, FAQ, `llms.txt`, home resources strip to "in progress / first access when published".
- Fix prerendered H1 carousel garbage (F06); drop "Grow and Succeed" slogan weight where touched (F18).
- Delete retired `public/logo.png` if still present (F16); confirm OG uses `og-image.png`.

## Capabilities

### New Capabilities
- `workshops-page`: Public `/workshops` conversion page for workshop interest and member practical sessions.
- `sponsors-page`: Public `/sponsors` page for category sponsors/partners-who-pay, distinct from collaborator `/partners`.

### Modified Capabilities
- `home-page`: CTA hierarchy and H1 accessibility/prerender behavior; resources strip honesty.
- `membership-page`: Benefit copy and Offer claims must not assert a shipped full resource library.
- `seo-and-crawlability`: New indexable routes; `llms.txt` / default descriptions stop claiming a published library; H1 prerender integrity.
- `partners-page`: Clarify boundary vs `/sponsors` (collaborators vs paid sponsorship).

## Impact

- New pages under `src/pages/`; routes in `App.tsx`; nav/footer; `src/data/seo.ts`; `src/data/structuredData.ts`; membership/FAQ/home copy surfaces; `benefits.json` (+ committed `pricing.generated.ts` snapshot); delete `public/logo.png`.
- Out of scope (document in PR): Neon events store, Stripe webhook/memberships DB prove, contact email wiring secrets, Dec 24 Luma fix, Resources CMS, Vol.10 posters, Gallery mosaic re-author.
