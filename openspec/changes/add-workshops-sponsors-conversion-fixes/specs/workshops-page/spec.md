# workshops-page Specification

## Purpose
The `/workshops` conversion page: how practical sessions and office hours fit IFN members, without inventing a workshop catalog.

## ADDED Requirements

### Requirement: Visitors can open an honest workshops page
The system SHALL render `/workshops` as an indexable page that explains who workshops and practical sessions are for (international / immigrant founders building in the U.S.), how they relate to membership (office hours / practical sessions between meetups), and what they are not (immigration legal advice). The page SHALL NOT invent concrete workshop dates, prices, or instructor names that are not present in the repository or approved strategy docs.

#### Scenario: Visiting /workshops with no published catalog
- **WHEN** a visitor opens `/workshops` and no concrete workshop offerings exist in site data
- **THEN** the page frames interest and member fit rather than a dated catalog
- **AND** it provides clear paths to the next meetup on Luma and to `/membership`
- **AND** it offers a contact path with workshop intent (e.g. `/contact?intent=workshops`)

### Requirement: Workshops route is wired for SEO and navigation
The system SHALL register `/workshops` in the app router, in `ROUTE_SEO` as indexable, and as a **top-level** primary navigation item (never nested under Events or Collaborate) and in the footer so sitemap, prerender, and `llms.txt` include it.

#### Scenario: Discoverability
- **WHEN** the site is built
- **THEN** `/workshops` appears in the sitemap and prerender list and has a dedicated title and description in `ROUTE_SEO`
