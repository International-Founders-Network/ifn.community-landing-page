# partners-page Delta

## ADDED Requirements

### Requirement: Partners page stays collaborator-scoped
The system SHALL keep `/partners` focused on working collaborators (venue, format, related operators). Paid sponsorship interest SHALL be directed to `/sponsors` (or contact with sponsor intent), not conflated with collaborator partnership copy.

#### Scenario: Boundary
- **WHEN** a visitor reads `/partners`
- **THEN** the page does not present itself as the sponsorship packages surface
- **AND** a link to `/sponsors` MAY be offered for paid sponsorship inquiries

### Requirement: Partners appears under Collaborate in primary nav
The system SHALL expose `/partners` in the primary navigation under the Collaborate disclosure alongside Sponsors, and in the footer Collaborate column. Partners SHALL NOT replace Workshops or nest Workshops under Events.

#### Scenario: Primary nav Collaborate group
- **WHEN** a visitor opens the primary nav Collaborate disclosure (desktop) or the Collaborate group (mobile)
- **THEN** both Sponsors and Partners are listed
- **AND** Workshops remains a top-level primary nav item
