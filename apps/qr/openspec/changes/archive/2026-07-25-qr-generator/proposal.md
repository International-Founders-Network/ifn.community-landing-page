## Why

The QR generator shipped as a whole new app (`apps/qr`, deployed at `qr.ifn.community`) with zero written spec anywhere in the repo — one of the two features motivating this OpenSpec adoption in the first place. This retroactive spec establishes its baseline contract now that `apps/qr` has its own independent OpenSpec instance.

## What Changes

No code changes. Establishes `qr-generator` as a tracked capability: content-type input, live style preview, static vs. trackable ("dynamic") QR generation, and download.

## Capabilities

### New Capabilities
- `qr-generator`: The single-QR generator page — content input, style customization, static/dynamic mode, and image download.

### Modified Capabilities
- (none)

## Impact

Documentation only. Affected code (unchanged): `src/pages/Generator.tsx`, `src/components/{ContentTypeTabs,ContentFields,StylePanel,DownloadBar,QRCodePreview}.tsx`, `src/lib/{qrContent,qrStyle,api}.ts`, `netlify/functions/qr-create.ts`.
