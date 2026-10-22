import { describe, it, expect } from 'vitest';
import { deployPhase, deriveBuildPhase, POLL_LIMIT_MS, shouldKeepPolling, type DeploySummary } from './buildPhase';

const T = Date.parse('2026-10-22T14:00:00Z');

function deploy(state: string, createdAt = '2026-10-22T14:00:05Z'): { available: true; deploy: DeploySummary } {
    return { available: true, deploy: { state, createdAt, publishedAt: null, deployId: 'd', context: 'production' } };
}

describe('deployPhase', () => {
    it('maps Netlify states', () => {
        expect(deployPhase('ready')).toBe('live');
        expect(deployPhase('error')).toBe('failed');
        expect(deployPhase('rejected')).toBe('failed');
        for (const s of ['new', 'enqueued', 'building', 'uploading', 'processing', 'prepared']) {
            expect(deployPhase(s)).toBe('building');
        }
    });
});

describe('deriveBuildPhase', () => {
    it('is checking before the first response', () => {
        expect(deriveBuildPhase(undefined, T, T)).toBe('checking');
    });

    it('is unavailable without a token or when Netlify could not be read', () => {
        expect(deriveBuildPhase({ available: false }, T, T)).toBe('unavailable');
        expect(deriveBuildPhase({ available: true, error: 'x' }, T, T)).toBe('unavailable');
    });

    it('follows the deploy created after the action', () => {
        expect(deriveBuildPhase(deploy('building'), T, T + 20_000)).toBe('building');
        expect(deriveBuildPhase(deploy('ready'), T, T + 200_000)).toBe('live');
        expect(deriveBuildPhase(deploy('error'), T, T + 200_000)).toBe('failed');
    });

    it('ignores the previous ready deploy and waits for ours', () => {
        expect(deriveBuildPhase(deploy('ready', '2026-10-22T13:00:00Z'), T, T + 15_000)).toBe('waiting');
        expect(deriveBuildPhase({ available: true, deploy: null }, T, T + 15_000)).toBe('waiting');
    });

    it('tolerates a little clock skew', () => {
        expect(deriveBuildPhase(deploy('building', '2026-10-22T13:59:30Z'), T, T + 15_000)).toBe('building');
    });

    it('times out after the polling window', () => {
        expect(deriveBuildPhase(deploy('building'), T, T + POLL_LIMIT_MS + 1)).toBe('timeout');
        expect(deriveBuildPhase({ available: true, deploy: null }, T, T + POLL_LIMIT_MS + 1)).toBe('timeout');
        expect(deriveBuildPhase(deploy('ready'), T, T + POLL_LIMIT_MS + 1)).toBe('live');
    });
});

describe('shouldKeepPolling', () => {
    it('stops on a final phase', () => {
        expect(shouldKeepPolling('building')).toBe(true);
        expect(shouldKeepPolling('waiting')).toBe(true);
        for (const p of ['live', 'failed', 'timeout', 'unavailable'] as const) expect(shouldKeepPolling(p)).toBe(false);
    });
});
