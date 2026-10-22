## ADDED Requirements

### Requirement: Blog queue shows image readiness
The Admin Blog queue and review drawer SHALL show whether a post's image set is ready and, if not, which files are missing.

#### Scenario: Post without images
- **WHEN** a queued post has `imagesReady: false`
- **THEN** its row says images are missing and that going live fails the build
