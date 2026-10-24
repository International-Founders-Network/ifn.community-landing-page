import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose';
import { createFakeDb, createFakeSql, type FakeDb } from './fakeSql';

// The DB is in memory; nothing here reaches Neon.
const state = vi.hoisted(() => ({ db: null as unknown as FakeDb }));
vi.mock('../functions/_lib/db', () => ({
    getSql: () => createFakeSql(state.db),
    ensureQrTables: async () => {},
    getBaseUrl: () => 'https://qr.ifn.community',
}));

import { handler as qrCreate } from '../functions/qr-create';
import { handler as qrManage } from '../functions/qr-manage';
import { handler as authGoogle } from '../functions/auth-google';
import { handler as authMe } from '../functions/auth-me';
import { handler as authLogout } from '../functions/auth-logout';
import { createSessionCookie, SESSION_COOKIE_NAME } from '../functions/_lib/auth';

const CLIENT_ID = 'test-client.apps.googleusercontent.com';
const HOST = 'qr.ifn.community';

function event(over: Partial<HandlerEvent> & { headers?: Record<string, string> }): HandlerEvent {
    return {
        httpMethod: 'GET',
        path: '/api/x',
        headers: { host: HOST },
        queryStringParameters: {},
        body: null,
        ...over,
    } as unknown as HandlerEvent;
}

function jsonWrite(method: string, body: unknown, headers: Record<string, string> = {}, query: Record<string, string> = {}) {
    return event({
        httpMethod: method,
        headers: { host: HOST, 'content-type': 'application/json', origin: `https://${HOST}`, ...headers },
        body: JSON.stringify(body),
        queryStringParameters: query,
    });
}

async function call(h: typeof qrCreate, e: HandlerEvent): Promise<HandlerResponse> {
    return (await h(e, {} as never)) as HandlerResponse;
}

async function sessionCookie(email: string): Promise<string> {
    return (await createSessionCookie(email)).split(';')[0];
}

function seedLink(target = 'https://ifn.community/events') {
    state.db.links.push({
        id: 1,
        code: 'abc2345',
        edit_token: 'tok-1',
        target_url: target,
        label: null,
        created_at: '2026-10-23T00:00:00Z',
        updated_at: '2026-10-23T00:00:00Z',
    });
}

beforeEach(() => {
    state.db = createFakeDb();
    process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
    process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community, Other@Example.com';
    process.env.VITE_GOOGLE_CLIENT_ID = CLIENT_ID;
});

describe('qr-create requires an admin session', () => {
    it('rejects an unauthenticated create with 401 and writes nothing', async () => {
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/events' }));
        expect(res.statusCode).toBe(401);
        expect(state.db.links).toHaveLength(0);
        expect(state.db.queries).toHaveLength(0);
    });

    it('rejects a session for an email that is not on the allowlist with 403', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        process.env.ADMIN_ALLOWED_EMAILS = 'someone-else@ifn.community';
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/events' }, { cookie }));
        expect(res.statusCode).toBe(403);
        expect(state.db.links).toHaveLength(0);
    });

    it('rejects a tampered session cookie', async () => {
        const cookie = (await sessionCookie('admin@ifn.community')).replace(`${SESSION_COOKIE_NAME}=`, `${SESSION_COOKIE_NAME}=x`);
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/events' }, { cookie }));
        expect(res.statusCode).toBe(401);
    });

    it('rejects a session token signed for a different audience (e.g. the main site)', async () => {
        const foreign = await new SignJWT({ email: 'admin@ifn.community' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET));
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/events' }, { cookie: `${SESSION_COOKIE_NAME}=${foreign}` }));
        expect(res.statusCode).toBe(401);
    });

    it('accepts a valid session and creates an allowlisted link', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://lu.ma/IFN_ATX', label: 'Oct meetup' }, { cookie }));
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body!);
        expect(body.shortUrl).toMatch(/^https:\/\/qr\.ifn\.community\/r\/[2-9a-zA-Z]{7}$/);
        expect(state.db.links).toHaveLength(1);
        expect(state.db.links[0].target_url).toBe('https://lu.ma/IFN_ATX');
    });

    it('refuses a non-allowlisted destination even for an admin', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        for (const targetUrl of ['https://evil.com/', 'http://ifn.community/', 'https://ifn.community@evil.com/']) {
            const res = await call(qrCreate, jsonWrite('POST', { targetUrl }, { cookie }));
            expect(res.statusCode).toBe(400);
        }
        expect(state.db.links).toHaveLength(0);
    });

    it('refuses a non-JSON body (cross-site form post) with 415', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        const res = await call(
            qrCreate,
            event({
                httpMethod: 'POST',
                headers: { host: HOST, cookie, 'content-type': 'application/x-www-form-urlencoded' },
                body: 'targetUrl=https://ifn.community',
            })
        );
        expect(res.statusCode).toBe(415);
    });

    it('refuses a cross-origin write with 403', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/' }, { cookie, origin: 'https://evil.com' }));
        expect(res.statusCode).toBe(403);
        expect(state.db.links).toHaveLength(0);
    });

    it('rejects GET with 405', async () => {
        expect((await call(qrCreate, event({ httpMethod: 'GET' }))).statusCode).toBe(405);
    });
});

