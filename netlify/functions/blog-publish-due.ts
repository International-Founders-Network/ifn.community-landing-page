import { schedule } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import {
    ensureTable,
    isPubliclyVisible,
    loadOverlay,
    loadQueue,
    mergeOverlay,
    triggerBuildHook,
    upsertOverlay,
} from './_lib/blogEditorial';

/**
 * Every 15 minutes: promote `scheduled` posts whose publishAt has passed to
 * `live` in the Neon overlay, then request a rebuild so compile-blog includes
 * them. Only `scheduled` is ever promoted; draft / in_review / approved are
 * never touched, so nothing publishes without an admin approval first.
 *
 * Netlify runs scheduled functions on the production deploy only, not on
 * Deploy Previews.
 */
export const handler = schedule('*/15 * * * *', async () => {
    const dbUrl = process.env.NETLIFY_DATABASE_URL;
    if (!dbUrl) {
        console.warn('blog-publish-due: NETLIFY_DATABASE_URL is not set; nothing to do.');
        return { statusCode: 200 };
    }

    const sql = neon(dbUrl);
    await ensureTable(sql);
    const now = Date.now();
    const due = mergeOverlay(loadQueue(), await loadOverlay(sql)).filter(
        (post) => post.status === 'scheduled' && isPubliclyVisible(post.status, post.publishAt, now)
    );

    for (const post of due) {
        await upsertOverlay(sql, post.slug, 'live', post.publishAt, 'blog-publish-due');
        console.log(`blog-publish-due: promoted ${post.slug} (publishAt ${post.publishAt}) to live.`);
    }

    if (due.length > 0) {
        await triggerBuildHook(`blog-publish-due promoted ${due.length} post(s)`);
    }
    return { statusCode: 200 };
});
