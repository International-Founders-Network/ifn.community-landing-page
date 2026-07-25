## Context

`Generator.tsx` lets a visitor pick a content type (URL and others via `ContentTypeTabs`/`ContentFields`), customize appearance (`StylePanel`), and preview live (`QRCodePreview`, backed by `qr-code-styling`). For URL content, an optional "dynamic" mode calls `POST /api/qr-create` (via `createDynamicLink`) to mint a trackable short link (`qr.ifn.community/r/<code>`) whose destination can later be edited without reprinting the code — the QR image encodes the short link, not the destination directly, and edits to the destination sync back with a debounce (see `qr-link-management`).

## Goals / Non-Goals

**Goals:**
- Document the current static-vs-dynamic generation contract and download behavior.

**Non-Goals:**
- Not covering the redirect/scan-tracking mechanics themselves — that's `qr-link-management`.
- Not covering bulk generation — that's `qr-bulk-generation`.

## Decisions

- Kept as its own capability distinct from bulk generation, since the single-item flow has meaningfully different UI/state (live preview, inline dynamic-link creation with sync) than the batch flow.

## Risks / Trade-offs

- None significant — this was the first capability to get its lint/typecheck gaps fixed as part of making `apps/qr` fully independent (see the `apps/qr` independence work: fixed a missing `@netlify/functions` dependency, type-only import requirements, and a Neon generic-typing mismatch that had never been caught before).
