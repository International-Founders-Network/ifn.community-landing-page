/**
 * Fetch wrappers for the Admin blog endpoints. Every call is same-origin with
 * the session cookie; a 401 throws UnauthorizedError so the caller can drop
 * back to the sign-in screen.
 */
import type { BlogAction, EditorialPost, PostBody } from './blogQueue';
import type { BuildStatusResponse } from './buildPhase';

export class UnauthorizedError extends Error {
    constructor() {
        super('Not signed in');
    }
}

export class NotFoundError extends Error {}

async function readJson(res: Response, fallback: string): Promise<Record<string, unknown>> {
    if (res.status === 401) throw new UnauthorizedError();
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 404) throw new NotFoundError(typeof data.error === 'string' ? data.error : fallback);
    if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : fallback);
    return data;
}

export async function fetchQueue(): Promise<{ posts: EditorialPost[]; overlayAvailable: boolean }> {
    const res = await fetch('/api/admin-blog', { credentials: 'same-origin' });
    const data = await readJson(res, 'Failed to load the blog queue');
    return { posts: data.posts as EditorialPost[], overlayAvailable: Boolean(data.overlayAvailable) };
}

export async function fetchPost(
    slug: string
): Promise<{ post: EditorialPost; body: PostBody; overlayAvailable: boolean }> {
    const res = await fetch(`/api/admin-blog?slug=${encodeURIComponent(slug)}`, { credentials: 'same-origin' });
    const data = await readJson(res, 'Failed to load the post');
    return {
        post: data.post as EditorialPost,
        body: data.body as PostBody,
        overlayAvailable: Boolean(data.overlayAvailable),
    };
}

export async function patchAction(
    slug: string,
    action: BlogAction,
    publishAt?: string
): Promise<{ post: EditorialPost; build: unknown }> {
    const res = await fetch('/api/admin-blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ slug, action, publishAt }),
    });
    const data = await readJson(res, 'Update failed');
    return { post: data.post as EditorialPost, build: data.build };
}

export async function fetchBuildStatus(): Promise<BuildStatusResponse> {
    const res = await fetch('/api/admin-build-status', { credentials: 'same-origin', cache: 'no-store' });
    return (await readJson(res, 'Could not read the build status')) as unknown as BuildStatusResponse;
}