describe('qr-manage (view, edit) requires an admin session', () => {
    beforeEach(() => seedLink());

    it('rejects an unauthenticated edit with 401 and leaves the target unchanged', async () => {
        const res = await call(qrManage, jsonWrite('PUT', { targetUrl: 'https://lu.ma/x' }, {}, { token: 'tok-1' }));
        expect(res.statusCode).toBe(401);
        expect(state.db.links[0].target_url).toBe('https://ifn.community/events');
    });

    it('rejects an unauthenticated view: the edit token alone is no longer enough', async () => {
        const res = await call(qrManage, event({ httpMethod: 'GET', queryStringParameters: { token: 'tok-1' } }));
        expect(res.statusCode).toBe(401);
    });

    it('rejects DELETE (there is no delete path) without touching the row', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        const res = await call(qrManage, jsonWrite('DELETE', {}, { cookie }, { token: 'tok-1' }));
        expect(res.statusCode).toBe(405);
        expect(state.db.links).toHaveLength(1);
    });

    it('rejects an unauthenticated DELETE', async () => {
        const res = await call(qrManage, jsonWrite('DELETE', {}, {}, { token: 'tok-1' }));
        expect([401, 403, 405]).toContain(res.statusCode);
        expect(state.db.links).toHaveLength(1);
    });

    it('rejects a non-allowlisted email with 403', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        process.env.ADMIN_ALLOWED_EMAILS = 'other@example.com';
        const res = await call(qrManage, jsonWrite('PUT', { targetUrl: 'https://lu.ma/x' }, { cookie }, { token: 'tok-1' }));
        expect(res.statusCode).toBe(403);
        expect(state.db.links[0].target_url).toBe('https://ifn.community/events');
    });

    it('lets an admin view and edit to an allowlisted target', async () => {
        const cookie = await sessionCookie('other@example.com');
        const view = await call(qrManage, event({ httpMethod: 'GET', headers: { host: HOST, cookie }, queryStringParameters: { token: 'tok-1' } }));
        expect(view.statusCode).toBe(200);
        expect(JSON.parse(view.body!).targetUrl).toBe('https://ifn.community/events');

        const res = await call(qrManage, jsonWrite('PUT', { targetUrl: 'https://www.meetup.com/ifn/' }, { cookie }, { token: 'tok-1' }));
        expect(res.statusCode).toBe(200);
        expect(state.db.links[0].target_url).toBe('https://www.meetup.com/ifn/');
    });

    it('refuses an admin edit to a non-allowlisted target', async () => {
        const cookie = await sessionCookie('admin@ifn.community');
        const res = await call(qrManage, jsonWrite('PUT', { targetUrl: 'https://ifn.community.evil.com/' }, { cookie }, { token: 'tok-1' }));
        expect(res.statusCode).toBe(400);
        expect(state.db.links[0].target_url).toBe('https://ifn.community/events');
    });
});

describe('fails closed when auth is not configured', () => {
    it.each(['ADMIN_SESSION_SECRET', 'ADMIN_ALLOWED_EMAILS', 'VITE_GOOGLE_CLIENT_ID'])(
        'refuses create, edit, view, sign-in and auth-me with 503 when %s is missing',
        async (name) => {
            const cookie = await sessionCookie('admin@ifn.community');
            seedLink();
            delete process.env[name];
            const responses = [
                await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/' }, { cookie })),
                await call(qrManage, jsonWrite('PUT', { targetUrl: 'https://ifn.community/x' }, { cookie }, { token: 'tok-1' })),
                await call(qrManage, event({ httpMethod: 'GET', headers: { host: HOST, cookie }, queryStringParameters: { token: 'tok-1' } })),
                await call(authGoogle, jsonWrite('POST', { credential: 'x' })),
                await call(authMe, event({ headers: { host: HOST, cookie } })),
            ];
            expect(responses.map((r) => r.statusCode)).toEqual([503, 503, 503, 503, 503]);
            expect(state.db.links).toHaveLength(1);
            expect(state.db.links[0].target_url).toBe('https://ifn.community/events');
        }
    );

    it('treats an allowlist of only commas and spaces as missing', async () => {
        process.env.ADMIN_ALLOWED_EMAILS = ' , ,';
        const res = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/' }));
        expect(res.statusCode).toBe(503);
    });
});

