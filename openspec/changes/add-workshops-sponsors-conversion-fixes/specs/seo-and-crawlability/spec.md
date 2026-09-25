# seo-and-crawlability Delta

## ADDED Requirements

### Requirement: Workshops and sponsors are indexable routes
The system SHALL include `/workshops` and `/sponsors` in `ROUTE_SEO` with `indexable: true` so they enter the sitemap, prerender list, and `llms.txt` primary pages list.

#### Scenario: Build emits new routes
- **WHEN** a production build runs
- **THEN** both paths appear in sitemap.xml and prerender-routes.json

### Requirement: Site summaries do not overclaim the resource library
Default SEO descriptions and the generated `llms.txt` summary SHALL NOT state that IFN publishes a complete resource library as current fact. Wording SHALL allow meetups and membership while treating the library as in progress when that is true.

#### Scenario: llms.txt summary
- **WHEN** `llms.txt` is generated
- **THEN** it does not claim IFN currently publishes a full resource library
