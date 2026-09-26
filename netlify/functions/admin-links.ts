import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { getSessionEmail } from './_lib/auth';
import { triggerBuildHook } from './_lib/buildHook';
import {
    LINK_ACTIONS,
    applyLinkAction,
    ensureLinkTable,
    loadLinkOverlay,
    loadLinkSeed,
    mergeLinkOverlay,
    upsertLinkOverlay,
    type LinkAction,
} from './_lib/linkAllowlist';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(statusCode: number, body: unknown) {
    return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

/**
 * Admin → Links. GET lists every partner / sponsor / potential row (seed merged
 * with the Neon overlay); PATCH `{ id, action: 'approve' | 'hold' }` flips one
 * sponsor or potential. Allowlisted session required for both, as in
 * admin-blog.
 *
 * Every PATCH requests a rebuild. Outbound anchors are kept or stripped when
 * compile-blog renders post HTML, so an approval reaches an already-published
 * post only when the next build finishes, and a hold removes the link the same
 * way.
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'PATCH') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const email = await getSessionEmail(event);
    if (!email) return json(401, { error: 'Not authenticated' });

    const seed = loadLinkSeed();
    const dbUrl = process.env.NETLIFY_DATABASE_URL;

    if (event.httpMethod === 'GET') {
        if (!dbUrl) {
            // Read-only view still works from the seed; writes will 503.
            return json(200, { rows: mergeLinkOverlay(seed, []), overlayAvailable: false });
        }
        try {
            const sql = neon(dbUrl);
            await ensureLinkTable(sql);
            return json(200, { rows: mergeLinkOverlay(seed, await loadLinkOverlay(sql)), overlayAvailable: true });
        } catch (error) {
            console.error('Admin links load error:', error);
            return json(500, { error: 'Failed to load links' });
        }
    }

    let body: { id?: unknown; action?: unknown };
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { error: 'Invalid JSON body' });
    }

    const id = typeof body.id === 'string' ? body.id : '';
    const action = body.action as LinkAction;
    if (!LINK_ACTIONS.includes(action)) return json(400, { error: 'Unknown action' });
    const seedRow = seed.find((row) => row.id === id);
    if (!seedRow) return json(400, { error: 'Unknown link' });
    // Partners and rows without a website are refused before the database is
    // touched, so the answer does not depend on configuration.
    const allowed = applyLinkAction(seedRow, action);
    if (!allowed.ok) return json(400, { error: allowed.error });

    if (!dbUrl) {
        return json(503, { error: 'Link store unavailable: NETLIFY_DATABASE_URL is not configured.' });
    }

    try {
        const sql = neon(dbUrl);
        await ensureLinkTable(sql);
        const current = mergeLinkOverlay(seed, await loadLinkOverlay(sql)).find((row) => row.id === id)!;
        const next = applyLinkAction(current, action);
        if (!next.ok) return json(400, { error: next.error });

        await upsertLinkOverlay(sql, id, next.status, next.allowOutbound, email);
        const build = await triggerBuildHook(`admin-links ${action} ${id}`);

        const row = mergeLinkOverlay(seed, await loadLinkOverlay(sql)).find((r) => r.id === id);
        return json(200, { row, build });
    } catch (error) {
        console.error('Admin links update error:', error);
        return json(500, { error: 'Failed to update link' });
    }
};
