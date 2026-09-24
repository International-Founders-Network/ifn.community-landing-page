/**
 * Subject-scale overflow mosaic for `/gallery`.
 *
 * The authored hang claims fifteen frames. Everything else packs here by an
 * audited subject scale (lg|md|sm), not as stacked full-measure solos.
 *
 * Desktop spans stay ≤6 so existing 640w overflow tiles remain ≥1× at the
 * 1216px measure (span 6 ≈ 596 CSS px). Phone classes follow subject scale:
 * lg→BLEED, md→MEASURE, sm→INSET, matching the hang's three-class ladder.
 *
 * Every `place` / `phone` string is a literal Tailwind candidate. Tailwind v4
 * scans source text; interpolated class names generate nothing.
 */

export type SubjectScale = 'lg' | 'md' | 'sm';

export interface MosaicCell {
  scale: SubjectScale;
  place: string;
  phone: string;
}

export interface MosaicRow {
  align: 'start' | 'end';
  cells: MosaicCell[];
}

/** Phone size classes — same literals Gallery.tsx uses for the hang. */
export const BLEED = '-mx-3 sm:mx-0';
export const MEASURE = '';
export const INSET_LEFT = 'w-[85%] mr-auto sm:mr-0 sm:w-auto';
export const INSET_RIGHT = 'w-[85%] ml-auto sm:ml-0 sm:w-auto';

const PLACE = {
  /** Solo lg with void on the right. */
  lgSoloLeft:
    'sm:col-start-1 sm:col-span-8 lg:col-start-1 lg:col-span-6',
  /** Solo lg with void on the left. */
  lgSoloRight:
    'sm:col-start-5 sm:col-span-8 lg:col-start-7 lg:col-span-6',
  /** lg in an lg+sm pair. */
  lgWithSm:
    'sm:col-start-1 sm:col-span-7 lg:col-start-1 lg:col-span-6',
  smWithLg:
    'sm:col-start-8 sm:col-span-5 lg:col-start-9 lg:col-span-4',
  /** Two md cells. */
  mdLeft:
    'sm:col-start-1 sm:col-span-6 lg:col-start-1 lg:col-span-6',
  mdRight:
    'sm:col-start-7 sm:col-span-6 lg:col-start-7 lg:col-span-6',
  /** md+sm. */
  mdWithSm:
    'sm:col-start-1 sm:col-span-7 lg:col-start-1 lg:col-span-6',
  smWithMd:
    'sm:col-start-8 sm:col-span-5 lg:col-start-8 lg:col-span-5',
  /** Three sm. */
  smTriple1:
    'sm:col-start-1 sm:col-span-4 lg:col-start-1 lg:col-span-4',
  smTriple2:
    'sm:col-start-5 sm:col-span-4 lg:col-start-5 lg:col-span-4',
  smTriple3:
    'sm:col-start-9 sm:col-span-4 lg:col-start-9 lg:col-span-4',
  /** Two sm, indented quiet pair. */
  smPairLeft:
    'sm:col-start-2 sm:col-span-5 lg:col-start-2 lg:col-span-5',
  smPairRight:
    'sm:col-start-8 sm:col-span-5 lg:col-start-8 lg:col-span-5',
  /** Lone md with void. */
  mdSoloLeft:
    'sm:col-start-1 sm:col-span-7 lg:col-start-1 lg:col-span-5',
  mdSoloRight:
    'sm:col-start-6 sm:col-span-7 lg:col-start-8 lg:col-span-5',
  /** Lone sm with void. */
  smSoloLeft:
    'sm:col-start-1 sm:col-span-5 lg:col-start-1 lg:col-span-4',
  smSoloRight:
    'sm:col-start-8 sm:col-span-5 lg:col-start-9 lg:col-span-4',
} as const;

function phoneFor(scale: SubjectScale, insetToggle: { n: number }): string {
  if (scale === 'lg') return BLEED;
  if (scale === 'md') return MEASURE;
  const phone = insetToggle.n % 2 === 0 ? INSET_RIGHT : INSET_LEFT;
  insetToggle.n += 1;
  return phone;
}

/**
 * Pack a sequence of subject scales into mosaic rows.
 * Prefers denser patterns; falls back to solo+void rather than inventing spans.
 */
