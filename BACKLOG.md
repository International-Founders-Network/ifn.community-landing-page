# IFN Community Project Backlog

This document tracks pending work and points to the spec of record for each capability. Full behavioral contracts (acceptance criteria, known gaps, non-goals) live in [OpenSpec](https://github.com/Fission-AI/OpenSpec) under `openspec/specs/` (main site) and `apps/qr/openspec/specs/` (QR app) — this file is an index into those, not a spec itself. New work should get a spec via `/opsx:propose` before landing, per `CLAUDE.md`.

## 📊 Status & Persona Ratings

| Persona | Current Rating | 10/10 Success Criteria |
| :--- | :---: | :--- |
| **Early-Stage Founder** | 8/10 | Functional "Founder Toolkit", interactive visa guide, easy application. |
| **Scaling Founder** | 7/10 | Investor pipeline access, peer-founder matching, high-signal events. |
| **Mentor / Coach** | 4/10 | Dedicated landing page, mentor application flow, portal access. |
| **Investor / Partner** | 6/10 | Partners page shipped; network data visibility, formal sponsorship SLA still open. |

---

## 🔴 High Priority (Immediate Fixes & Core Content)

- [ ] **Membership page pricing/copy needs to be reconciled with Stripe.** `/membership` is built (see `openspec/specs/membership-page`) but the CTA's Stripe Payment Link currently points to a mismatched product ("IFN Pro," $79/mo) while the founder's actual plan is a $149 public "Founding Member" price and a $99 warm-lead price for the existing attendee list, sent via new links pending as of Jul 29, 2026. Update `src/data/membershipData.ts` once those links are provided.
- [ ] **Mentorship landing page**: build out from placeholder to a conversion-focused page for mentors. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **Investor pipeline**: initial data gathered in [VC_BACKLOG.md](VC_BACKLOG.md). Future: a dedicated investor-facing section or page (no spec yet — write one via `/opsx:propose` before starting).
- [ ] **`join.ts` has no server-side validation**, unlike `contact.ts`/`event-signup.ts`. Spec + known gap: [`openspec/specs/join-flow`](openspec/specs/join-flow/spec.md).
- [ ] **Contact form outbound notification**: messages are validated and stored (working), but nothing forwards them to an inbox yet. Spec: [`openspec/specs/contact-flow`](openspec/specs/contact-flow/spec.md).
- [ ] **`About.tsx`'s "Apply to Join" button has no click handler** — a dead button in production. Spec + known gap: [`openspec/specs/legal-static-pages`](openspec/specs/legal-static-pages/spec.md).

## 🟡 Medium Priority (Features & Enhancements)

- [x] **Resource Hub Redesign (Phase 1)**: page shell shipped with all audiences, stages, and resource cards. Spec: [`openspec/specs/resources-hub`](openspec/specs/resources-hub/spec.md).
- [ ] **Resource Hub Content (Phase 2 - Month 1-2)**: US Market Entry section first — high value content.
- [ ] **Resource Hub Content (Phase 3 - Month 2-4)**: Aspiring Founders and Tech Startups sections.
- [ ] **Resource Hub Content (Phase 4 - Month 4-6)**: SMB section and video content across all sections.
- [ ] **Loading Optimization**: reduce "Loading..." flicker between routes.
- [ ] **Chapter Map**: interactive map/list of global chapters. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **Blog/Playbooks**: build out content/CMS. Spec: [`openspec/specs/placeholder-pages`](openspec/specs/placeholder-pages/spec.md).
- [ ] **`useEvents.ts`/`useLumaEvents.ts` are near-duplicate hooks** — consolidate. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).
- [ ] **Live `events` table and scraped `events.json` are never reconciled** — two independent stores. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).

## 🟢 Low Priority (Polish & Infrastructure)

- [ ] **SEO Optimization**: unique meta tags, OpenGraph data, Twitter cards for all routes.
- [ ] **Social Links**: update footer social icons with real IFN handles.
- [ ] **Dark Mode Support**: theme toggle.
- [x] **Performance Optimization (Batch 1)**: lazy-loading, resized hero images, LCP preload, font-loading fixes.
- [x] **Automated Performance Audit**: `scripts/audit-performance.js`, `npm run audit`.
- [x] **Automated Testing Suite**: Vitest added, covering the validated backend functions and auth logic (see `netlify/functions/*.test.ts`). Playwright/E2E not yet added.
- [ ] **`admin-submissions` has no pagination/limit** — fine at current volume, will need one as tables grow. Spec + known gap: [`openspec/specs/admin-dashboard`](openspec/specs/admin-dashboard/spec.md).
- [ ] **`sync-all.js` redundantly re-runs both scrapers** that the GitHub Action already ran individually. Spec + known gap: [`openspec/specs/events-hub`](openspec/specs/events-hub/spec.md).

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

`apps/qr` is a fully independent app (own lint/tsconfig/dependencies/specs) that may be extracted to its own repository — see `CLAUDE.md`.

---
*Last Updated: Jul 29, 2026*
