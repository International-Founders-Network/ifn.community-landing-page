import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createFakeDb, createFakeSql, type FakeDb } from './fakeSql';

const state = vi.hoisted(() => ({ db: null as unknown as FakeDb }));
vi.mock('../functions/_lib/db', () => ({
    getSql: () => createFakeSql(state.db),
    ensureQrTables: async () => {},
    getBaseUrl: () => 'https://qr.ifn.community',
}));

import { handler as qrRedirect } from '../functions/qr-redirect';

function seed(code: string, target: string) {
    state.db.links.push({
        id: state.db.links.length + 1,
        code,
        edit_token: `tok-${code}`,
        target_url: target,
        label: null,
        created_at: '2026-10-23T00:00:00Z',
        updated_at: '2026-10-23T00:00:00Z',
    });
}

async function hit(code: string): Promise<HandlerResponse> {
    const e = { httpMethod: 'GET', path: `/r/${code}`, headers: { 'user-agent': 'test' }, queryStringParameters: {} } as unknown as HandlerEvent;
    return (await qrRedirect(e, {} as never)) as HandlerResponse;
}

beforeEach(() => {
    state.db = createFakeDb();
});

describe('qr-redirect enforces the allowlist at redirect time (public, no auth)', () => {
    it('302s to an allowlisted target and logs the scan', async () => {
        seed('good123', 'https://lu.ma/IFN_ATX');
        const res = await hit('good123');
        expect(res.statusCode).toBe(302);
        expect(res.headers!.Location).toBe('https://lu.ma/IFN_ATX');
        expect(state.db.scans).toHaveLength(1);
    });

    it.each([
        'https://evil.com/phish',
        'http://ifn.community/events',
        'https://ifn.community.evil.com/',
        'https://ifn.community@evil.com/',
        'https://ifn.community:8443/',
        'javascript:alert(1)',
    ])('does not redirect a stored non-allowlisted target: %s', async (target) => {
        seed('bad1234', target);
        const res = await hit('bad1234');
        expect(res.statusCode).toBe(404);
        expect(res.headers!.Location).toBeUndefined();
        expect(String(res.headers!['Content-Security-Policy'])).toContain("default-src 'none'");
        expect(res.body).not.toContain(target);
        expect(state.db.scans).toHaveLength(0);
    });

    it('404s an unknown code', async () => {
        const res = await hit('nope999');
        expect(res.statusCode).toBe(404);
        expect(res.headers!.Location).toBeUndefined();
    });

    it('emits the normalised URL in Location', async () => {
        seed('norm123', 'https://IFN.community/a b');
        const res = await hit('norm123');
        expect(res.headers!.Location).toBe('https://ifn.community/a%20b');
    });
});
