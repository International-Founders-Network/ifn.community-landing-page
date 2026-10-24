import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ensureQrTables, getSql } from './_lib/db';
import { checkRedirectTarget } from '../../src/lib/redirectAllowlist';

function page(title: string, detail: string): string {
    return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#0f172a">
<div style="text-align:center"><h1 style="font-size:1.5rem">${title}</h1>
<p style="color:#64748b">${detail}</p></div></body></html>`;
}

const notFoundHtml = page('This QR link doesn&rsquo;t exist', 'It may have been removed.');
const blockedHtml = page('This QR link is not available', 'Its destination is not on the list of sites IFN links to.');

// public/_headers does not reach function responses, so this sets its own.
// The pages above are static markup with inline styles and nothing else.
const HTML_HEADERS: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function htmlResponse(statusCode: number, body: string): HandlerResponse {
    return { statusCode, headers: HTML_HEADERS, body };
}

// Public: anyone who scans a code lands here. The stored destination is
// re-checked against the allowlist on every request, so a row written before
// the allowlist existed (or straight into the database) can never redirect
// offsite.
export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    // event.path reflects the original request path (e.g. "/r/abc123") regardless
    // of the netlify.toml rewrite target, so parse the code from there. Query param
    // is kept as a fallback for direct function invocation (e.g. manual testing).
    const codeFromPath = event.path.split('/').filter(Boolean).pop();
    const code = event.queryStringParameters?.code || codeFromPath;

    if (!code) return htmlResponse(404, notFoundHtml);

    try {
        const sql = getSql();
        await ensureQrTables(sql);

        const rows = await sql`SELECT id, target_url FROM qr_links WHERE code = ${code}`;
        if (rows.length === 0) return htmlResponse(404, notFoundHtml);

        const link = rows[0] as { id: number; target_url: string };
        const target = checkRedirectTarget(link.target_url);
        if (!target.ok) {
            console.warn(`qr-redirect: refusing non-allowlisted destination for link ${link.id}`);
            return htmlResponse(404, blockedHtml);
        }

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
            headers: { Location: target.url, 'Cache-Control': 'no-store', 'Referrer-Policy': 'strict-origin-when-cross-origin' },
            body: '',
        };
    } catch (error) {
        console.error('qr-redirect error:', error);
        return htmlResponse(500, notFoundHtml);
    }
};
