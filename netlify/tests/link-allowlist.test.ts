import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import {
    applyLinkAction,
    isActionable,
    loadLinkSeed,
    mergeLinkOverlay,
    type LinkOverlayRow,
} from '../functions/_lib/linkAllowlist';
import { createSessionCookie } from '../functions/_lib/auth';
import { handler } from '../functions/admin-links';

/**
 * In-memory stand-in for the `link_allowlist` table, so the PATCH path (write,
 * rebuild, read back) runs without a database. Only this file sees the mock.
 */
const db = vi.hoisted(() => ({
    rows: new Map<string, Record<string, unknown>>(),
}));

vi.mock('@neondatabase/serverless', () => ({
    neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
        const text = strings.join('?').replace(/\s+/g, ' ').trim();
        if (text.startsWith('CREATE TABLE IF NOT EXISTS link_allowlist')) return [];
        if (text.startsWith('SELECT id, status, allow_outbound')) return [...db.rows.values()];
        if (text.startsWith('INSERT INTO link_allowlist')) {
            const [id, status, allowOutbound, updatedBy] = values;
            db.rows.set(String(id), {
                id,
                status,
                allow_outbound: allowOutbound,
                updated_at: new Date('2026-09-26T16:00:00Z'),
                updated_by: updatedBy,
            });
            return [];
        }
        throw new Error(`Unexpected SQL in test: ${text}`);
    },
}));

const COOLEY = 'potential-cooley-foreign-founders-visas-corporate-2025';
const MERCURY = 'potential-mercury-open-us-bank-account';
const STATION = 'partner-station-austin';
const YANI = 'partner-yani-partners';
const HOOK = 'https://api.netlify.com/build_hooks/test-hook';

function overlayRow(id: string, status: LinkOverlayRow['status'], allowOutbound: boolean): LinkOverlayRow {
    return { id, status, allowOutbound, updatedAt: '2026-09-26T16:00:00.000Z', updatedBy: 'admin@ifn.community' };
}

describe('link allowlist seed (openspec/changes/admin-ux-blog-links-review)', () => {
    it('is the same rows the Links tab has always shown', () => {
        const seed = loadLinkSeed();
        expect(seed.find((r) => r.id === STATION)).toMatchObject({ kind: 'partner', status: 'verified', allowOutboundLink: true });
        expect(seed.find((r) => r.id === COOLEY)).toMatchObject({ kind: 'potential', status: 'draft', allowOutboundLink: false });
    });

    it('only sponsors and potentials with a website are actionable', () => {
        const seed = loadLinkSeed();
        expect(isActionable(seed.find((r) => r.id === COOLEY)!)).toBe(true);
        expect(isActionable(seed.find((r) => r.id === STATION)!)).toBe(false);
        expect(isActionable({ kind: 'potential', website: undefined })).toBe(false);
    });
});

describe('mergeLinkOverlay', () => {
    const seed = loadLinkSeed();

    it('falls back to the seed without an overlay row', () => {
        const row = mergeLinkOverlay(seed, []).find((r) => r.id === COOLEY)!;
        expect(row).toMatchObject({ status: 'draft', allowOutboundLink: false, source: 'seed', actionable: true });
    });

    it('overlay wins for status and allowOutboundLink', () => {
        const row = mergeLinkOverlay(seed, [overlayRow(COOLEY, 'verified', true)]).find((r) => r.id === COOLEY)!;
        expect(row).toMatchObject({
            status: 'verified',
            allowOutboundLink: true,
            source: 'overlay',
            updatedBy: 'admin@ifn.community',
        });
        // Name, website and notes still come from the seed.
        expect(row.website).toContain('cooley.com');
    });

    it('never allows outbound unless the overlay row is also verified', () => {
        const row = mergeLinkOverlay(seed, [overlayRow(COOLEY, 'draft', true)]).find((r) => r.id === COOLEY)!;
        expect(row.allowOutboundLink).toBe(false);
    });

    it('ignores overlay rows for partners', () => {
        const merged = mergeLinkOverlay(seed, [overlayRow(STATION, 'blocked', false), overlayRow(YANI, 'verified', true)]);
        expect(merged.find((r) => r.id === STATION)).toMatchObject({ status: 'verified', allowOutboundLink: true, source: 'seed' });
        expect(merged.find((r) => r.id === YANI)).toMatchObject({ allowOutboundLink: false, source: 'seed' });
    });
});

describe('applyLinkAction', () => {
    const potential = { kind: 'potential' as const, website: 'https://mercury.com/blog/open-us-bank-account' };

    it('approve makes a row verified with outbound allowed', () => {
        expect(applyLinkAction({ ...potential, status: 'draft' }, 'approve')).toEqual({
            ok: true,
            status: 'verified',
            allowOutbound: true,
        });
    });

    it('hold turns outbound off and returns the row to draft', () => {
        expect(applyLinkAction({ ...potential, status: 'verified' }, 'hold')).toEqual({
            ok: true,
            status: 'draft',
            allowOutbound: false,
        });
    });

    it('hold keeps a blocked row blocked', () => {
        expect(applyLinkAction({ ...potential, status: 'blocked' }, 'hold')).toEqual({
            ok: true,
            status: 'blocked',
            allowOutbound: false,
        });
    });

    it('refuses partners and rows without a website', () => {
        expect(applyLinkAction({ kind: 'partner', website: 'https://stationaustin.org', status: 'verified' }, 'hold').ok).toBe(
            false
        );
        expect(applyLinkAction({ kind: 'sponsor', website: undefined, status: 'draft' }, 'approve').ok).toBe(false);
    });
});

