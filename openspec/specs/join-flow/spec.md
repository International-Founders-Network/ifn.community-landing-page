# join-flow Specification

## Purpose
The Join modal and its `/api/join` backend: the primary founder-application intake flow linked from CTAs across the site.

## Requirements
### Requirement: Visitors can submit a founder application
The system SHALL provide a Join modal collecting name, email, LinkedIn, and stage, dismissible via Escape key or backdrop click, submitting to `/api/join`.

#### Scenario: Opening and submitting the modal
- **WHEN** a visitor opens the Join modal and submits the form
- **THEN** a `POST` request is made to `/api/join` and the modal shows a success state on a 200 response

### Requirement: Join submissions are persisted
The system SHALL persist submitted join applications to the `join_applications` table, creating the table if it does not already exist.

#### Scenario: Successful submission
- **WHEN** `/api/join` receives a `POST` request
- **THEN** a new row is inserted into `join_applications` and a success response is returned

