# sponsors-page Specification

## Purpose
The `/sponsors` page for paid category sponsorship, distinct from collaborator `/partners`.

## ADDED Requirements

### Requirement: Visitors can evaluate sponsorship without fake prices
The system SHALL render `/sponsors` with: honest audience facts (about 100–300 on the meetup/newsletter list), monthly meetup cadence and venue framing, a deliverable menu (e.g. logo on meetup listing, verbal shoutout, thank-you email mention, optional table / scoped Q&A), and tier or package framing that does NOT publish unverified dollar amounts — using "packages start on request" (or equivalent) when prices are draft-only off-repo. The page SHALL state that sponsorship is advertising/presence, not IFN legal/immigration advice.

#### Scenario: Visiting /sponsors
- **WHEN** a visitor opens `/sponsors`
- **THEN** they see audience facts, cadence, deliverables, and a CTA to contact with sponsor intent
- **AND** no invented guaranteed lead counts or fake testimonials appear
- **AND** `/partners` remains the surface for Station / Reuneo / Yani collaborators

### Requirement: Sponsors route is wired for SEO and navigation
The system SHALL register `/sponsors` in the app router, in `ROUTE_SEO` as indexable, and in primary navigation and footer.

#### Scenario: Discoverability
- **WHEN** the site is built
- **THEN** `/sponsors` appears in the sitemap and prerender list with dedicated SEO metadata
