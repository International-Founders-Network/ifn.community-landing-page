# qr-bulk-generation Specification

## Purpose
Batch QR generation from a pasted list of URLs, with per-item failure isolation and ZIP export.

## Requirements
### Requirement: Visitors can generate QR codes from a pasted list of URLs
The system SHALL accept a newline-separated list of URLs, deduplicate them, and generate a QR code per valid entry, flagging invalid ones inline without blocking the rest.

#### Scenario: Batch with one invalid entry
- **WHEN** a visitor pastes a list where one line is not a valid URL
- **THEN** all valid lines generate QR codes and the invalid line shows an inline error, without stopping the batch

### Requirement: Bulk-generated URLs can optionally be made trackable
The system SHALL let a visitor enable dynamic mode for the whole batch, creating a short link per URL independently, so one creation failure doesn't affect the others.

#### Scenario: One dynamic-link creation fails
- **WHEN** dynamic mode is enabled and one URL's short-link creation fails
- **THEN** the other URLs' short links are still created and the failed one shows its error

### Requirement: Successfully generated codes can be exported as a ZIP
The system SHALL let a visitor download all successfully generated QR codes as PNG images in a single ZIP file, excluding any errored entries.

#### Scenario: Downloading the batch
- **WHEN** a visitor clicks "Download all" after generating a batch with at least one success
- **THEN** a ZIP containing one PNG per successful entry is downloaded

