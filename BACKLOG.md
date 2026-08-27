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

- [x] **Payment gateway — SHIPPED on this branch (2026-08-27), test-mode verified, not yet live.** `/membership` now runs a real Stripe **subscription** checkout: the CTA POSTs a plan slug to `/api/checkout`, which resolves it through a server-side allowlist to a Stripe **lookup key** and returns a hosted session URL. `netlify/functions/stripe-webhook.ts` verifies the signature against the raw body and keeps a `memberships` table current. `STRIPE_PAYMENT_LINK` was **deleted** — it named a different product ("IFN Pro", $79/mo). `/contact` is untouched and is still the fallback whenever checkout fails. The warm-lead price remains email-only, now enforced by the `PLANS` allowlist rather than by memory: a price not listed there cannot be bought. This supersedes `PRODUCT.md` line 39 (Payment Links, not in-app checkout). Spec: [`openspec/changes/add-membership-subscription-billing`](openspec/changes/add-membership-subscription-billing/), which still needs archiving into `openspec/specs/`.

### 🔴 Outstanding before membership can be sold for real

These are the master to-do list for going live. Nothing charges anyone until the first two are done.

- [ ] **Set the lookup key `founding_member_annual` on the LIVE $149/yr recurring price.** It was missing in test mode too and had to be added by hand; without it nothing resolves. It must be the *same* string in both modes — that is the whole reason no price id lives in the repo.
- [ ] **Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in the Netlify dashboard**, and register the live endpoint at `https://ifn.community/api/stripe-webhook` for `checkout.session.completed`, `customer.subscription.{created,updated,deleted}` and `invoice.payment_failed`. The live signing secret is not the one `stripe listen` prints.
- [ ] **Confirm the product tax code before selling.** The account has **Managed Payments enabled by default**, which rejects a Checkout Session unless the product carries an eligible `tax_code` — the first real test session failed on exactly this. The test product is set to `txcd_10000000` (General – Electronically Supplied Services), chosen because every membership benefit is delivered electronically. The alternatives are `txcd_20030000` (General – Services) and `txcd_00000000` (Nontaxable); Stripe publishes no membership-specific code. **This decides what sales tax is collected** — checkout was observed adding 8.25% Texas tax — so it is a question for the founder and whoever does IFN's tax, not a coding choice. Set it on the live product too.
- [ ] **Click the CTA against a live Stripe from this branch.** The end-to-end run (real Checkout, card 4242, idempotent replay, stale-event guard) was done on the `main`-based branch where the server files are byte-identical. The browser path from *this* page has not been exercised.
- [ ] **Rotate the Neon `neondb_owner` credential.** `.env` was tracked in git until 2026-08-27 and carries a live connection string in this repo's history; the production password was also exposed in a working session on that date. Untracking is not revoking. Update the Netlify env var after rotating, or production breaks.

### 🟡 Follow-ups, not blockers

- [ ] **Give the `memberships` table a reader.** Rows land in Postgres with nothing consuming them, so "IFN knows who is a member" is only half true. The natural home is a Memberships tab on `/admin`, behind the Google sign-in and allowlist that `admin-submissions.ts` already enforces.
- [ ] **Self-serve cancellation / Stripe billing portal.** Members currently cancel by asking a person.
- [ ] **Decide what a lapsed member loses.** Nothing enforces entitlement: the private channel, resource library and office hours are all granted and revoked by hand. `status` and `current_period_end` make that decidable, but nothing acts on them.
- [ ] **The live `events` table can contradict the deployed copy.** `netlify/functions/events.ts` serves the bundled `src/data/events.json` **only** when the Postgres `events` table has zero rows, so on a database with rows the deployed feed can name a different venue from the page around it, and that is invisible locally, in CI and in every test. `src/data/events.json` is correct; the live rows were reported stale. `db/migrations/02_event_venue_station_austin.sql` and its runner `scripts/fix-event-venue.mjs` fix it (preview by default, `--apply` to write, no connection string in this repo). The check, the runner and the caveat that the next Luma sync can write the old value back are documented in `AGENTS.md` under deployment. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).
- [ ] **Mentorship landing page**: build out from placeholder to a conversion-focused page for mentors. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **Investor pipeline**: initial data gathered in [VC_BACKLOG.md](VC_BACKLOG.md). Future: a dedicated investor-facing section or page (no spec yet, write one via `/opsx:propose` before starting).
- [ ] **`join.ts` has no server-side validation**, unlike `contact.ts`/`event-signup.ts`. Spec + known gap: [`openspec/specs/join-flow`](openspec/specs/join-flow/spec.md).
- [ ] **Contact form outbound notification**: messages are validated and stored (working), but nothing forwards them to an inbox yet. Spec: [`openspec/specs/contact-flow`](openspec/specs/contact-flow/spec.md). This mattered more when `/contact` was the only way to buy a membership. Stripe checkout now carries that load, but `/contact` is still the checkout fallback and the route for anyone who wants to talk to a person, so an unwatched inbox still loses people.
- [ ] **`About.tsx`'s "Apply to Join" button has no click handler**, a dead button in production. Spec + known gap: [`openspec/specs/legal-static-pages`](openspec/specs/legal-static-pages/spec.md).

## 🟡 Medium Priority (Features & Enhancements)

- [ ] **Workshops have zero presence on the site.** IFN's workshop offer (format, cadence, pricing, target buyer) is specified in the sibling **`../ifn-strategy/`** repo under `v2/04`, and the founder is working that list there. **Do not copy the offer into this repo and do not edit `../ifn-strategy`.** This entry records only the website to-do: once the founder publishes the list, decide whether workshops are a section on an existing page, a route of their own, or a resource type inside `/resources`, then write a spec via `/opsx:propose` against whatever ships. Nothing about workshops may be drafted, priced, titled or dated from this side; every string has to come from the founder's list.
- [ ] **Sponsorship surface. Deferred by the founder for the 2026-08-10 round, recorded so it is not lost.** No sponsor page, no sponsor copy and no sponsor data model was added, deliberately. The Investor / Partner persona above is capped at 6/10 partly by its absence, and the "formal sponsorship SLA" in that row is the same gap seen from the other side. When it is picked up it needs a data model decision first (is a sponsor a `Partner` with a tier, or a separate entity?), because `src/data/partnersData.ts` currently models collaboration and not money.
- [ ] **Two capability specs were corrected by hand on 2026-08-10 and both still need a proper delta.** `openspec/specs/membership-page/spec.md` required a CTA linking to a live Stripe Payment Link in a new tab; the shipped CTA is an internal link to `/contact` and `STRIPE_PAYMENT_LINK` is imported by nothing, so the spec had been asserting a contract the code never met. `openspec/specs/partners-page/spec.md` required every partner card to show "its logo", which was being satisfied by a third-party favicon hotlink. Both files now state what ships, each under a dated correction note, and `home-page/spec.md` gained a measured known-gap note on its anchor scenario. **These are corrections of wrong contracts, not design decisions**, and they bypassed the `/opsx:propose` workflow that `AGENTS.md` requires. The payment-gateway half of this is now addressed: `openspec/changes/add-membership-subscription-billing` carries a proper delta against the corrected `membership-page` spec and needs archiving. The partners-page correction still needs its own cycle.
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
