## ADDED Requirements

### Requirement: Blog queue shows image readiness
The Admin Blog queue and review drawer SHALL show whether a post's image set is ready and, if not, which files are missing.

#### Scenario: Post without images
- **WHEN** a queued post has `imagesReady: false`
- **THEN** its row says images are missing and that Mark live and Schedule are blocked until the set is complete

#### Scenario: Mark live without images
- **WHEN** an approved or scheduled post has `imagesReady: false` and Admin chooses Mark live
- **THEN** the action is refused with an error naming the missing files and `node scripts/build-blog-og-images.mjs <slug>`

#### Scenario: Schedule without images
- **WHEN** an approved or scheduled post has `imagesReady: false` and Admin chooses Schedule
- **THEN** the action is refused with an error naming the missing files and `node scripts/build-blog-og-images.mjs <slug>`
