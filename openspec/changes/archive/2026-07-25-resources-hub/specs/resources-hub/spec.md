## ADDED Requirements

### Requirement: Visitors can browse resources by audience and stage
The system SHALL render `/resources` with tabs for audience segment and stage, tag-based filtering, and free-text search over `RESOURCES_DATA`.

#### Scenario: Filtering by segment and tag
- **WHEN** a visitor selects a segment tab and a tag filter
- **THEN** only resources matching both are shown

### Requirement: Resource availability reflects content rollout phase
The system SHALL display resources beyond the first 3 per segment as "coming soon" until real content is authored for them.

#### Scenario: Viewing an unauthored resource
- **WHEN** a visitor views a resource still flagged `isComingSoon`
- **THEN** it displays a coming-soon state instead of content
