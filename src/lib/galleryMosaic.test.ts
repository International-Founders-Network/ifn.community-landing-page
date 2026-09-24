import { describe, expect, it } from 'vitest';
import {
  BLEED,
  INSET_LEFT,
  INSET_RIGHT,
  MEASURE,
  OVERFLOW_SUBJECT_SCALE,
  packSubjectScales,
  resolveSubjectScale,
  type SubjectScale,
} from './galleryMosaic';

/** Vol. 08 + Vol. 09 overflow in manifest order (26 frames). */
const OVERFLOW_SLOTS = [
  'gallery-aug-group',
  'gallery-aug-audience',
  'gallery-aug-room',
  'gallery-aug-rows',
  'gallery-aug-listening',
  'gallery-aug-standing',
  'gallery-aug-address',
  'gallery-aug-networking',
  'gallery-aug-lounge',
  'gallery-aug-posters',
  'gallery-aug-wall',
  'gallery-aug-gesture',
  'gallery-aug-midroom',
  'gallery-aug-pose',
  'gallery-aug-skyline',
  'gallery-aug-counter',
  'gallery-aug-dusk',
  'gallery-aug-night',
  'gallery-sep-rows',
  'gallery-sep-listening',
  'gallery-sep-midroom',
  'gallery-sep-gesture',
  'gallery-sep-chat',
  'gallery-sep-pose',
  'gallery-sep-talk',
  'gallery-sep-group',
] as const;

describe('galleryMosaic', () => {
  it('maps every Vol. 08/09 overflow slot to an audited subject scale', () => {
    expect(OVERFLOW_SLOTS).toHaveLength(26);
    for (const slot of OVERFLOW_SLOTS) {
      expect(OVERFLOW_SUBJECT_SCALE[slot]).toMatch(/^lg|md|sm$/);
    }
  });

  it('packs the 26-frame overflow without full-measure solo defaults', () => {
    const scales = OVERFLOW_SLOTS.map(
      (slot) => OVERFLOW_SUBJECT_SCALE[slot] as SubjectScale,
    );
    const rows = packSubjectScales(scales);
    const cellCount = rows.reduce((n, row) => n + row.cells.length, 0);
    expect(cellCount).toBe(26);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(26); // denser than one-per-row

    for (const row of rows) {
      expect(row.cells.length).toBeGreaterThanOrEqual(1);
      expect(row.cells.length).toBeLessThanOrEqual(3);
      for (const cell of row.cells) {
        // Span cap: no overflow cell may claim span 7–12 on lg.
        expect(cell.place).not.toMatch(/lg:col-span-(?:[7-9]|1[0-2])\b/);
        // Must be a literal place string, not empty.
        expect(cell.place.length).toBeGreaterThan(10);
      }
    }
  });

  it('maps subject scale to the hang phone ladder', () => {
    const rows = packSubjectScales(['lg', 'md', 'sm', 'sm']);
    const phones = rows.flatMap((row) => row.cells.map((c) => c.phone));
    expect(phones[0]).toBe(BLEED);
    expect(phones[1]).toBe(MEASURE);
    expect([INSET_LEFT, INSET_RIGHT]).toContain(phones[2]);
    expect([INSET_LEFT, INSET_RIGHT]).toContain(phones[3]);
    expect(phones[2]).not.toBe(phones[3]);
  });

  it('alternates rails across mosaic rows', () => {
    const rows = packSubjectScales(['lg', 'lg', 'md', 'md', 'sm', 'sm', 'sm']);
    const aligns = rows.map((r) => r.align);
    expect(aligns[0]).toBe('start');
    for (let i = 1; i < aligns.length; i += 1) {
      expect(aligns[i]).not.toBe(aligns[i - 1]);
    }
  });

  it('prefers frame.subjectScale over the fallback map', () => {
    expect(
      resolveSubjectScale(
        { slot: 'gallery-aug-group', subjectScale: 'sm' },
        OVERFLOW_SUBJECT_SCALE,
      ),
    ).toBe('sm');
    expect(
      resolveSubjectScale({ slot: 'gallery-aug-group' }, OVERFLOW_SUBJECT_SCALE),
    ).toBe('lg');
  });
});
