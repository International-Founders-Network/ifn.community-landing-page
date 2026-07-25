# home-page Specification

## Purpose
The composed marketing landing page at `/` — the primary entry point introducing IFN and driving visitors into the Join flow.

## Requirements
### Requirement: Home page renders core marketing sections
The system SHALL render the `/` route with, in order: Hero, ValueProps, HowItWorks, FounderStory, EventsPreview, ResourcesPreview, FAQ, and FinalCTA.

#### Scenario: Visiting the root route
- **WHEN** a visitor navigates to `/`
- **THEN** the page renders all eight sections in the specified order without requiring further navigation

### Requirement: Home page triggers the Join flow
The system SHALL allow any primary CTA on the Home page to open the shared Join modal via the `openJoinModal` context function provided by the root `Layout`.

#### Scenario: Clicking a primary CTA
- **WHEN** a visitor clicks a "Join"-style CTA on the Home page
- **THEN** the Join modal (see the `join-flow` capability) opens over the current page

