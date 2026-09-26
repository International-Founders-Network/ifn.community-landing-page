import { describe, it, expect } from 'vitest';
import { chicagoDateKey, chicagoWallTimeToIso, isoToChicagoWallTime } from './chicagoTime';

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
