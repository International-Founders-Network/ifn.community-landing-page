import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { getSessionEmail } from './_lib/auth';
import {
    BLOG_ACTIONS,
    applyAction,
    ensureTable,
    loadOverlay,
    loadQueue,
    mergeOverlay,
    triggerBuildHook,
    upsertOverlay,
    type BlogAction,
} from './_lib/blogEditorial';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(statusCode: number, body: unknown) {
    return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

/**
 * Admin → Blog. GET lists every post (queue metadata merged with the Neon
 * overlay); PATCH applies one editorial action. Allowlisted session required
 * for both, exactly like admin-submissions. There is no Content-callable path.
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'PATCH') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const email = await getSessionEmail(event);
    if (!email) return json(401, { error: 'Not authenticated' });

    const queue = loadQueue();
    const dbUrl = process.env.NETLIFY_DATABASE_URL;

    if (event.httpMethod === 'GET') {
        if (!dbUrl) {
            // Read-only view still works from frontmatter; writes will 503.
            return json(200, { posts: mergeOverlay(queue, []), overlayAvailable: false });
        }
        try {
            const sql = neon(dbUrl);
            await ensureTable(sql);
            const overlay = await loadOverlay(sql);
            return json(200, { posts: mergeOverlay(queue, overlay), overlayAvailable: true });
        } catch (error) {
            console.error('Admin blog load error:', error);
            return json(500, { error: 'Failed to load blog queue' });
        }
    }

    if (!dbUrl) {
        return json(503, { error: 'Editorial store unavailable: NETLIFY_DATABASE_URL is not configured.' });
    }

    let body: { slug?: unknown; action?: unknown; publishAt?: unknown };
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { error: 'Invalid JSON body' });
    }

    const slug = typeof body.slug === 'string' ? body.slug : '';
    const action = body.action as BlogAction;
    if (!BLOG_ACTIONS.includes(action)) return json(400, { error: 'Unknown action' });
    if (!queue.some((entry) => entry.slug === slug)) return json(400, { error: 'Unknown slug' });

    try {
        const sql = neon(dbUrl);
        await ensureTable(sql);
        const current = mergeOverlay(queue, await loadOverlay(sql)).find((post) => post.slug === slug)!;
        const next = applyAction(current, action, body.publishAt);
        if (!next.ok) return json(400, { error: next.error });

        await upsertOverlay(sql, slug, next.status, next.publishAt, email);

        // Approve changes nothing public, so it does not rebuild. Schedule
        // rebuilds too so Admin's "in build" flag stays honest; the post stays
        // hidden until publishAt either way.
        const build = action === 'approve' ? 'skipped' : await triggerBuildHook(`admin-blog ${action} ${slug}`);

        const overlay = await loadOverlay(sql);
        const post = mergeOverlay(queue, overlay).find((p) => p.slug === slug);
        return json(200, { post, build });
    } catch (error) {
        console.error('Admin blog update error:', error);
        return json(500, { error: 'Failed to update post' });
    }
};