export function packSubjectScales(scales: SubjectScale[]): MosaicRow[] {
  const rows: MosaicRow[] = [];
  const inset = { n: 0 };
  let i = 0;
  let rail: 'start' | 'end' = 'start';
  let lgSoloSide: 'left' | 'right' = 'left';

  const push = (cells: MosaicCell[]) => {
    rows.push({ align: rail, cells });
    rail = rail === 'start' ? 'end' : 'start';
  };

  const cell = (scale: SubjectScale, place: string): MosaicCell => ({
    scale,
    place,
    phone: phoneFor(scale, inset),
  });

  while (i < scales.length) {
    const a = scales[i];
    const b = scales[i + 1];
    const c = scales[i + 2];

    if (a === 'lg' && b === 'sm') {
      push([cell('lg', PLACE.lgWithSm), cell('sm', PLACE.smWithLg)]);
      i += 2;
      continue;
    }
    if (a === 'lg') {
      const place = lgSoloSide === 'left' ? PLACE.lgSoloLeft : PLACE.lgSoloRight;
      lgSoloSide = lgSoloSide === 'left' ? 'right' : 'left';
      push([cell('lg', place)]);
      i += 1;
      continue;
    }
    if (a === 'md' && b === 'md') {
      push([cell('md', PLACE.mdLeft), cell('md', PLACE.mdRight)]);
      i += 2;
      continue;
    }
    if (a === 'md' && b === 'sm') {
      push([cell('md', PLACE.mdWithSm), cell('sm', PLACE.smWithMd)]);
      i += 2;
      continue;
    }
    if (a === 'md') {
      const place = rows.length % 2 === 0 ? PLACE.mdSoloLeft : PLACE.mdSoloRight;
      push([cell('md', place)]);
      i += 1;
      continue;
    }
    // a === 'sm'
    if (b === 'sm' && c === 'sm') {
      push([
        cell('sm', PLACE.smTriple1),
        cell('sm', PLACE.smTriple2),
        cell('sm', PLACE.smTriple3),
      ]);
      i += 3;
      continue;
    }
    if (b === 'sm') {
      push([cell('sm', PLACE.smPairLeft), cell('sm', PLACE.smPairRight)]);
      i += 2;
      continue;
    }
    if (b === 'md') {
      // sm+md: flip to md+sm ordering for the place literals
      push([cell('md', PLACE.mdWithSm), cell('sm', PLACE.smWithMd)]);
      i += 2;
      continue;
    }
    const place = rows.length % 2 === 0 ? PLACE.smSoloLeft : PLACE.smSoloRight;
    push([cell('sm', place)]);
    i += 1;
  }

  return rows;
}

/** Resolve subject scale from frame field or audited fallback map. */
export function resolveSubjectScale(
  frame: { slot: string; subjectScale?: SubjectScale },
  fallback: Record<string, SubjectScale>,
): SubjectScale {
  if (frame.subjectScale === 'lg' || frame.subjectScale === 'md' || frame.subjectScale === 'sm') {
    return frame.subjectScale;
  }
  const hit = fallback[frame.slot];
  if (hit) return hit;
  // Last resort: mid scale. Prefer fixing the manifest over inventing a span.
  return 'md';
}

/**
 * Editorial subject-scale map for Vol. 08 + Vol. 09 overflow.
 * Mirrors `gallery.subjectScale` in scripts/photos.manifest.json.
 */
export const OVERFLOW_SUBJECT_SCALE: Record<string, SubjectScale> = {
  'gallery-aug-group': 'lg',
  'gallery-aug-audience': 'lg',
  'gallery-aug-room': 'lg',
  'gallery-aug-rows': 'lg',
  'gallery-aug-address': 'lg',
  'gallery-sep-rows': 'lg',
  'gallery-sep-listening': 'lg',
  'gallery-sep-midroom': 'lg',
  'gallery-sep-group': 'lg',
  'gallery-aug-listening': 'md',
  'gallery-aug-standing': 'md',
  'gallery-aug-networking': 'md',
  'gallery-aug-lounge': 'md',
  'gallery-aug-midroom': 'md',
  'gallery-aug-skyline': 'md',
  'gallery-aug-dusk': 'md',
  'gallery-aug-night': 'md',
  'gallery-aug-posters': 'sm',
  'gallery-aug-wall': 'sm',
  'gallery-aug-gesture': 'sm',
  'gallery-aug-pose': 'sm',
  'gallery-aug-counter': 'sm',
  'gallery-sep-gesture': 'sm',
  'gallery-sep-chat': 'sm',
  'gallery-sep-pose': 'sm',
  'gallery-sep-talk': 'sm',
};
