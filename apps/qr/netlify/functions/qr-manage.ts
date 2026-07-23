import { Handler, HandlerEvent } from '@netlify/functions';
import type { neon } from '@neondatabase/serverless';
import { ensureQrTables, getSql, isValidHttpUrl } from './_db';

interface QrLinkRow {
    code: string;
    target_url: string;
    label: string | null;
    created_at: string;
    updated_at: string;
}

async function loadDetails(sql: ReturnType<typeof neon>, token: string) {
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

export const handler: Handler = async (event: HandlerEvent) => {
    const sql = getSql();
    const token = event.queryStringParameters?.token;

    if (!token) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing token' }) };
    }

    try {
        await ensureQrTables(sql);

        if (event.httpMethod === 'GET') {
            const details = await loadDetails(sql, token);
            if (!details) return { statusCode: 404, body: JSON.stringify({ error: 'Link not found' }) };
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) };
        }

        if (event.httpMethod === 'PUT') {
            const data = JSON.parse(event.body || '{}');
            const { targetUrl } = data as { targetUrl?: string };
            if (!targetUrl || !isValidHttpUrl(targetUrl)) {
                return { statusCode: 400, body: JSON.stringify({ error: 'A valid targetUrl (http/https) is required' }) };
            }

            const updated = await sql`
                UPDATE qr_links SET target_url = ${targetUrl}, updated_at = CURRENT_TIMESTAMP
                WHERE edit_token = ${token}
                RETURNING id
            `;
            if (updated.length === 0) return { statusCode: 404, body: JSON.stringify({ error: 'Link not found' }) };

            const details = await loadDetails(sql, token);
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (error) {
        console.error('qr-manage error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error. Please try again later.' }) };
    }
};
