# IFN Community Project Backlog

This document tracks pending work and points to the spec of record for each capability. Full behavioral contracts (acceptance criteria, known gaps, non-goals) live in [OpenSpec](https://github.com/Fission-AI/OpenSpec) under `openspec/specs/` (main site) and `apps/qr/openspec/specs/` (QR app). This file is an index into those, not a spec itself. New work should get a spec via `/opsx:propose` before landing, per `CLAUDE.md`.

## 📊 Status & Persona Ratings

| Persona | Current Rating | 10/10 Success Criteria |
| :--- | :---: | :--- |
| **Early-Stage Founder** | 8/10 | Functional "Founder Toolkit", interactive visa guide, easy application. |
| **Scaling Founder** | 7/10 | Investor pipeline access, peer-founder matching, high-signal events. |
| **Mentor / Coach** | 4/10 | Dedicated landing page, mentor application flow, portal access. |
| **Investor / Partner** | 6/10 | Partners page shipped; network data visibility, formal sponsorship SLA still open. |

---

## 🔴 High Priority (Immediate Fixes & Core Content)

- [ ] **Payment gateway. Next iteration, and nothing is broken today.** Membership is sold today by a request-and-reply flow: `/membership` sends the reader to `/contact`, the message is validated and stored by `netlify/functions/contact.ts`, and a link is sent back by hand. **That flow works and is not to be dismantled until a gateway replaces it.** What exists in the repo, recorded here so nobody re-derives it: `STRIPE_PAYMENT_LINK` is defined in `src/data/membershipData.ts` and is **wired to nothing**; no component imports it, no checkout is designed, and the URL it holds predates the current offer and should be treated as unverified. The published price is a single constant, `MEMBERSHIP_PRICE_STANDARD`. A second, lower price exists as a warm-lead price sent by email to a selected list; it is **not public**, it is deliberately not a constant, not a tier and not rendered anywhere, and the header comment in `membershipData.ts` is its only record in this repo. Any gateway work must keep it that way: one published price on the site, the other in email only. Spec: [`openspec/specs/membership-page`](openspec/specs/membership-page/spec.md), which needs a delta before a gateway is built.
- [ ] **The live `events` table can contradict the deployed copy.** `netlify/functions/events.ts` serves the bundled `src/data/events.json` **only** when the Postgres `events` table has zero rows, so on a database with rows the deployed feed can name a different venue from the page around it, and that is invisible locally, in CI and in every test. `src/data/events.json` is correct; the live rows were reported stale. `db/migrations/02_event_venue_station_austin.sql` and its runner `scripts/fix-event-venue.mjs` fix it (preview by default, `--apply` to write, no connection string in this repo). The check, the runner and the caveat that the next Luma sync can write the old value back are documented in `AGENTS.md` under deployment. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).
- [ ] **Mentorship landing page**: build out from placeholder to a conversion-focused page for mentors. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **Investor pipeline**: initial data gathered in [VC_BACKLOG.md](VC_BACKLOG.md). Future: a dedicated investor-facing section or page (no spec yet, write one via `/opsx:propose` before starting).
- [ ] **`join.ts` has no server-side validation**, unlike `contact.ts`/`event-signup.ts`. Spec + known gap: [`openspec/specs/join-flow`](openspec/specs/join-flow/spec.md).
- [ ] **Contact form outbound notification**: messages are validated and stored (working), but nothing forwards them to an inbox yet. Spec: [`openspec/specs/contact-flow`](openspec/specs/contact-flow/spec.md). This is load-bearing for the item above it: until a payment gateway exists, this inbox **is** the membership funnel.
- [ ] **`About.tsx`'s "Apply to Join" button has no click handler**, a dead button in production. Spec + known gap: [`openspec/specs/legal-static-pages`](openspec/specs/legal-static-pages/spec.md).

## 🟡 Medium Priority (Features & Enhancements)

