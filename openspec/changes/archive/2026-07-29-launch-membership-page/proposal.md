## Why

`/membership` has been a static "Coming soon" stub (tracked under `placeholder-pages`). Per `ifn-strategy/v2/02-website-and-digital-platform.md`, "a simple paid membership landing page" is one of exactly three V2 website additions, and per `ifn-strategy/EXECUTION-PLAN.md` Phase 1–2, a Stripe Payment Link and an announcement email to the existing attendee list are both dated deliverables (Aug 2 / Aug 4) that need a real page to point to. The Stripe Payment Link now exists (`https://buy.stripe.com/bJedR80XZ5UL6p89EL6oo00`), unblocking this page.

Separately, the founder asked for the free/paid-tier product roadmap (discussed across `ifn-strategy/v2`, `v3`, `v4`) to be visible somewhere internal for reference — the existing authenticated `/admin` dashboard is the natural home, since it's already a founder-only, non-public view.

## What Changes

- Build a real `/membership` page describing the single V2 paid tier (private community access, resource library, monthly office hours; $99–$149/yr per `ifn-strategy/v2/04-revenue-and-unit-economics.md`) with a CTA linking to the live Stripe Payment Link. No free-tier account system, no v3-tier content (investor database, `/directory`, Circle.so) — those are explicitly out of scope for V2 per `ifn-strategy/AGENTS.md`'s "never backfill v3/v4 ambition into v2" rule.
- Add a "Roadmap" tab to the existing `/admin` dashboard showing the free / V2-paid / V3-Pro tier breakdown as a static, founder-facing reference table — no new data source, no change to auth or the submissions API.

## Capabilities

### New Capabilities
- `membership-page`: the `/membership` route displaying the paid tier and linking to checkout.

### Modified Capabilities
- `placeholder-pages`: `/membership` is removed from the list of intentionally-unbuilt routes.
- `admin-dashboard`: adds a fourth, static "Roadmap" tab alongside the existing Contact/Join/Events tabs.

## Impact

Affected code: `src/pages/Membership.tsx` (real content, replacing the stub), new `src/data/membershipData.ts` (tier content, following the `partnersData.ts` pattern), `src/pages/Admin.tsx` (new Roadmap tab + static roadmap data).
