# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: international founders and immigrant entrepreneurs building in Austin, Texas**, at any stage — pre-idea through scaling. They are doing something they have no local playbook for: incorporating in an unfamiliar legal system, navigating visa and immigration constraints while running a company, opening U.S. banking, hiring across borders, and building a professional network from zero in a city where they have no history. They arrive knowing their product and not knowing the terrain.

Secondary audiences, confirmed and real but smaller:

- **Global entrepreneurs expanding into the U.S.** who need the same operational answers before they land.
- **International students launching ventures**, typically the most constrained on visa status and the least funded.
- **Service providers and sponsors** (immigration and venture law, banking, EOR, fractional technology) evaluating whether IFN is a real organization worth backing — a distinct audience with a distinct job, evaluating rather than joining.

## Product Purpose

IFN runs a community for international founders: monthly in-person meetups in Austin, a paid membership with a resource library and private member channel, and direct connections to vetted service providers who understand cross-border founder problems.

It exists because the two available options both fail this audience. General Austin startup meetups don't address cross-border problems at all. Selective accelerators do, but take equity, gate on admission, and run on a single-cohort cadence.

Success is a founder who arrived without a local network leaving with warm introductions, concrete answers to operational questions, and people who have personally solved the problem in front of them. Commercially, success is that membership and sponsorship revenue makes the operation self-sustaining rather than a hobby.

## Positioning

**The trusted, practical middle ground between an informal meetup and an expensive accelerator** — no equity taken, open access, monthly cadence instead of a single cohort, and a specific focus on the cross-border problems (visas, unfamiliar funding norms, building a network from zero) that general meetups don't address.

**Geographic scope — Austin base, global reach.** IFN is physically rooted in Austin: the meetups, the venue partner, the in-person community. The membership, resource library, and audience genuinely extend beyond it. Both facts are true and future copy must hold both without letting the second one swallow the first. Lead with the provable local reality; the global dimension is real but supporting.

**Claims that are NOT true yet and must not be made:** "institutional gateway between foreign governments and the U.S. venture market," or any framing implying government/institutional relationships, chapters that don't exist, or scale IFN hasn't reached. The strategy record classifies this as a credibility risk, not a differentiator. See `../ifn-strategy/v2/01-positioning-and-brand.md`.

## Operating Context

- **Monthly in-person meetups in Austin**, hosted at Station Austin. The speed-networking format is powered by Reuneo — founders are paired into structured 1-1 connections rather than left to unstructured mingling. This format is a deliberate product decision, not a venue detail.
- **Events are published and discovered externally** — Luma and Meetup are the sources of record for event listings; the site surfaces them.
- **Membership is transacted through Stripe Payment Links**, not an in-app checkout.
- **Members-only channel (Slack/Discord) and a recurring monthly members-only office-hours call** are where the between-meetup value lives.
- **The organization is founder-operated.** Anything the site promises has to be deliverable by a very small team; commitments implying staffed operations (24/7 response, large program throughput, per-member concierge service) are not deliverable.
- **Company strategy, positioning, messaging, event playbook, and governance live in the sibling private repo `../ifn-strategy/`** — `v2/` is the active tier. Check there before writing marketing copy. Legal filings, financial records, and banking live in Google Drive, not in either repo.

## Capabilities and Constraints

**Scope of this record:** the main IFN site (`ifn.community`) only. `apps/qr` is a deliberately independent codebase with its own tooling and its own OpenSpec instance, intended for extraction into a separate repository later — it is out of scope here and must not be coupled to the main site.

Shipped and working: home, about, careers, partners, contact, events, resources hub, membership, newsletter, chapters, blog, playbooks, mentorship, legal pages, and an internal admin dashboard. A shared Join modal is the primary conversion action across surfaces. Contact and event-signup submissions are server-validated and stored.

Technical constraints:

- React + TypeScript + Vite + Tailwind CSS v4, deployed on **Netlify** via Netlify's own git integration. `/api/*` endpoints are Netlify Functions backed by Neon Postgres — local work that touches them requires `npx netlify dev`, not plain `vite`.
- The repo is **spec-driven via OpenSpec**. Non-trivial changes get a proposal under `openspec/changes/` before code, and specs in `openspec/specs/` are the behavioral contract of record. `BACKLOG.md` indexes them.
- Placeholder-grade pages exist and are known: mentorship, chapters, blog, and playbooks are shells, not finished surfaces.

Terminology: "IFN" and "International Founders Network" are used interchangeably. Members, not users or customers. Meetups, not events, when referring to the recurring in-person gathering.

**Explicitly undecided / in flux:**

- **Membership pricing is confirmed at $149/year public ("Founding Member") and $99/year for the existing warm-lead attendee list.** The Stripe Payment Link currently wired into `src/data/membershipData.ts` is mismatched — it points at a different product ("IFN Pro," $79/mo). The correct links are pending. Until they land, no surface should present a price other than the confirmed $149/$99 annual figures, and none should imply monthly billing.
- Mentor-side offering (what a mentor gets, how they apply) is not defined.
- Investor/VC-facing offering is researched (`VC_BACKLOG.md`) but not decided.

## Brand Commitments