describe('Google sign-in (JWKS mocked, no network)', () => {
    let privateKey: CryptoKey;
    let jwk: JWK;

    beforeAll(async () => {
        const pair = await generateKeyPair('RS256');
        privateKey = pair.privateKey as CryptoKey;
        jwk = { ...(await exportJWK(pair.publicKey)), kid: 'test-kid', alg: 'RS256', use: 'sig' };
    });

    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: unknown) => {
                const url = String(input instanceof Request ? input.url : input);
                if (!url.startsWith('https://www.googleapis.com/oauth2/v3/certs')) throw new Error(`unexpected fetch ${url}`);
                return new Response(JSON.stringify({ keys: [jwk] }), { status: 200, headers: { 'content-type': 'application/json' } });
            })
        );
    });
    afterEach(() => vi.unstubAllGlobals());

    async function idToken(claims: Record<string, unknown>, audience = CLIENT_ID) {
        return new SignJWT(claims)
            .setProtectedHeader({ alg: 'RS256', kid: 'test-kid' })
            .setIssuer('https://accounts.google.com')
            .setAudience(audience)
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(privateKey);
    }

    it('issues a SameSite=Strict httpOnly session for an allowlisted, verified email', async () => {
        const credential = await idToken({ email: 'admin@ifn.community', email_verified: true });
        const res = await call(authGoogle, jsonWrite('POST', { credential }));
        expect(res.statusCode).toBe(200);
        const setCookie = String(res.headers!['Set-Cookie']);
        expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
        expect(setCookie).toMatch(/HttpOnly/i);
        expect(setCookie).toMatch(/SameSite=Strict/i);
        expect(setCookie).toMatch(/Secure/i);

        // The issued cookie then authorises a create.
        const cookie = setCookie.split(';')[0];
        const me = await call(authMe, event({ headers: { host: HOST, cookie } }));
        expect(JSON.parse(me.body!)).toEqual({ email: 'admin@ifn.community' });
        const created = await call(qrCreate, jsonWrite('POST', { targetUrl: 'https://ifn.community/events' }, { cookie }));
        expect(created.statusCode).toBe(200);
    });

    it('refuses a verified Google account that is not on the allowlist with 403 and no cookie', async () => {
        const credential = await idToken({ email: 'stranger@gmail.com', email_verified: true });
        const res = await call(authGoogle, jsonWrite('POST', { credential }));
        expect(res.statusCode).toBe(403);
        expect(res.headers?.['Set-Cookie']).toBeUndefined();
    });

    it('refuses an unverified email', async () => {
        const credential = await idToken({ email: 'admin@ifn.community', email_verified: false });
        expect((await call(authGoogle, jsonWrite('POST', { credential }))).statusCode).toBe(401);
    });

    it('refuses a token minted for a different OAuth client', async () => {
        const credential = await idToken({ email: 'admin@ifn.community', email_verified: true }, 'someone-else.apps.googleusercontent.com');
        expect((await call(authGoogle, jsonWrite('POST', { credential }))).statusCode).toBe(401);
    });

    it('refuses a cross-origin sign-in post', async () => {
        const credential = await idToken({ email: 'admin@ifn.community', email_verified: true });
        expect((await call(authGoogle, jsonWrite('POST', { credential }, { origin: 'https://evil.com' }))).statusCode).toBe(403);
    });
});

describe('auth-me and auth-logout', () => {
    it('auth-me is 401 without a session', async () => {
        expect((await call(authMe, event({}))).statusCode).toBe(401);
    });

    it('auth-logout clears the cookie and only accepts a same-origin JSON POST', async () => {
        const res = await call(authLogout, jsonWrite('POST', {}));
        expect(res.statusCode).toBe(200);
        expect(String(res.headers!['Set-Cookie'])).toMatch(/Max-Age=0/);
        expect((await call(authLogout, event({ httpMethod: 'GET' }))).statusCode).toBe(405);
    });
});
