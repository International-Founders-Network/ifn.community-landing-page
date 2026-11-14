## MODIFIED Requirements

### Requirement: Bulk-generated URLs can optionally be made trackable
The system SHALL let a signed-in admin enable dynamic mode for the whole batch, creating a short link per URL independently, so one creation failure doesn't affect the others. When not signed in, dynamic mode SHALL show the sign-in prompt and disable generation. A URL that fails the redirect allowlist SHALL fail individually with the allowlist error.

#### Scenario: One dynamic-link creation fails
- **WHEN** dynamic mode is enabled and one URL's short-link creation fails (including failing the allowlist)
- **THEN** the other URLs' short links are still created and the failed one shows its error
