# home-page Delta

## ADDED Requirements

### Requirement: Home H1 is a single accessible name for crawlers and AT
The system SHALL expose exactly one coherent H1 accessible name on `/` (no concatenation of all carousel candidate words into one string). If a word carousel is shown visually, it SHALL mount only after client hydration (or otherwise keep non-active candidates out of the prerendered H1 text) and SHALL NOT put every candidate into the accessible name. The H1 SHALL NOT use the slogan "Grow and Succeed" (or "Connect, Grow, and Succeed") as the conversion headline.

#### Scenario: Prerendered home document
- **WHEN** a non-JS crawler fetches `/`
- **THEN** the H1 text is a single static phrase and does not concatenate International, Global, and Immigrant into one token run

### Requirement: Home resources strip does not claim a shipped full library
The system SHALL NOT claim that a full published founder resource library is available today on the home resources strip. Copy SHALL reflect in-progress status or first access when published.

#### Scenario: Resources strip copy
- **WHEN** a visitor reads the home resources section
- **THEN** it does not promise a complete published library as a current benefit

## MODIFIED Requirements

### Requirement: Home page triggers the Join flow
The system SHALL NOT use "Join the community" (join modal) as the loudest primary CTA on the home hero or FinalCTA. The primary home CTA SHALL send visitors toward Luma RSVP for the next meetup. A secondary CTA SHALL send visitors to `/membership` ("Become a member" or equivalent). The join modal MAY remain reachable from a quieter control via `openJoinModal`, but SHALL NOT be the primary conversion label on the hero or FinalCTA.

#### Scenario: Clicking a primary CTA
- **WHEN** a visitor clicks the primary CTA on the home hero
- **THEN** they are taken toward Luma RSVP (calendar or next-event registration), not required to open the Join modal first

#### Scenario: Hero CTA hierarchy
- **WHEN** a visitor views the home hero
- **THEN** the primary control targets Luma
- **AND** a secondary control targets `/membership`
