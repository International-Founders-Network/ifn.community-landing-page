## Context

`/membership` currently renders via the shared placeholder pattern (title + "Coming soon", no data), same as `/partners` did before `openspec/specs/partners-page`. That change established the reusable pattern for a "real content page for a V2 addition": `Container` + Framer Motion fade-in + a hero section + a card/content grid + a closing CTA. Reused here rather than inventing a new visual pattern.

`/admin` (`openspec/specs/admin-dashboard`) is a tabbed, authenticated dashboard (`Contact` / `Join` / `Events`) driven by `/api/admin-submissions`. The roadmap addition is a fourth tab with no backing API call — it's static reference content for the founder, not a data view.

## Goals / Non-Goals

**Goals:**
- Ship a real, accurate `/membership` page describing the one paid tier that actually exists in `ifn-strategy/v2/04-revenue-and-unit-economics.md`, linking to the real Stripe Payment Link.
- Give the founder a persistent, always-current reference for the tier roadmap without needing to re-open the strategy repo — surfaced inside the tool they already use daily (`/admin`).
- Reuse existing design-system and dashboard conventions rather than introducing new ones.

**Non-Goals:**
- Not building a free-tier account system (sign-up, login, gated content) — no such product exists in `v2`; "free" today just means open meetup attendance, not a website feature.
- Not building any V3-tier content on the public page: no investor database, no `/directory`, no Circle.so migration, no Verified Vendor SLA language. Gated on subscriber volume this page doesn't have yet, per `ifn-strategy/v3/02-website-and-digital-platform.md` and `v3/05-product-programs-and-events.md`.
- Not adding a membership-management flow (cancel/upgrade/view invoices) — the Stripe Payment Link handles checkout only; account management is out of scope until there's a reason to build it.
- Not making the Roadmap tab editable from the UI — it's static, hand-maintained JSX/data, same trust model as everything else in this repo (edit the source, redeploy).

## Decisions

- **No specific dollar figure pinned to the CTA button.** The strategy doc gives a range ($99–$149/yr) and the Stripe Payment Link's exact configured price isn't independently verifiable via automated tooling (it's a client-rendered checkout page). The page describes the range and what's included; the Stripe Checkout screen itself is the source of truth for the exact charged amount. Avoids a copy/checkout mismatch if the price is later adjusted in Stripe.
- **Membership CTA is a plain external `<a>` to the Payment Link**, not the `Button` component — `Button` renders a `motion.button` with no native href support, and `Partners.tsx`'s existing external-link CTA already established the hand-styled-anchor convention for this exact situation.
- **Roadmap tab reuses the `Tab` union type and existing tab-button styling in `Admin.tsx`** rather than a separate view/route, so it inherits the existing auth gate for free (anything rendered inside `Dashboard` is already behind Google Sign-In).
- **Roadmap content is sourced directly from the `ifn-strategy` conversation/docs** (v2 current tier, v3 "IFN Pro" preview) rather than re-deriving it — kept intentionally short (a table), not a duplicate of the strategy repo's prose.

## Risks / Trade-offs

- If the Stripe Payment Link's price is changed later, the range on `/membership` could drift from what checkout actually shows. Acceptable given the alternative (hardcoding a number now) risks the same drift in the other direction with less flexibility.
- The Roadmap tab surfaces v3/v4-tier plans inside the admin tool. Since `/admin` is allowlist-gated to the founder, this doesn't violate the "don't backfill v3 ambition into v2 execution" rule (that rule is about the public-facing product/pricing, not an internal reference view).
