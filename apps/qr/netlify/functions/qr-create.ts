import type { Handler, HandlerEvent } from '@netlify/functions';
import { randomInt, randomUUID } from 'node:crypto';
import { ensureQrTables, getBaseUrl, getSql } from './_lib/db';
import { requireAdmin } from './_lib/auth';
import { json } from './_lib/http';
import { checkRedirectTarget } from '../../src/lib/redirectAllowlist';

// Avoids visually ambiguous characters (0/O, 1/l/I).
const CODE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 7;
const MAX_LABEL_LENGTH = 200;

function generateCode(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    return code;
}

// Creates a trackable short link. Admin only; the destination must be on the
// redirect allowlist (src/lib/redirectAllowlist.ts). Used by the generator and
// by bulk mode, which calls this once per URL.
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    const admin = await requireAdmin(event, { write: true });
    if (!admin.ok) return admin.response;

    let data: { targetUrl?: unknown; label?: unknown };
    try {
        data = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { error: 'Invalid JSON body' });
    }

    const target = checkRedirectTarget(data.targetUrl);
    if (!target.ok) return json(400, { error: target.error });

    const label = typeof data.label === 'string' && data.label.trim() ? data.label.trim().slice(0, MAX_LABEL_LENGTH) : null;

    try {
        const sql = getSql();
        await ensureQrTables(sql);

        const editToken = randomUUID();
        let code = '';

        for (let attempt = 0; attempt < 5; attempt++) {
            code = generateCode();
            try {
                await sql`
                    INSERT INTO qr_links (code, edit_token, target_url, label)
                    VALUES (${code}, ${editToken}, ${target.url}, ${label})
                `;
                break;
            } catch (err) {
                const message = err instanceof Error ? err.message : '';
                if (message.includes('duplicate key') && attempt < 4) continue;
                throw err;
            }
        }

        console.log(`qr-create: ${admin.email} created ${code}`);
        const baseUrl = getBaseUrl(event.headers as Record<string, string | undefined>);

        return json(200, { code, editToken, shortUrl: `${baseUrl}/r/${code}` });
    } catch (error) {
        console.error('qr-create error:', error);
        return json(500, { error: 'Internal server error. Please try again later.' });
    }
};
