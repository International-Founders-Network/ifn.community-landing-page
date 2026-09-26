import { describe, it, expect } from 'vitest';
import { chicagoDateKey, chicagoWallTimeToIso, defaultPublishWallTime, isoToChicagoWallTime } from './chicagoTime';

describe('chicagoWallTimeToIso (openspec/changes/blog-editorial-publish)', () => {
    it('uses CDT (-05:00) in summer time', () => {
        expect(chicagoWallTimeToIso('2026-10-01T09:00')).toBe('2026-10-01T09:00:00-05:00');
    });

    it('uses CST (-06:00) in winter', () => {
        expect(chicagoWallTimeToIso('2026-12-01T09:00')).toBe('2026-12-01T09:00:00-06:00');
    });

    it('resolves the day after fall-back correctly', () => {
        expect(chicagoWallTimeToIso('2026-11-02T00:30')).toBe('2026-11-02T00:30:00-06:00');
    });

    it('moves a nonexistent spring-forward time one hour later', () => {
        expect(chicagoWallTimeToIso('2027-03-14T02:30')).toBe('2027-03-14T03:30:00-05:00');
    });

    it('rejects malformed input', () => {
        expect(chicagoWallTimeToIso('2026-10-01')).toBeNull();
    });

    it('round-trips through the input format', () => {
        const iso = chicagoWallTimeToIso('2026-10-01T09:00')!;
        expect(isoToChicagoWallTime(iso)).toBe('2026-10-01T09:00');
        expect(isoToChicagoWallTime('2026-10-01T14:00:00Z')).toBe('2026-10-01T09:00');
    });

    it('groups by Chicago day, not UTC day', () => {
        // 03:00Z on Oct 2 is still Oct 1 in Chicago.
        expect(chicagoDateKey('2026-10-02T03:00:00Z')).toBe('2026-10-01');
    });
});

describe('chicagoWallTimeToIso fall-back ambiguity', () => {
    it('picks the first (CDT) occurrence of a repeated hour', () => {
        expect(chicagoWallTimeToIso('2026-11-01T01:30')).toBe('2026-11-01T01:30:00-05:00');
    });
});

describe('defaultPublishWallTime (openspec/changes/admin-ux-blog-links-review)', () => {
    it('prefills 09:00 on the frontmatter date when publishAt is empty', () => {
        expect(defaultPublishWallTime(null, '2026-10-01')).toBe('2026-10-01T09:00');
    });

    it('keeps an existing publishAt, shown in Chicago wall time', () => {
        expect(defaultPublishWallTime('2026-10-03T19:30:00Z', '2026-10-01')).toBe('2026-10-03T14:30');
    });

    it('resolves to the right Chicago offset on either side of DST', () => {
        expect(chicagoWallTimeToIso(defaultPublishWallTime(null, '2026-09-29'))).toBe('2026-09-29T09:00:00-05:00');
        expect(chicagoWallTimeToIso(defaultPublishWallTime(null, '2026-12-01'))).toBe('2026-12-01T09:00:00-06:00');
    });

    it('leaves the picker empty when the date is unusable', () => {
        expect(defaultPublishWallTime(null, '')).toBe('');
        expect(defaultPublishWallTime(null, '2026-10-01T09:00')).toBe('');
    });
});
