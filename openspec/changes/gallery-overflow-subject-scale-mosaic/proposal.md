# Proposal

## Why

Vol. 08 (18) and Vol. 09 (8) overflow currently appends as one full-measure
`span-8` solo row per frame (`OVERFLOW_PLACE` in `Gallery.tsx`). Twenty-six
stacked solos read as a list, not a hang. The founder rejected per-volume
chapters (incomplete coverage would imply missing meetups). The authored
fifteen-cell hang stays as unnamed highlights; overflow must continue its
rhythm as a subject-scale mosaic.

## What Changes

- Replace overflow stacking with a **subject-scale `lg|md|sm` masonry mosaic**:
  unequal cell sizes from audited subject scale, voids/air, alternating top and
  bottom rails, phone collapse via `BLEED` / `MEASURE` / `INSET`, same focus
  ring, hover edge, and motion conventions as the hang.
- Keep the authored `HANG` composition unchanged (fifteen cells, nine rows).
- Still no dates, evening labels, volume chapters, or captions on `/gallery`
  (alt stays).
- Record an audited `subjectScale` per overflow frame (manifest field and/or
  editorial map in `Gallery.tsx`) so spans are not random.
- Cap mosaic desktop spans so existing 640w overflow tiles stay at or above 1x
  coverage; do not block this PR on a photo rebuild.
- `--only` / skip-unchanged on `build-photos.mjs` is a nice-to-have; defer if
  not cheap.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `gallery`: Overflow after the hang is a subject-scale mosaic of 2–3 cell rows
  (and intentional solo+void rows), not stacked full-measure solos. Subject
  scale is audited. Hang, no-dates/no-chapters/no-captions, LCP guard, and tile
  budget honesty remain.

## Impact

- `src/pages/Gallery.tsx` — overflow packing, header comments, phone mapping
- `scripts/photos.manifest.json` — optional/required `gallery.subjectScale` on
  overflow slots
- `scripts/build-photos.mjs` — validate/emit `subjectScale` when present; no
  full re-encode required if tile widths stay 640
- `src/data/photos.generated.ts` — emit `subjectScale` if the build path is
  updated (or keep an editorial map in `Gallery.tsx` until then)
- Netlify Free deploy preview via PR; no new dependencies
