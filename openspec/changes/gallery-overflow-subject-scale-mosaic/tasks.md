# Tasks

## 1. Subject-scale audit

- [x] 1.1 Assign `lg|md|sm` to each of the 26 overflow slots (Vol. 08 + Vol. 09) from subject reading of existing alt text; record as `gallery.subjectScale` on each overflow entry in `scripts/photos.manifest.json` (verify: every overflow slot has one of the three values; hang slots unchanged)
- [x] 1.2 Teach `scripts/build-photos.mjs` to validate `gallery.subjectScale` ∈ `{lg,md,sm}` when present and to emit it on `GalleryFrame` in `src/data/photos.generated.ts` without requiring a full re-encode (verify: `node scripts/build-photos.mjs --check` passes; generated type includes optional or required `subjectScale`)

## 2. Mosaic packing in Gallery.tsx

- [x] 2.1 Replace `OVERFLOW_PLACE` solo stacking with an authored pattern language in `allocate()`: pack overflow by subject scale into 2–3 cell rows (and solo+void for lone `lg`), using literal Tailwind `place`/`phone` strings; map `lg→BLEED`, `md→MEASURE`, `sm→INSET` with alternating inset sides; alternate rails (verify: no overflow row is a single full-measure span-8/12 solo unless it is an intentional voided `lg`)
- [x] 2.2 Cap desktop mosaic spans at ≤6 so existing 640w overflow tiles stay ≥1x at the 1216px measure; update the Gallery.tsx file header comments that describe overflow (verify: header no longer claims unrecognised frames get full-measure solos; span table documents coverage)
- [x] 2.3 Keep `HANG` authored cells, LCP guard (row 0 at rest), focus ring, hover edge, motion stagger, and no dates/chapters/captions (verify: hang preference lists unchanged; row 0 still `animate: false`)

## 3. Generated data + unit coverage

- [x] 3.1 Ensure runtime can read subject scale (prefer generated `subjectScale`; fall back to editorial map mirroring the manifest if emit is deferred) so packing never invents spans (verify: TypeScript compile; every overflow frame in `galleryFrames` resolves to lg/md/sm)
- [x] 3.2 Add a focused unit test for overflow packing against the known 26-frame set (row counts, no full-measure default, scale→phone mapping) (verify: `npm test` includes and passes the new test)

## 4. Verification and PR

- [x] 4.1 Run `npm run lint`, `npx tsc -b`, and `npm test`; fix any regressions (verify: all three exit 0)
- [x] 4.2 Commit OpenSpec artifacts + code on `gallery/overflow-subject-scale-mosaic`, push, open PR against `main` with non-goals (`--only` deferred, no volume chapters) and Netlify preview note (verify: `gh pr view --json url` returns the PR URL; do not merge)
