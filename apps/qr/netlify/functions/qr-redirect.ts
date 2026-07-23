import { Handler, HandlerEvent } from '@netlify/functions';
import { ensureQrTables, getSql } from './_db';

const notFoundHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Link not found</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#0f172a">
<div style="text-align:center"><h1 style="font-size:1.5rem">This QR link doesn&rsquo;t exist</h1>
<p style="color:#64748b">It may have been removed.</p></div></body></html>`;

export const handler: Handler = async (event: HandlerEvent) => {
    // event.path reflects the original request path (e.g. "/r/abc123") regardless
    // of the netlify.toml rewrite target, so parse the code from there. Query param
    // is kept as a fallback for direct function invocation (e.g. manual testing).
    const codeFromPath = event.path.split('/').filter(Boolean).pop();
    const code = event.queryStringParameters?.code || codeFromPath;

    if (!code) {
        return { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: notFoundHtml };
    }

    const sql = getSql();

    try {
        await ensureQrTables(sql);

        const rows = await sql`SELECT id, target_url FROM qr_links WHERE code = ${code}`;
        if (rows.length === 0) {
            return { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: notFoundHtml };
        }

        const link = rows[0] as { id: number; target_url: string };

        try {
            await sql`
                INSERT INTO qr_scans (qr_link_id, user_agent, referrer)
                VALUES (${link.id}, ${event.headers['user-agent'] || null}, ${event.headers['referer'] || null})
            `;
        } catch (err) {
            console.error('qr-redirect scan log failed:', err);
        }

        return {
            statusCode: 302,
            headers: { Location: link.target_url },
            body: '',
        };
    } catch (error) {
        console.error('qr-redirect error:', error);
        return { statusCode: 500, headers: { 'Content-Type': 'text/html' }, body: notFoundHtml };
    }
};
