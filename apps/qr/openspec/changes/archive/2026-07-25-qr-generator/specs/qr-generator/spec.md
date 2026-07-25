## ADDED Requirements

### Requirement: Visitors can generate a styled QR code from content
The system SHALL let a visitor choose a content type, fill in its fields, customize QR style, and see a live preview update as either changes.

#### Scenario: Editing content or style
- **WHEN** a visitor edits the content fields or a style option
- **THEN** the QR preview updates to reflect the change without a page reload

### Requirement: URL content can be made trackable
The system SHALL let a visitor turn a URL QR code into a "dynamic" one, calling `/api/qr-create` to mint a short link whose destination can be edited later without reprinting the code.

#### Scenario: Enabling dynamic mode
- **WHEN** a visitor enables dynamic mode for URL content and confirms
- **THEN** a short link is created and the QR code encodes that short link instead of the raw URL

### Requirement: Generated QR codes can be downloaded
The system SHALL let a visitor download the current QR code as PNG, SVG, or JPEG.

#### Scenario: Downloading an image
- **WHEN** a visitor selects a download format
- **THEN** the current QR code is downloaded in that format
