## Context

`/partners` currently renders via the shared placeholder pattern (title + "Coming soon", no data). The site's existing card-grid pattern (see `ValueProps.tsx`, `About.tsx`'s values grid) uses an icon-or-avatar + title + description card in a responsive grid with Framer Motion fade-in — reused here rather than inventing a new visual pattern.

## Goals / Non-Goals

**Goals:**
- Ship a real, accurate `/partners` page listing the three current partners with correct categorization.
- Reuse existing design-system conventions (Container, motion patterns, Tailwind tokens) rather than introducing new ones.

**Non-Goals:**
- Not building the "Verified Vendor" SLA/directory features described in `ifn-strategy/v3/02-website-and-digital-platform.md` (Calendly booking, quarterly attribution reports) — those are a v3-tier feature gated on partner volume this page doesn't have yet. This is the v2-tier: a simple, honest partner list.
- Not adding a sponsor-inquiry form in this change — out of scope; a "become a partner" CTA links to the existing Contact page instead of a new form.

## Decisions

- **Logos**: Station Austin and Reuneo logos are sourced via favicon service (`https://www.google.com/s2/favicons?domain=<domain>&sz=128`), the same technique already used for `LumaLogo`/`MeetupLogo` in `Icons.tsx` — no new pattern introduced. Yani Partners' logo is a real asset file provided directly (`public/partners/yani-partners-logo.png`), since it has no public website to source a favicon from.
- **Yani Partners is listed plainly as "Business & Technology Partner," not with sponsor-style language implying an arm's-length commercial relationship** — it's the founder's own company. Accuracy here matters more than making the roster look bigger than it is.
- Kept as one capability (`partners-page`) rather than splitting data from presentation, since `partnersData.ts` has no independent behavior outside this page.

## Risks / Trade-offs

- The Station Austin/Reuneo favicon-service logos are low-resolution (typically 64–128px) compared to a real brand asset. Acceptable for now, matching the existing Luma/Meetup precedent; replace with real logo files if/when partners provide them.
