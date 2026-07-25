# contact-flow Specification

## Purpose
The Contact page form and its `/api/contact` backend — a general-inquiry channel, storing messages in Postgres for admin review (no outbound notification yet).

## Requirements
### Requirement: Visitors can submit a contact message
The system SHALL provide a Contact form requiring name, email, and message (phone and company optional), submitting to `/api/contact`.

#### Scenario: Submitting complete required fields
- **WHEN** a visitor submits the form with name, email, and message filled in
- **THEN** a `POST` request is made to `/api/contact` and a success message is shown on a 200 response

### Requirement: Contact submissions are validated server-side
The system SHALL reject the request with a 400 status if name, email, or message is missing, or if the email fails a basic format check.

#### Scenario: Missing a required field
- **WHEN** `/api/contact` receives a request missing name, email, or message
- **THEN** it responds with 400 and an error message, and no row is inserted

### Requirement: Contact submissions are persisted
The system SHALL persist valid submissions to the `contact_messages` table, creating the table if it does not already exist.

#### Scenario: Successful submission
- **WHEN** `/api/contact` receives a valid `POST` request
- **THEN** a new row is inserted into `contact_messages` and a 200 response is returned

