# placeholder-pages Delta

## MODIFIED Requirements

### Requirement: Unbuilt routes render a placeholder rather than error
The system SHALL render `/careers`, `/chapters`, `/mentorship`, `/newsletter`, and `/playbooks` each with a page title and a "Coming soon" message, with no data fetching or async state.

`/blog` is no longer a placeholder; see the `blog` capability.

#### Scenario: Visiting a placeholder route
- **WHEN** a visitor navigates to any of `/careers`, `/chapters`, `/mentorship`, `/newsletter`, or `/playbooks`
- **THEN** a titled placeholder page renders immediately, with no loading state and no console errors

#### Scenario: Visiting /blog after blog host ships
- **WHEN** a visitor navigates to `/blog`
- **THEN** the real blog index renders (not the ComingSoon stub)
