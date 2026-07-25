## Context

`Bulk.tsx` splits pasted text into lines, deduplicates them, and validates each as an HTTP(S) URL. In static mode, invalid lines are just flagged inline. In dynamic mode, each URL is submitted to `/api/qr-create` via `Promise.allSettled`, so one failure doesn't block the rest — failures are shown per-item. Successfully generated codes can be exported together as a ZIP (`JSZip`), skipping any errored entries.

## Goals / Non-Goals

**Goals:**
- Document the current per-line validation, partial-failure handling, and ZIP export behavior.

**Non-Goals:**
- Not covering the single-item generator (`qr-generator`) or the redirect/management flow (`qr-link-management`).

## Decisions

- Deliberately per-item failure isolation (`Promise.allSettled`) rather than all-or-nothing — one bad URL in a pasted batch shouldn't block the rest from generating.

## Risks / Trade-offs

- None significant.
