## MODIFIED Requirements

### Requirement: Unbuilt routes render a placeholder rather than error
The system SHALL render `/careers`, `/chapters`, `/membership`, `/mentorship`, `/newsletter`, `/partners`, `/playbooks`, and `/blog` each with a page title and a "Coming soon" message, with no data fetching or async state.

#### Scenario: Visiting a placeholder route
- **WHEN** a visitor navigates to any of these eight routes
- **THEN** a titled placeholder page renders immediately, with no loading state and no console errors