describe('admin-links.ts request handling', () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));

    beforeEach(() => {
        process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
        process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community';
        delete process.env.NETLIFY_DATABASE_URL;
        delete process.env.NETLIFY_BUILD_HOOK_URL;
        db.rows.clear();
        fetchMock.mockClear();
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    async function authedEvent(method: string, body?: unknown): Promise<HandlerEvent> {
        const cookie = (await createSessionCookie('admin@ifn.community')).split(';')[0];
        return {
            httpMethod: method,
            headers: { cookie },
            body: body === undefined ? null : JSON.stringify(body),
        } as unknown as HandlerEvent;
    }

    async function call(event: HandlerEvent) {
        const res = await handler(event, {} as never);
        return { statusCode: res!.statusCode, body: res!.body ? JSON.parse(res!.body) : null };
    }

    it('rejects unauthenticated requests with 401, for reads and writes', async () => {
        for (const method of ['GET', 'PATCH']) {
            const res = await handler(
                { httpMethod: method, headers: {}, body: JSON.stringify({ id: COOLEY, action: 'approve' }) } as unknown as HandlerEvent,
                {} as never
            );
            expect(res?.statusCode).toBe(401);
        }
    });

    it('rejects a session whose email is no longer allowlisted', async () => {
        const event = await authedEvent('GET');
        process.env.ADMIN_ALLOWED_EMAILS = 'someone-else@ifn.community';
        expect((await call(event)).statusCode).toBe(401);
    });

    it('rejects other methods with 405', async () => {
        const res = await handler(await authedEvent('DELETE'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('GET without a database lists the seed, read-only', async () => {
        const { statusCode, body } = await call(await authedEvent('GET'));
        expect(statusCode).toBe(200);
        expect(body.overlayAvailable).toBe(false);
        expect(body.rows.find((r: { id: string }) => r.id === COOLEY)).toMatchObject({ actionable: true, source: 'seed' });
        expect(body.rows.find((r: { id: string }) => r.id === STATION)).toMatchObject({ actionable: false });
    });

    it('PATCH refuses bad input before touching the database', async () => {
        expect((await call(await authedEvent('PATCH', { id: COOLEY, action: 'publish' }))).statusCode).toBe(400);
        expect((await call(await authedEvent('PATCH', { id: 'potential-nope', action: 'approve' }))).statusCode).toBe(400);
        expect((await call(await authedEvent('PATCH', { id: STATION, action: 'hold' }))).statusCode).toBe(400);
        const invalid = await handler({ ...(await authedEvent('PATCH')), body: '{nope' } as HandlerEvent, {} as never);
        expect(invalid?.statusCode).toBe(400);
    });

    it('PATCH without a database answers 503', async () => {
        const { statusCode } = await call(await authedEvent('PATCH', { id: COOLEY, action: 'approve' }));
        expect(statusCode).toBe(503);
    });

    describe('with a database', () => {
        beforeEach(() => {
            process.env.NETLIFY_DATABASE_URL = 'postgres://test';
            process.env.NETLIFY_BUILD_HOOK_URL = HOOK;
        });

        it('approve persists verified + outbound and requests a rebuild', async () => {
            const { statusCode, body } = await call(await authedEvent('PATCH', { id: COOLEY, action: 'approve' }));
            expect(statusCode).toBe(200);
            expect(body.row).toMatchObject({
                id: COOLEY,
                status: 'verified',
                allowOutboundLink: true,
                source: 'overlay',
                updatedBy: 'admin@ifn.community',
            });
            expect(body.build).toBe('triggered');
            expect(fetchMock).toHaveBeenCalledWith(HOOK, { method: 'POST' });
            expect(db.rows.get(COOLEY)).toMatchObject({ status: 'verified', allow_outbound: true });
        });

        it('hold after approve turns outbound off and rebuilds again', async () => {
            await call(await authedEvent('PATCH', { id: MERCURY, action: 'approve' }));
            const { statusCode, body } = await call(await authedEvent('PATCH', { id: MERCURY, action: 'hold' }));
            expect(statusCode).toBe(200);
            expect(body.row).toMatchObject({ status: 'draft', allowOutboundLink: false });
            expect(body.build).toBe('triggered');
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        it('reports a missing build hook instead of failing the write', async () => {
            delete process.env.NETLIFY_BUILD_HOOK_URL;
            const { statusCode, body } = await call(await authedEvent('PATCH', { id: COOLEY, action: 'approve' }));
            expect(statusCode).toBe(200);
            expect(body.build).toBe('not-configured');
            expect(db.rows.get(COOLEY)).toMatchObject({ status: 'verified' });
        });

        it('GET merges the overlay over the seed', async () => {
            await call(await authedEvent('PATCH', { id: COOLEY, action: 'approve' }));
            const { body } = await call(await authedEvent('GET'));
            expect(body.overlayAvailable).toBe(true);
            expect(body.rows.find((r: { id: string }) => r.id === COOLEY)).toMatchObject({
                status: 'verified',
                allowOutboundLink: true,
                source: 'overlay',
            });
            expect(body.rows.find((r: { id: string }) => r.id === MERCURY)).toMatchObject({ source: 'seed' });
        });
    });
});