- **Name:** International Founders Network / IFN. **Domain:** `ifn.community` (with `qr.ifn.community` for the independent QR app).
- **Existing assets:** `public/logo.png`, `public/favicon.png`, `public/partners/yani-partners-logo.png`.
- **Voice — the defining commitment:** IFN keeps the genuine, informal, welcoming identity of the meetup that actually worked for six months, and adds a professional layer on top. Paying members and sponsors must feel they are backing a real organization, not a hobby group. Neither register alone is correct: pure informality undercuts the paid tier and sponsorship; corporate polish betrays what the community actually is. This tension is the brand.
- **Honesty is a brand commitment, not just a compliance matter.** The audience's whole problem is not knowing who to trust in an unfamiliar country. Overclaimed scale, invented logos, or borrowed credibility damage the one thing IFN is selling.

## Evidence on Hand

**Real and citable today:**

- **Six-plus months of monthly IFN meetups in Austin** — a provable, datable operating history. This is the strongest asset and the honest answer to "is this real?"
- **Three named partner relationships**, already in `src/data/partnersData.ts`: Station Austin (venue), Reuneo (speed-networking format), Yani Partners (fractional CTO / technology).

  **On the Yani Partners related-party disclosure.** An earlier version of this line required a disclosure, that Yani Partners was founded by the same team behind IFN, to stay attached to the claim wherever it appeared. That disclosure was removed from both `PartnersStrip` and `/partners` on 2026-08-10 at the founder's direction, and this line was updated in the same commit so the repo does not mandate a sentence the site no longer prints.

  The underlying fact has not changed, and it is recorded here rather than dropped: Yani Partners shares founders with IFN, and the site lists it among the partners without saying so. Anyone reinstating or re-removing the sentence should treat that as a founder decision, not an engineering one.
- **An attendee/subscriber list of roughly 100–300 people.** Real and countable. Large enough to cite honestly, not large enough to lead with as a scale claim.
- **Real member testimonials exist on LinkedIn** and are collectible from actual members on request. This is the sourcing path for genuine social proof — future work needing quotes goes here, it does not invent them.

**Interim placeholder testimonials are founder-authorized** until the real LinkedIn quotes are collected: compelling copy is wanted now rather than an empty section. *Flagged for the founder's decision:* placeholder quotes should not be attributed to invented named individuals paired with stock photographs of people who do not exist, which is what `src/components/Testimonials.tsx` currently does. An unattributed or visibly-representative treatment gets the same persuasive effect without a claim that can be falsified. This is a recommendation, not a settled constraint.

**Absences — future work must NOT fabricate these:**

- **No real member-company logos.** `src/components/SocialProof.tsx` contains invented companies ("TechStart," "GlobalVentures," "FutureScale," "InnoHub," "CloudPeak").
- **No verified scale statistics.** The "5,000+ founders / 85+ countries / 200+ events annually" figures in that same file are invented and contradict the ~100–300 reality by more than an order of magnitude.
- **No named members from Lagos, Toronto, or Berlin.** The three testimonials in `src/components/Testimonials.tsx` (Amara Okeke, David Chen, Elena Rodriguez) are fabricated, with Unsplash stock photographs.
- No press coverage, case studies, funding-outcome claims, or benchmark data.
- No chapters outside Austin.

**Fabricated content currently live in production:**

- `src/pages/About.tsx` — "**500+** Global Founders" and "**20+** Cities Represented" (contradicts the real ~100–300 list), plus a fully invented attributed testimonial: *"IFN has been the single most valuable resource for my startup's growth…" — Sarah Chen, Founder of EcoSync*.
- `src/components/HeroVisual.tsx` — "**85+ Founders in Austin**", rendered in the home-page hero. Not necessarily false against a 100–300 list, but unverified and inconsistent with the other figures on the site.
- `src/pages/ExperimentalHero.tsx` — "1,200+" and "85+". On the live `/experimental-hero` route, unlinked from navigation.

**Fabricated content that is dead code** (defined, imported nowhere — landmines for reuse, not shipped claims): `src/components/Testimonials.tsx` and `src/components/SocialProof.tsx`. Do not render either as-is.

## Product Principles

1. **Provable beats impressive.** Every claim on every surface must survive a member asking "is that actually true?" Six real months and three real partners outperform invented scale, because the audience is specifically shopping for trustworthiness.
2. **Lead with the local reality, let the global be supporting.** Austin is what IFN can prove and deliver. Global reach is real but secondary — copy that inverts this reads as the exact overclaiming the strategy record warns against.
3. **Speak to the terrain, not the ambition.** The differentiator is cross-border operational specificity — visas, U.S. banking, unfamiliar funding norms, network-from-zero. Generic startup-community language makes IFN interchangeable with the meetups it is explicitly not.
4. **Warm, then professional — in that order.** The community's informality is the asset that worked. Professionalism is the layer that makes it fundable, not a replacement for it.
5. **Only promise what one small team can deliver.** Founder-operated is a hard constraint on what any surface is allowed to commit to.

## Accessibility & Inclusion

The core audience is substantially non-native English speakers navigating an unfamiliar country's systems. This makes plain-language writing a product requirement, not a style preference: avoid American idiom, sports and cultural metaphors, startup in-jargon, and unexplained acronyms (visa classes, legal entity types, and funding-stage terms get expanded on first use). Assume a reader who is highly capable and unfamiliar with the local shorthand — never one who is less sophisticated.

No specific conformance standard (WCAG level, audit, or legal requirement) has been established for this project. Absent one, apply standard good practice rather than assuming an exemption.
