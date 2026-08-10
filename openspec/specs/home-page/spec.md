# home-page Specification

## Purpose
The composed marketing landing page at `/`. It is the primary entry point introducing IFN and driving visitors into the Join flow.

## Requirements
### Requirement: Home page renders core marketing sections
The system SHALL render the `/` route with, in order: Hero, ValueProps, HowItWorks, FounderStory, EventsPreview, PartnersStrip, GalleryPreview, ResourcesPreview, FAQ, and FinalCTA.

Seven of the ten (FounderStory onward) are code-split behind their own `Suspense` boundary. Sharing one boundary made the whole lower half of the page wait on whichever chunk resolved last.

`GalleryPreview` was INSERTED between PartnersStrip and ResourcesPreview on 2026-08-10 and carries no anchor id, so no existing section moved relative to any other and nothing linkable moved at all. It exists because a design pre-flight measured 5,649px of the built page, 47 percent of the document, running with no photograph in it from the last frame to the closing accent field; the section takes the longest such run to 3,320px. It renders one frame from each photographed evening and links to `/gallery`. It prints no date on any frame, because `/gallery` is the only dated photographic surface on this site and the recurrence claim on the home page is carried by copy.

#### Scenario: Visiting the root route
- **WHEN** a visitor navigates to `/`
- **THEN** the page renders all ten sections in the specified order without requiring further navigation

### Requirement: Home page preserves its anchor targets
The system SHALL keep the anchor ids `#mentorship` (on ValueProps), `#events` (on EventsPreview), `#partners` (on PartnersStrip), `#resources` (on ResourcesPreview) and `#faq` (on FAQ) on their current sections, because the navigation, the footer and external links resolve to them.

`id="mentorship"` sits on ValueProps and has nothing to do with that section's content. It is frozen anyway, and it is called out here because it is the one most likely to be silently dropped in a restructure.

#### Scenario: Following an in-page anchor
- **WHEN** a visitor follows a link to any of those five anchors
- **THEN** the corresponding section scrolls into view clear of the fixed navigation bar

**KNOWN GAP, measured 2026-08-10. This scenario passes from within the page and fails on a cold load.** `src/components/ScrollToAnchor.tsx` calls `document.getElementById` once, synchronously, in an effect keyed on the hash. Four of the five anchors sit on lazily loaded sections, so on a cold load of `/#events` the element does not exist yet, the guard falls through, and no scroll is ever attempted. Verified in a headless browser at 1, 2.5 and 5 seconds: `scrollY` stays at 0. Setting the same hash after load works and lands the section 72px from the top, which is `scroll-margin-top: 4.5rem` clearing the 65px bar, so the clearance half of this scenario is sound and only the cold path is broken. `#mentorship` is unaffected because ValueProps is eagerly imported. Tracked in `BACKLOG.md`.

### Requirement: Lazy section placeholders reserve their real height and ground
The system SHALL give every `Suspense` fallback on the Home page the same background token as the section it stands in for, and a `min-height` measured from that section's rendered height, so the page keeps its banding before hydration and does not shift when a chunk lands.

Fallbacks are declared as a breakpoint ladder because a single height cannot be correct at both 390px and 1920px. The closing section's own height is `min-h-[100dvh]`, so its fallback uses the same `max()` of viewport and content or it can never converge.

A section whose height is set by photographs rather than by reflowing text does NOT take a constant per band. Its rendered height is close to linear in viewport width, so its fallback is declared as `calc(<intercept> + <slope>vw)` fitted to measured points. `GalleryPreview` is the one such section today: a constant would be out by up to 225px inside its base band against a worst residual of 12px anywhere else on the page.

#### Scenario: A lazy chunk resolves
- **WHEN** a below-fold section's chunk finishes loading
- **THEN** the content below it moves by no more than a few pixels, keeping cumulative layout shift within budget

#### Scenario: A section's composition changes
- **WHEN** a developer changes the content or layout of any lazily loaded Home section
- **THEN** the corresponding fallback height in `src/pages/Home.tsx` is re-measured against the rendered page rather than estimated

This fires on changes that are not about the section at all. On 2026-08-10 all six fallbacks were re-measured, and within hours two were wrong again: widening the FounderStory photograph added 185px to that section, and moving a link out of EventsPreview took 60px off it. Neither edit was about a fallback height.

### Requirement: Home page triggers the Join flow
The system SHALL allow any primary CTA on the Home page to open the shared Join modal via the `openJoinModal` context function provided by the root `Layout`.

Every primary CTA on the page carries the same label, "Join the community", in the Hero, in HowItWorks and in FinalCTA, matching the navigation action. One label per intent.

#### Scenario: Clicking a primary CTA
- **WHEN** a visitor clicks a "Join the community" CTA on the Home page
- **THEN** the Join modal (see the `join-flow` capability) opens over the current page
