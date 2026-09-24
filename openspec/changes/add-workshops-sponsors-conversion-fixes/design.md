# Design

## Context

Audit `/workspace/ifn-audits/2026-09-24-ifn-community-critical-audit.md` ranks conversion CTAs, phantom library claims, missing `/workshops` + `/sponsors`, nav IA, H1 prerender garbage, and retired `logo.png` as ship-this-week. Brand: DESIGN.md The Sign (crimson accent, Archivo, monochrome photos, no inventing inventory). Sibling strategy: `/workspace/ifn-innovation/category-sponsor-pack-v0.md` (draft — prices are hypotheses, not a public offer). No concrete workshop dates/prices/instructors in repo or strategy.

## Goals / Non-Goals

**Goals:**
- Honest `/workshops` and `/sponsors` conversion pages + full route/SEO/nav wiring.
- CTA hierarchy: Luma RSVP primary on home; Become a member secondary; join modal demoted.
- Library claims → in-progress / first access when published across membership Offer, FAQ, llms, home strip, benefits seed.
- Static accessible H1; client-only word animation; no crawler concatenation.
- Delete `public/logo.png`; OG stays `og-image.png`.
- Nav: Workshops top-level; Collaborate → Sponsors + Partners; Gallery up; Resources demoted.

**Non-Goals:**
- Neon events store; Stripe webhook prove; contact email secrets; Dec 24 Luma edit; Resources CMS; Vol.10 posters; Gallery mosaic re-author; inventing workshop SKUs or public sponsor dollar amounts.

## Decisions

### 1. Workshops = interest + member fit, not a fake catalog
No dates/prices/instructors in repo → page explains who workshops are for, how practical sessions / office hours fit members, captures interest via `/contact?intent=workshops`, and points to next meetup (Luma) + `/membership`. Explicit disclaimer: not immigration legal advice.

### 2. Sponsors URL = `/sponsors`, distinct from `/partners`
Partners remain Station / Reuneo / Yani collaborators. Sponsors page: audience 100–300 (About), monthly cadence at Station Austin, deliverable menu from category pack (logo on Luma, shoutout, thank-you email, optional Q&A / table) without publishing draft $ amounts — "packages start on request". CTA `/contact?intent=sponsor`. Soft cross-link to `/partners`.

### 3. CTA labels
- Primary (home hero / FinalCTA loud path): Register on Luma / See next meetup → `LUMA_CALENDAR_URL` (or next event registration URL when featured).
- Secondary: Become a member → `/membership`.
- Navbar button: Become a member → `/membership` (join modal no longer the nav primary). Join modal may remain reachable from quieter copy if needed.

### 4. H1 pattern
Prerender/SSR-first paint: single static string (e.g. "Where International Founders connect"). After mount, optional client carousel of International/Global/Immigrant with `aria-hidden` on the animated slot; one `sr-only` accessible name. Drop "Grow and Succeed" from the H1.

### 5. Library honesty without emptying membership
Keep private channel + monthly office hours as solid benefits. Resource benefit → "Library in progress — members get first access when guides publish." Update `benefits.json` seed and committed `pricing.generated.ts` snapshot; note Stripe product metadata may need ops push.

### 6. Contact intent prefills
`/contact?intent=sponsor|workshops` prefills the message textarea with framing; no API schema change (email wiring still ops).

### 7. Collaborate nav parent
Primary nav ships a **Collaborate** disclosure (WAI-ARIA disclosure, not menu) with Sponsors and Partners. Workshops never nests under Events. Partners joins primary nav under Collaborate rather than remaining footer-only. Footer gains a matching Collaborate column (Sponsors + Partners) while About/Contact move under Community so the four-column grid is preserved.

## Risks / Trade-offs

- Stripe metadata may still claim a full library until ops re-seeds — mitigated by updating fallback JSON + generated snapshot and calling out in PR.
- Collaborate disclosure keeps the top bar to one extra control instead of two flat links; Resources stays footer-only.
- Draft sponsor prices exist off-repo; publishing them would contradict "hypotheses / not a public offer."

## Migration Plan

Ship in one PR. Delete `logo.png` from `public/`. No data migration. Ops follow-ups listed in PR body.
