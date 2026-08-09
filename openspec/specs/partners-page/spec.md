# partners-page Specification

## Purpose
The `/partners` page — lists the venues, tools, and companies (Station Austin, Reuneo, Yani Partners) that support IFN's events, with accurate labeling for founder-affiliated partners.

## Requirements
### Requirement: Visitors can view IFN's current partners
The system SHALL render `/partners` with a card for each current partner, showing its logo, name, category, and a short description.

#### Scenario: Visiting the partners page
- **WHEN** a visitor navigates to `/partners`
- **THEN** the page renders cards for Station Austin (Venue Partner), Reuneo (Speed-Networking Partner), and Yani Partners (Business & Technology Partner), each with a logo, with no data fetching or loading state

### Requirement: Founder-affiliated partners are labeled accurately
The system SHALL NOT present a founder-owned or founder-affiliated company using language that implies an arm's-length commercial sponsorship relationship it doesn't have.

#### Scenario: Displaying Yani Partners
- **WHEN** the partners page renders the Yani Partners entry
- **THEN** it is labeled as a business & technology partner without sponsor-style language (e.g., "proud sponsor") that would misrepresent the relationship

