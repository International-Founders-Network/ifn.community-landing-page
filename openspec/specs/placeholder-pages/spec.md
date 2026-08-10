# placeholder-pages Specification

## Purpose
Routes that are intentionally not yet built: Careers, Chapters, Mentorship, Newsletter, Playbooks, Blog. Documented explicitly so "coming soon" reads as a deliberate state, not a bug. (Partners was removed once it shipped: see `partners-page`. Membership was removed once it shipped: see `membership-page`.)
## Requirements
### Requirement: Unbuilt routes render a placeholder rather than error
The system SHALL render `/careers`, `/chapters`, `/mentorship`, `/newsletter`, `/playbooks`, and `/blog` each with a page title and a "Coming soon" message, with no data fetching or async state.

#### Scenario: Visiting a placeholder route
- **WHEN** a visitor navigates to any of these six routes
- **THEN** a titled placeholder page renders immediately, with no loading state and no console errors
