# Design

## Context

See proposal.md for motivation. Today `allocate()` fills the authored `HANG`
(fifteen cells, nine rows), then appends every leftover frame as its own row
with `OVERFLOW_PLACE` alternating `span-8` solos and `phone: MEASURE`. Vol. 08
+ Vol. 09 add twenty-six leftovers, so the page ends as a list.

Brand constraints that bind this design: DESIGN.md Ragged Edge Rule and
Whitespace-Not-Rules; Gallery.tsx header comments (no dates/chapters/captions,
Archivo, radius 0 on frames, accent red only for checkable actions, flat page,
LCP guard on header + row 0). Netlify Free: no photo rebuild unless mosaic
spans would drop tile coverage below 1x.

## Goals / Non-Goals

**Goals:**
- Overflow reads as a continuation of the hang: unequal sizes, voids, alternating rails.
- Every overflow frame gets a deliberate `lg|md|sm` size from audited subject scale.
- Phone collapse stays three-class (`BLEED`/`MEASURE`/`INSET`) in the same file.
- Existing 640w overflow tiles remain honest (≥1x at the chosen spans).
- OpenSpec artifacts ship with the code.

**Non-Goals:**
- Per-volume or per-evening chapters/labels on `/gallery`.
- Re-authoring the fifteen-cell hang.
- Raising overflow tiles to 704/832/960 in this PR (keep 640; span ladder capped).
- Implementing `--only` / skip-unchanged on `build-photos.mjs` unless trivial
  (deferred; call out in the PR body).
- Changing lightbox, landing `GalleryPreview`, or consent/crop choices.

## Decisions

### 1. Subject scale lives as an audited map, not random spans

**Choice:** Assign each overflow slot `lg | md | sm` from subject reading
(group/room/audience → `lg`; mid-room clusters → `md`; two-person talk/gesture/pose → `sm`).
Record it on `gallery.subjectScale` in `scripts/photos.manifest.json` and drive
packing from that value (emitted on `GalleryFrame` when the build path is
updated; otherwise a keyed editorial map in `Gallery.tsx` mirroring the
manifest until the next photos emit).

**Alternatives:** Random/round-robin spans (rejected — invents composition);
infer scale from alt text at runtime (rejected — fragile); reuse `grade`
(rejected — colour grade, not subject).

### 2. Mosaic pattern language in `allocate()`, literal Tailwind classes

**Choice:** After the hang pass, pack overflow greedily into authored patterns
with **literal** `place` / `phone` strings (Tailwind v4 scans source text):

| Pattern | Desktop (12-col) | Phone |
| --- | --- | --- |
| solo `lg` + void (alt L/R) | span 6 start 1 or start 7 | `BLEED` |
| `lg` + `sm` | span 6 + span 4 with void | `BLEED` + `INSET` |
| `md` + `md` | span 6 + span 6 | `MEASURE` + `MEASURE` |
| `md` + `sm` | span 6 + span 5 (1 void) | `MEASURE` + `INSET` |
| `sm` + `sm` + `sm` | span 4 × 3 | `INSET` alternating |
| `sm` + `sm` | span 5 + span 5 indent | `INSET` alternating |

Rails alternate `start` / `end` across mosaic rows. Prefer denser patterns when
the next scales match; fall back to solo+void rather than inventing a span.

**Why span ≤ 6:** All current overflow tiles are 640w. At the 1216px measure,
span 6 ≈ 596 CSS px (1.07x); span 7 ≈ 699 (0.91x, below 1x). Cap at 6 so this
PR does not require re-encoding. Ladder lg/md/sm = 6/5/4 still yields ~1.53x
largest-to-smallest — enough asymmetry for the Ragged Edge Rule.

**Alternatives:** Full hang ladder including span 8/9 (needs 832/960 rebuild);
CSS columns / masonry library (off-brand, less authored control).

### 3. Phone class follows subject scale, not only desktop span

**Choice:** `lg → BLEED`, `md → MEASURE`, `sm → INSET_(L|R)` alternating in
reading order — same three classes and focus-ring gutter rules as the hang,
even though desktop max span is 6. Editorial mapping stays one decision.

### 4. Tile pipeline and `--only`

**Choice:** Leave overflow `tileWidth` at 640. Update build validation to accept
optional `gallery.subjectScale` in `{lg,md,sm}` and emit it on `GalleryFrame`
when regenerating. Do **not** implement `--only` in this PR unless it is a
small additive flag; full rebuild still re-encodes every slot and is ~30m —
deferred with an explicit PR note.

### 5. File header comments

**Choice:** Replace the `OVERFLOW_PLACE` rationale in `Gallery.tsx` with the
mosaic contract (pattern language, scale mapping, span cap / coverage honesty,
phone mapping), so the next reader does not inherit the "no audited scale →
full measure solo" rule.

## Risks / Trade-offs

- **[Risk] Span-6 lg understates room-scale subjects vs hang span-8/9** → Mitigation: phone `BLEED` restores emphasis on small viewports; follow-up can raise overflow `lg` tiles to 832 and widen spans once `--only` exists.
- **[Risk] Greedy packing leaves awkward leftovers** → Mitigation: pattern table includes solo+void and `sm+sm`; unit-test allocate packing for the known 26-frame set.
- **[Risk] Manifest `subjectScale` and Gallery map drift** → Mitigation: prefer emitting from the build; if both exist temporarily, build emit wins and the map is deleted once generated.
- **[Risk] Budget creep if tiles are later raised** → Mitigation: keep budget check; PR does not change tile bytes.

## Migration Plan

1. Land OpenSpec artifacts + code on `gallery/overflow-subject-scale-mosaic`.
2. PR against `main`; Netlify deploy preview for visual check.
3. No data migration. Rollback = revert the PR; hang path is untouched.
4. Follow-up: `--only` on `build-photos.mjs`, then optional overflow `lg` → 832w.

## Open Questions

None that block implementation. Scale assignments for the twenty-six Vol. 08/09
slots are decided in tasks from subject reading of existing alt text.
