import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { createSessionCookie } from '../functions/_lib/auth';
import { buildStatusConfig, fetchLatestProductionDeploy, summarizeDeploy } from '../functions/_lib/netlifyDeploys';
import { handler } from '../functions/admin-build-status';

const RAW = {
    id: 'dep123',
    state: 'building',
    created_at: '2026-10-22T14:00:00.000Z',
    published_at: null,
    context: 'production',
    site_id: 'site-1',
    admin_url: 'https://app.netlify.com/sites/x',
    commit_ref: 'abc',
    build_id: 'b1',
};

async function event(authed = true, method = 'GET'): Promise<HandlerEvent> {
    const headers: Record<string, string> = {};
    if (authed) headers.cookie = (await createSessionCookie('admin@ifn.community')).split(';')[0];
    return { httpMethod: method, headers } as unknown as HandlerEvent;
}

function okJson(body: unknown) {
    return { ok: true, status: 200, json: async () => body } as Response;
}

describe('summarizeDeploy', () => {
    it('keeps only state, timestamps, id and context', () => {
        expect(summarizeDeploy(RAW)).toEqual({
            state: 'building',
            createdAt: '2026-10-22T14:00:00.000Z',
            publishedAt: null,
            deployId: 'dep123',
            context: 'production',
        });
    });

    it('rejects payloads without an id or state', () => {
        expect(summarizeDeploy(null)).toBeNull();
        expect(summarizeDeploy({ id: 'x' })).toBeNull();
        expect(summarizeDeploy({ state: 'ready' })).toBeNull();
    });
});

describe('buildStatusConfig', () => {
    it('prefers NETLIFY_API_TOKEN, falls back to NETLIFY_AUTH_TOKEN, and needs a site id', () => {
        expect(buildStatusConfig({ NETLIFY_API_TOKEN: 'a', NETLIFY_AUTH_TOKEN: 'b', SITE_ID: 's' })).toEqual({ token: 'a', siteId: 's' });
        expect(buildStatusConfig({ NETLIFY_AUTH_TOKEN: 'b', NETLIFY_SITE_ID: 'n' })).toEqual({ token: 'b', siteId: 'n' });
        expect(buildStatusConfig({ NETLIFY_API_TOKEN: 'a' })).toBeNull();
        expect(buildStatusConfig({ SITE_ID: 's' })).toBeNull();
    });
});

describe('fetchLatestProductionDeploy', () => {
    it('asks for one production deploy with a bearer token', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(okJson([RAW]));
        const result = await fetchLatestProductionDeploy({ token: 'tok', siteId: 'site-1' }, fetchImpl);
        expect(fetchImpl).toHaveBeenCalledWith(
            'https://api.netlify.com/api/v1/sites/site-1/deploys?per_page=1&production=true',
            { headers: { Authorization: 'Bearer tok' } }
        );
        expect(result).toEqual({ available: true, deploy: summarizeDeploy(RAW) });
    });

    it('reports an API error without leaking it', async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) } as Response);
        const result = await fetchLatestProductionDeploy({ token: 'tok', siteId: 's' }, fetchImpl);
        expect(result).toMatchObject({ available: true, error: expect.any(String) });
        expect(JSON.stringify(result)).not.toContain('tok');
    });

    it('reports a network failure', async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error('down'));
        expect(await fetchLatestProductionDeploy({ token: 't', siteId: 's' }, fetchImpl)).toMatchObject({ available: true });
    });

    it('returns deploy null for an empty list', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(okJson([]));
        expect(await fetchLatestProductionDeploy({ token: 't', siteId: 's' }, fetchImpl)).toEqual({ available: true, deploy: null });
    });
});

describe('admin-build-status.ts', () => {
    const saved = { ...process.env };
    beforeEach(() => {
        process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
        process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community';
        delete process.env.NETLIFY_API_TOKEN;
        delete process.env.NETLIFY_AUTH_TOKEN;
        delete process.env.SITE_ID;
        delete process.env.NETLIFY_SITE_ID;
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        process.env = { ...saved };
    });

    it('rejects unauthenticated requests with 401 and never calls Netlify', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        process.env.NETLIFY_API_TOKEN = 'secret-token';
        process.env.SITE_ID = 's';
        const res = await handler(await event(false), {} as never);
        expect(res?.statusCode).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects other methods with 405', async () => {
        expect((await handler(await event(true, 'POST'), {} as never))?.statusCode).toBe(405);
    });

    it('answers available:false without a token', async () => {
        const res = await handler(await event(), {} as never);
        expect(res?.statusCode).toBe(200);
        expect(JSON.parse(res!.body!)).toEqual({ available: false });
    });

    it('returns the summary only, never the token or raw payload', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson([RAW])));
        process.env.NETLIFY_API_TOKEN = 'secret-token';
        process.env.SITE_ID = 'site-1';
        const res = await handler(await event(), {} as never);
        expect(res?.statusCode).toBe(200);
        expect(JSON.parse(res!.body!)).toEqual({ available: true, deploy: summarizeDeploy(RAW) });
        expect(res!.body).not.toContain('secret-token');
        expect(res!.body).not.toContain('admin_url');
        expect(res!.body).not.toContain('commit_ref');
    });
});
