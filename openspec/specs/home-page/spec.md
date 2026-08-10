# home-page Specification

## Purpose
The composed marketing landing page at `/`. It is the primary entry point introducing IFN and driving visitors into the Join flow.

## Requirements
### Requirement: Home page renders core marketing sections
The system SHALL render the `/` route with, in order: Hero, ValueProps, HowItWorks, FounderStory, EventsPreview, PartnersStrip, ResourcesPreview, FAQ, and FinalCTA.

Six of the nine (FounderStory onward) are code-split behind their own `Suspense` boundary. Sharing one boundary made the whole lower half of the page wait on whichever chunk resolved last.

#### Scenario: Visiting the root route
- **WHEN** a visitor navigates to `/`
- **THEN** the page renders all nine sections in the specified order without requiring further navigation

### Requirement: Home page preserves its anchor targets
The system SHALL keep the anchor ids `#mentorship` (on ValueProps), `#events` (on EventsPreview), `#partners` (on PartnersStrip), `#resources` (on ResourcesPreview) and `#faq` (on FAQ) on their current sections, because the navigation, the footer and external links resolve to them.

`id="mentorship"` sits on ValueProps and has nothing to do with that section's content. It is frozen anyway, and it is called out here because it is the one most likely to be silently dropped in a restructure.

#### Scenario: Following an in-page anchor
- **WHEN** a visitor follows a link to any of those five anchors
- **THEN** the corresponding section scrolls into view clear of the fixed navigation bar

### Requirement: Lazy section placeholders reserve their real height and ground
The system SHALL give every `Suspense` fallback on the Home page the same background token as the section it stands in for, and a `min-height` measured from that section's rendered height, so the page keeps its banding before hydration and does not shift when a chunk lands.

Fallbacks are declared as a breakpoint ladder because a single height cannot be correct at both 390px and 1920px. The closing section's own height is `min-h-[100dvh]`, so its fallback uses the same `max()` of viewport and content or it can never converge.

#### Scenario: A lazy chunk resolves
- **WHEN** a below-fold section's chunk finishes loading
- **THEN** the content below it moves by no more than a few pixels, keeping cumulative layout shift within budget

#### Scenario: A section's composition changes
- **WHEN** a developer changes the content or layout of any lazily loaded Home section
- **THEN** the corresponding fallback height in `src/pages/Home.tsx` is re-measured against the rendered page rather than estimated

### Requirement: Home page triggers the Join flow
The system SHALL allow any primary CTA on the Home page to open the shared Join modal via the `openJoinModal` context function provided by the root `Layout`.

Every primary CTA on the page carries the same label, "Join the community", in the Hero, in HowItWorks and in FinalCTA, matching the navigation action. One label per intent.

#### Scenario: Clicking a primary CTA
- **WHEN** a visitor clicks a "Join the community" CTA on the Home page
- **THEN** the Join modal (see the `join-flow` capability) opens over the current page
