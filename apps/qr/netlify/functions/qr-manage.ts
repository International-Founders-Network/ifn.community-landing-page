import type { Handler, HandlerEvent } from '@netlify/functions';
import { ensureQrTables, getSql } from './_lib/db';
import { requireAdmin } from './_lib/auth';
import { json } from './_lib/http';
import { checkRedirectTarget } from '../../src/lib/redirectAllowlist';

interface QrLinkRow {
    code: string;
    target_url: string;
    label: string | null;
    created_at: string;
    updated_at: string;
}

async function loadDetails(sql: ReturnType<typeof getSql>, token: string) {
    const rows = await sql`
        SELECT code, target_url, label, created_at, updated_at
        FROM qr_links WHERE edit_token = ${token}
    `;
    if (rows.length === 0) return null;
    const link = rows[0] as unknown as QrLinkRow;

    const countRows = await sql`
        SELECT COUNT(*)::int AS count FROM qr_scans
        WHERE qr_link_id = (SELECT id FROM qr_links WHERE edit_token = ${token})
    `;
    const scanCount = (countRows[0] as { count: number }).count;

    const recentRows = await sql`
        SELECT scanned_at, user_agent, referrer FROM qr_scans
        WHERE qr_link_id = (SELECT id FROM qr_links WHERE edit_token = ${token})
        ORDER BY scanned_at DESC LIMIT 20
    `;

    return {
        code: link.code,
        targetUrl: link.target_url,
        label: link.label,
        createdAt: link.created_at,
        updatedAt: link.updated_at,
        scanCount,
        recentScans: recentRows.map((r) => {
            const row = r as { scanned_at: string; user_agent: string | null; referrer: string | null };
            return { scannedAt: row.scanned_at, userAgent: row.user_agent, referrer: row.referrer };
        }),
    };
}

// View (GET) and edit (PUT) one short link. The edit token in ?token= still
// identifies the link, but it is no longer enough on its own: every method
// requires an admin session, including GET, because the response carries scan
// history (user agents, referrers). There is no delete path.
export const handler: Handler = async (event: HandlerEvent) => {
    const method = event.httpMethod;
    if (method !== 'GET' && method !== 'PUT') return json(405, { error: 'Method Not Allowed' });

    const admin = await requireAdmin(event, { write: method !== 'GET' });
    if (!admin.ok) return admin.response;

    const token = event.queryStringParameters?.token;
    if (!token) return json(400, { error: 'Missing token' });

    try {
        const sql = getSql();
        await ensureQrTables(sql);

        if (method === 'GET') {
            const details = await loadDetails(sql, token);
            if (!details) return json(404, { error: 'Link not found' });
            return json(200, details);
        }

        let data: { targetUrl?: unknown };
        try {
            data = JSON.parse(event.body || '{}');
        } catch {
            return json(400, { error: 'Invalid JSON body' });
        }
        const target = checkRedirectTarget(data.targetUrl);
        if (!target.ok) return json(400, { error: target.error });

        const updated = await sql`
            UPDATE qr_links SET target_url = ${target.url}, updated_at = CURRENT_TIMESTAMP
            WHERE edit_token = ${token}
            RETURNING id
        `;
        if (updated.length === 0) return json(404, { error: 'Link not found' });

        console.log(`qr-manage: ${admin.email} updated link ${(updated[0] as { id: number }).id}`);
        const details = await loadDetails(sql, token);
        return json(200, details);
    } catch (error) {
        console.error('qr-manage error:', error);
        return json(500, { error: 'Internal server error. Please try again later.' });
    }
};
