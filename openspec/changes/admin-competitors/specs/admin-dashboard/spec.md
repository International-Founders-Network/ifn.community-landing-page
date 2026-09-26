## ADDED Requirements

### Requirement: Admin dashboard includes a static Competitors reference tab
The system SHALL render a "Competitors" tab on `/admin`, alongside Contact/Join/Events/Roadmap, showing the competitive landscape seed as static content with no external data fetch and no independent auth check (it inherits the dashboard's existing Google allowlist session gate). Competitors data SHALL NOT be exposed on any public route, navigation entry, or sitemap path, and SHALL NOT be imported by public page modules.

#### Scenario: Viewing the Competitors tab
- **WHEN** an authenticated admin selects the "Competitors" tab
- **THEN** the competitors table renders immediately from local static data, with no network request issued for that panel

#### Scenario: Searching competitors
- **WHEN** an authenticated admin types a search query on the Competitors tab
- **THEN** the table filters rows by case-insensitive substring match across name, kind, overlap, geography, summary, notes, and related fields

#### Scenario: Competitors stay admin-only
- **WHEN** a crawler or anonymous visitor requests public site routes
- **THEN** competitor seed data is not present as a public page, nav link, or indexable route; `/admin` remains noindex