- [ ] **Workshops have zero presence on the site.** IFN's workshop offer (format, cadence, pricing, target buyer) is specified in the sibling **`../ifn-strategy/`** repo under `v2/04`, and the founder is working that list there. **Do not copy the offer into this repo and do not edit `../ifn-strategy`.** This entry records only the website to-do: once the founder publishes the list, decide whether workshops are a section on an existing page, a route of their own, or a resource type inside `/resources`, then write a spec via `/opsx:propose` against whatever ships. Nothing about workshops may be drafted, priced, titled or dated from this side; every string has to come from the founder's list.
- [ ] **Sponsorship surface. Deferred by the founder for the 2026-08-10 round, recorded so it is not lost.** No sponsor page, no sponsor copy and no sponsor data model was added, deliberately. The Investor / Partner persona above is capped at 6/10 partly by its absence, and the "formal sponsorship SLA" in that row is the same gap seen from the other side. When it is picked up it needs a data model decision first (is a sponsor a `Partner` with a tier, or a separate entity?), because `src/data/partnersData.ts` currently models collaboration and not money.
- [ ] **Two capability specs were corrected by hand on 2026-08-10 and both still need a proper delta.** `openspec/specs/membership-page/spec.md` required a CTA linking to a live Stripe Payment Link in a new tab; the shipped CTA is an internal link to `/contact` and `STRIPE_PAYMENT_LINK` is imported by nothing, so the spec had been asserting a contract the code never met. `openspec/specs/partners-page/spec.md` required every partner card to show "its logo", which was being satisfied by a third-party favicon hotlink. Both files now state what ships, each under a dated correction note, and `home-page/spec.md` gained a measured known-gap note on its anchor scenario. **These are corrections of wrong contracts, not design decisions**, and they bypassed the `/opsx:propose` workflow that `AGENTS.md` requires. Run the proper cycle over both when the payment gateway and the partner artwork land.
- [ ] **`/gallery` shipped without a capability spec.** The route, its lightbox and the photo build pipeline (`scripts/photos.manifest.json` plus `scripts/build-photos.mjs`) landed in the 2026-08-10 redesign round. Behaviour is documented in `REDESIGN-PLAN.md` section 7 and `DESIGN.md`, but neither is an OpenSpec capability spec, and `AGENTS.md` asks for one. Write it via `/opsx:propose` and retro-file it beside `home-page`.
- [x] **Resource Hub Redesign (Phase 1)**: page shell shipped with all audiences, stages, and resource cards. Spec: [`openspec/specs/resources-hub`](openspec/specs/resources-hub/spec.md).
- [ ] **Resource Hub Content (Phase 2, Month 1-2)**: US Market Entry section first, highest value content.
- [ ] **Resource Hub Content (Phase 3, Month 2-4)**: Aspiring Founders and Tech Startups sections.
- [ ] **Resource Hub Content (Phase 4, Month 4-6)**: SMB section and video content across all sections.
- [ ] **Loading Optimization**: reduce "Loading..." flicker between routes.
- [ ] **A cold deep link to a below-fold home anchor silently does nothing.** `src/components/ScrollToAnchor.tsx` calls `document.getElementById` once, synchronously, in an effect keyed on the hash. The four below-fold anchors on `/` (`#events`, `#partners`, `#resources`, `#faq`) belong to lazily loaded sections, so on a cold load of `https://ifn.community/#events` the element does not exist yet, the guard falls through and no scroll ever happens. Verified in a headless browser at 1, 2.5 and 5 seconds: `scrollY` stays at 0. Setting the same hash **after** the page has loaded works correctly and lands the section at 72px, which is the `scroll-margin-top: 4.5rem` clearing the 65px bar, so the anchor contract itself is sound and only the cold path is broken. Predates the redesign and is untouched by it. Fix is a retry or a `MutationObserver`, not a longer `setTimeout`. Spec: [`openspec/specs/home-page`](openspec/specs/home-page/spec.md).
- [ ] **Chapter Map**: interactive map/list of global chapters. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **Blog/Playbooks**: build out content/CMS. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **`useEvents.ts`/`useLumaEvents.ts` are near-duplicate hooks**, consolidate. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).
- [ ] **Live `events` table and scraped `events.json` are never reconciled**, two independent stores. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md). The venue item at the top of this file is the first symptom of this gap reaching production, not a separate bug.

## 🟢 Low Priority (Polish & Infrastructure)

