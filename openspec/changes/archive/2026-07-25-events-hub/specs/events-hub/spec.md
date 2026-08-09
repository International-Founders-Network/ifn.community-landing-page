## ADDED Requirements

### Requirement: Visitors can browse upcoming events
The system SHALL render the Events page from `GET /api/events`, falling back to the bundled `src/data/events.json` if the request fails, and support client-side filtering by location and time.

#### Scenario: Normal load
- **WHEN** a visitor opens the Events page and the API request succeeds
- **THEN** the filtered event list renders from live data

#### Scenario: API failure
- **WHEN** `GET /api/events` fails or returns no rows
- **THEN** the page renders from the bundled fallback dataset instead of showing an error

### Requirement: Visitors can sign up for event notifications
The system SHALL provide a signup form on the Events page requiring an email address, submitting to `/api/event-signup`, which validates the field is present and email-formatted before persisting it.

#### Scenario: Valid signup
- **WHEN** a visitor submits a well-formed email to the signup form
- **THEN** `/api/event-signup` persists it and the form shows a success state

### Requirement: Event data is kept current via scheduled scraping
The system SHALL run a scheduled job that scrapes Luma and Meetup event listings, deduplicates them by start time, and writes the merged result to the bundled fallback dataset, on the 1st and 15th of each month and on manual trigger.

#### Scenario: Scheduled sync finds changes
- **WHEN** the sync workflow runs and the merged event data differs from what's committed
- **THEN** the updated `events.json` is committed to `main`
