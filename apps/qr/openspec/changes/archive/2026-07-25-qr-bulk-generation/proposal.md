## Why

Bulk generation is a distinct flow (paste many URLs, style once, export a ZIP) from the single-item generator, with its own state and failure handling. Documenting it separately keeps each spec's acceptance criteria focused.

## What Changes

No code changes. Establishes `qr-bulk-generation` as a tracked capability.

## Capabilities

### New Capabilities
- `qr-bulk-generation`: Paste a list of URLs, generate a QR code per line (optionally trackable), and export all as a ZIP.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Bulk.tsx`, `src/components/{StylePanel,QRCodePreview}.tsx`, `src/lib/api.ts`.
