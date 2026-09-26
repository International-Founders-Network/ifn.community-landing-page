import { describe, it, expect, beforeEach } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { applyAction, isPubliclyVisible, isValidPublishAt, mergeOverlay, type QueueEntry } from '../functions/_lib/blogEditorial';
import { createSessionCookie } from '../functions/_lib/auth';
import { handler } from '../functions/admin-blog';

const AT = '2026-10-01T09:00:00-05:00';

describe('applyAction (openspec/changes/blog-editorial-publish)', () => {
    it('approves only from in_review', () => {
        expect(applyAction({ status: 'in_review', publishAt: null }, 'approve')).toEqual({
            ok: true,
            status: 'approved',
            publishAt: null,
        });
        expect(applyAction({ status: 'draft', publishAt: null }, 'approve').ok).toBe(false);
    });

    it('schedules only an approved (or already scheduled) post, and requires an offset publishAt', () => {
        expect(applyAction({ status: 'approved', publishAt: null }, 'schedule', AT)).toEqual({
            ok: true,
            status: 'scheduled',
            publishAt: AT,
        });
        expect(applyAction({ status: 'approved', publishAt: null }, 'schedule').ok).toBe(false);
        expect(applyAction({ status: 'approved', publishAt: null }, 'schedule', '2026-10-01T09:00').ok).toBe(false);
        expect(applyAction({ status: 'in_review', publishAt: null }, 'schedule', AT).ok).toBe(false);
    });

    it('never lets draft or in_review go live', () => {
        expect(applyAction({ status: 'draft', publishAt: null }, 'mark_live').ok).toBe(false);
        expect(applyAction({ status: 'in_review', publishAt: null }, 'mark_live').ok).toBe(false);
        expect(applyAction({ status: 'approved', publishAt: null }, 'mark_live')).toMatchObject({ ok: true, status: 'live' });
    });

    it('hold returns approved/scheduled to in_review and clears publishAt', () => {
        expect(applyAction({ status: 'scheduled', publishAt: AT }, 'hold')).toEqual({
            ok: true,
            status: 'in_review',
            publishAt: null,
        });
        expect(applyAction({ status: 'live', publishAt: null }, 'hold').ok).toBe(false);
    });
});

describe('isPubliclyVisible', () => {
    const due = Date.parse(AT);
    it('is true for live and for scheduled once due', () => {
        expect(isPubliclyVisible('live', null, due)).toBe(true);
        expect(isPubliclyVisible('scheduled', AT, due)).toBe(true);
        expect(isPubliclyVisible('scheduled', AT, due - 1)).toBe(false);
    });

    it('is false for every pre-approval status, even with a past publishAt', () => {
        for (const status of ['draft', 'in_review', 'approved'] as const) {
            expect(isPubliclyVisible(status, AT, due + 1e9)).toBe(false);
        }
        expect(isPubliclyVisible('scheduled', null, due)).toBe(false);
    });

    it('validates publishAt format', () => {
        expect(isValidPublishAt(AT)).toBe(true);
        expect(isValidPublishAt('2026-10-01T14:00:00Z')).toBe(true);
        expect(isValidPublishAt('2026-10-01')).toBe(false);
        expect(isValidPublishAt(null)).toBe(false);
    });
});

describe('mergeOverlay', () => {
    const entry: QueueEntry = {
        slug: 'a',
        title: 'A',
        date: '2026-10-01',
        status: 'in_review',
        publishAt: null,
        tags: [],
        draft: true,
        publicInBuild: false,
    };

    it('overlay wins for status and publishAt only', () => {
        const [post] = mergeOverlay(
            [entry],
            [{ slug: 'a', status: 'scheduled', publishAt: AT, updatedAt: null, updatedBy: 'x@y' }]
        );
        expect(post).toMatchObject({ title: 'A', status: 'scheduled', publishAt: AT, source: 'overlay' });
    });

    it('falls back to frontmatter without an overlay row', () => {
        expect(mergeOverlay([entry], [])[0]).toMatchObject({ status: 'in_review', source: 'frontmatter' });
    });
});

describe('admin-blog.ts request handling', () => {
    beforeEach(() => {
        process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
        process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community';
        delete process.env.NETLIFY_DATABASE_URL;
    });

    async function authedEvent(method: string, body?: unknown): Promise<HandlerEvent> {
        const cookie = (await createSessionCookie('admin@ifn.community')).split(';')[0];
        return {
            httpMethod: method,
            headers: { cookie },
            body: body === undefined ? null : JSON.stringify(body),
        } as unknown as HandlerEvent;
    }

    it('rejects unauthenticated requests with 401', async () => {
        const res = await handler({ httpMethod: 'GET', headers: {} } as unknown as HandlerEvent, {} as never);
        expect(res?.statusCode).toBe(401);
    });

    it('rejects other methods with 405', async () => {
        const res = await handler(await authedEvent('DELETE'), {} as never);
        expect(res?.statusCode).toBe(405);
    });

    it('GET without a database still lists the queue, without HTML', async () => {
        const res = await handler(await authedEvent('GET'), {} as never);
        expect(res?.statusCode).toBe(200);
        const body = JSON.parse(res!.body!);
        expect(body.overlayAvailable).toBe(false);
        expect(body.posts.some((p: { slug: string }) => p.slug === 'welcome-to-the-ifn-blog')).toBe(true);
        expect(res!.body).not.toContain('"html"');
    });

    it('PATCH without a database answers 503', async () => {
        const res = await handler(
            await authedEvent('PATCH', { slug: 'welcome-to-the-ifn-blog', action: 'hold' }),
            {} as never
        );
        expect(res?.statusCode).toBe(503);
    });
});