- [ ] **Auto-publishing meetup photographs to Instagram and to this site.** Named by the founder as a future workflow: photographs taken at a meetup would reach both surfaces without a manual build step. **Nothing is implemented and nothing should be until it is spec'd**, because the current pipeline is deliberately manual for two reasons that any automation has to answer. First, consent: `assets/photos-source/README.md` treats an unrecorded consent as a refusal, and the 2026-08-10 clearance covers the fifteen frames that exist, not frames that do not exist yet. Second, selection: `scripts/photos.manifest.json` carries a hand-written crop box, grade and alt text per frame, and `REDESIGN-PLAN.md` section 7 records why each unused frame is unused. An auto-publisher has to either preserve that per-frame judgment or state plainly that it is dropping it.
- [ ] **Partner artwork.** Two of the three marks on `/partners` and in the home PartnersStrip render a labelled reserved slot rather than a logo. The `google.com/s2/favicons` hotlinks that used to fill them are deleted and must not return; no substitute monogram is drawn, because a generated mark is only permissible for an invented brand. To land real artwork: drop the file into `public/partners/` and add one `logo` key to that partner in `src/data/partnersData.ts`. Two steps, zero component edits. Spec: [`openspec/specs/partners-page`](openspec/specs/partners-page/spec.md).
- [ ] **SEO Optimization**: unique meta tags, OpenGraph data, Twitter cards for all routes. Route count is now eighteen; `/gallery` is the newest and has no OG image.
- [ ] **Social Links**: update footer social icons with real IFN handles. `src/data/socialLinks.ts` flags the unconfirmed ones `verified: false` and they ship as live links.
- [x] **Dark Mode Support**: theme toggle. Tokens swap in `src/index.css` (light on bare `:root`, dark under a `prefers-color-scheme` block guarded as `:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]`). The footer control is `src/components/ThemeToggle.tsx`: three states (light, system, dark), `system` by default and stored as the absence of the `ifn-theme` key. The no-flash bootstrap is the inline classic script in `index.html`.
- [x] **Performance Optimization (Batch 1)**: lazy-loading, resized hero images, LCP preload, font-loading fixes.
- [x] **Automated Performance Audit**: `scripts/audit-performance.js`, `npm run audit`.
- [x] **Automated Testing Suite**: Vitest added, covering the validated backend functions and auth logic. Tests live in `netlify/tests/`, never inside `netlify/functions/` (see `AGENTS.md` for why that breaks the deploy). Playwright/E2E not yet added.
- [ ] **`admin-submissions` has no pagination/limit**, fine at current volume, will need one as tables grow. Spec + known gap: [`openspec/specs/admin-dashboard`](openspec/specs/admin-dashboard/spec.md).
- [ ] **`sync-all.js` redundantly re-runs both scrapers** that the GitHub Action already ran individually. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).
- [x] **DECIDED 2026-08-10: `public/photos/` and `src/data/photos.generated.ts` are COMMITTED build outputs.** `npm run build` is `tsc -b && vite build` with no `photos` step, and six modules import `photos.generated` (`Hero`, `HowItWorks`, `FounderStory`, `GalleryPreview`, `Gallery` and `GalleryLightbox`), so a fresh clone typechecks only if these are committed. This was left as an open decision for one round and the round nearly shipped the bad half of it: `photos.generated.ts` was already tracked and modified while 52 of its 68 derivatives were untracked, so a routine commit would have published a tracked module referencing files that never reached the repository. Netlify builds from git, so `/gallery` would have rendered ten broken tiles in production while lint, typecheck, test, build and the contrast gate all passed locally. Nothing in the verification line catches that. The decision is therefore made in the direction the existing 16 tracked derivatives already implied: **derivatives are committed**, `sharp` stays out of the deploy path, and adding `npm run photos` to `build` is explicitly NOT done. The cost is repository weight, currently about 3.1MB of derivatives, and it is paid knowingly. Adding a photographic slot means committing its derivatives in the same commit.

## Shipped, spec'd retroactively

Full specs (not just this index) exist for every capability below:

| Capability | Spec |
| :--- | :--- |
| Home page | [`openspec/specs/home-page`](openspec/specs/home-page/spec.md) |
| Join flow | [`openspec/specs/join-flow`](openspec/specs/join-flow/spec.md) |
| Contact flow | [`openspec/specs/contact-flow`](openspec/specs/contact-flow/spec.md) |
| Events hub | [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md) |
| Resources hub | [`openspec/specs/resources-hub`](openspec/specs/resources-hub/spec.md) |
| Legal & static pages | [`openspec/specs/legal-static-pages`](openspec/specs/legal-static-pages/spec.md) |
| Admin dashboard | [`openspec/specs/admin-dashboard`](openspec/specs/admin-dashboard/spec.md) |
| Placeholder pages | [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md) |
| Partners page | [`openspec/specs/partners-page`](openspec/specs/partners-page/spec.md) |
| Membership page | [`openspec/specs/membership-page`](openspec/specs/membership-page/spec.md) |
| QR generator (`apps/qr`) | [`apps/qr/openspec/specs/qr-generator`](apps/qr/openspec/specs/qr-generator/spec.md) |
| QR bulk generation (`apps/qr`) | [`apps/qr/openspec/specs/qr-bulk-generation`](apps/qr/openspec/specs/qr-bulk-generation/spec.md) |
| QR link management (`apps/qr`) | [`apps/qr/openspec/specs/qr-link-management`](apps/qr/openspec/specs/qr-link-management/spec.md) |

**Shipped and NOT yet spec'd:** the `/gallery` route and the photo build pipeline. Tracked as an open item under Medium Priority above.

`apps/qr` is a fully independent app (own lint/tsconfig/dependencies/specs) that may be extracted to its own repository. See `CLAUDE.md`.

---
*Last Updated: Aug 10, 2026*
