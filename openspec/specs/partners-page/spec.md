# partners-page Specification

## Purpose
The `/partners` page. Lists the venues, tools, and companies (Station Austin, Reuneo, Yani Partners) that support IFN's events, with accurate labeling for founder-affiliated partners.

> **Factual correction, 2026-08-10.** This file previously required each partner
> card to show "its logo". Two of the three had no vendored artwork and were
> rendering a `google.com/s2/favicons` hotlink, so the requirement was being met
> by sending every visitor's IP to a third party for a 16px favicon standing in
> for a logo. Those components are deleted, and so is the initials fallback that
> sat behind them: a generated mark is permissible only for an invented brand,
> and drawn initials on a real company misrepresent it more quietly than a
> favicon does. The requirement below is corrected to what ships. Landing real
> artwork is tracked in `BACKLOG.md`.

## Requirements
### Requirement: Visitors can view IFN's current partners
The system SHALL render `/partners` with a card for each current partner, showing its name, category, a short description, and either its real vendored artwork or a labelled reserved slot.

Artwork SHALL be a local file under `public/partners/`, referenced by a `logo` field on that partner in `src/data/partnersData.ts`. The system SHALL NOT hotlink a partner mark from any third-party host, and SHALL NOT substitute a generated monogram, initials, or a styled text wordmark for missing artwork. A partner without artwork gets a slot that says so in words.

Both partner surfaces (this page and the home PartnersStrip) SHALL branch on the presence of that `logo` field and never on a hardcoded partner id, so adding artwork is one data field and zero component edits.

#### Scenario: Visiting the partners page
- **WHEN** a visitor navigates to `/partners`
- **THEN** the page renders cards for Station Austin (Venue Partner), Reuneo (Speed-Networking Partner), and Yani Partners (Business & Technology Partner), with no data fetching and no loading state
- **AND** each card shows either that partner's vendored artwork or a labelled reserved slot naming the partner and stating that a logo is pending

#### Scenario: Loading the page with network requests recorded
- **WHEN** `/partners` is loaded
- **THEN** no request is made to a third-party host for partner artwork

### Requirement: Partner names stay on the partner surfaces
The system SHALL keep the named partners "Station Austin" and "Reuneo" to the partner surfaces only: this page, the home PartnersStrip section, and `src/data/partnersData.ts`. Every other surface SHALL use a generic descriptor ("our venue partner", "our format partner", "structured one-to-one networking").

Two exceptions are deliberate and SHALL NOT be stripped: `location_name` in `src/data/events.json` is the factual street address of the event and names its venue, and the events preview renders that same string from the feed. An event listing that does not say where the event is is a worse document than one that names a partner.

#### Scenario: Auditing the rendered footprint
- **WHEN** the built output is searched for either partner name
- **THEN** the only matches are the home PartnersStrip prose, the partner data module, and the event address string from the events feed

### Requirement: Founder-affiliated partners are labeled accurately
The system SHALL NOT present a founder-owned or founder-affiliated company using language that implies an arm's-length commercial sponsorship relationship it doesn't have.

#### Scenario: Displaying Yani Partners
- **WHEN** the partners page renders the Yani Partners entry
- **THEN** it is labeled as a business & technology partner without sponsor-style language (e.g., "proud sponsor") that would misrepresent the relationship
