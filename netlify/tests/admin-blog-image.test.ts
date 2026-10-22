import { describe, it, expect, beforeEach } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { createSessionCookie } from '../functions/_lib/auth';
import { handler, resolvePublicFile } from '../functions/admin-blog-image';

const DRAFT = 'forming-a-us-company-from-abroad';

async function event(params: Record<string, string>, authed = true, method = 'GET'): Promise<HandlerEvent> {
    const headers: Record<string, string> = {};
    if (authed) headers.cookie = (await createSessionCookie('admin@ifn.community')).split(';')[0];
    return { httpMethod: method, headers, queryStringParameters: params } as unknown as HandlerEvent;
}

describe('admin-blog-image.ts', () => {
    beforeEach(() => {
        process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
        process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community';
    });

    it('rejects unauthenticated requests with 401 and no image bytes', async () => {
        const res = await handler(await event({ slug: DRAFT, variant: 'thumb' }, false), {} as never);
        expect(res?.statusCode).toBe(401);
        expect(res?.isBase64Encoded).toBeFalsy();
    });

    it('rejects other methods with 405', async () => {
        const res = await handler(await event({ slug: DRAFT, variant: 'thumb' }, true, 'POST'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('serves an unpublished post image to an allowlisted session, privately cached', async () => {
        const res = await handler(await event({ slug: DRAFT, variant: 'thumb' }), {} as never);
        expect(res?.statusCode).toBe(200);
        expect(res?.headers?.['Content-Type']).toBe('image/webp');
        expect(String(res?.headers?.['Cache-Control'])).toMatch(/^private/);
        expect(res?.isBase64Encoded).toBe(true);
        const bytes = Buffer.from(res!.body!, 'base64');
        expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
        expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
    });

    it('serves hero and hero800 too', async () => {
        for (const variant of ['hero', 'hero800']) {
            const res = await handler(await event({ slug: DRAFT, variant }), {} as never);
            expect(res?.statusCode).toBe(200);
        }
    });

    it('404s an unknown slug and 400s an unknown variant, so no path is caller-controlled', async () => {
        expect((await handler(await event({ slug: '../../etc/passwd', variant: 'thumb' }), {} as never))?.statusCode).toBe(404);
        expect((await handler(await event({ slug: DRAFT, variant: 'og' }), {} as never))?.statusCode).toBe(400);
        expect((await handler(await event({ slug: DRAFT, variant: '../x' }), {} as never))?.statusCode).toBe(400);
    });
});

describe('resolvePublicFile', () => {
    it('returns the first root that has the file', () => {
        const exists = (p: string) => p === '/task/public/blog/a-thumb.webp';
        expect(resolvePublicFile('/blog/a-thumb.webp', ['/cwd', '/task'], exists)).toBe('/task/public/blog/a-thumb.webp');
        expect(resolvePublicFile('/blog/b-thumb.webp', ['/cwd', '/task'], exists)).toBeNull();
    });
});
