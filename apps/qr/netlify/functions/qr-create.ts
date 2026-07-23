import { Handler, HandlerEvent } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { customAlphabet } from 'nanoid';
import { ensureQrTables, getBaseUrl, getSql, isValidHttpUrl } from './_db';

// Avoids visually ambiguous characters (0/O, 1/l/I).
const generateCode = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', 7);

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = getSql();

    try {
        const data = JSON.parse(event.body || '{}');
        const { targetUrl, label } = data as { targetUrl?: string; label?: string };

        if (!targetUrl || !isValidHttpUrl(targetUrl)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'A valid targetUrl (http/https) is required' }),
            };
        }

        await ensureQrTables(sql);

        const editToken = randomUUID();
        let code = '';

        for (let attempt = 0; attempt < 5; attempt++) {
            code = generateCode();
            try {
                await sql`
                    INSERT INTO qr_links (code, edit_token, target_url, label)
                    VALUES (${code}, ${editToken}, ${targetUrl}, ${label || null})
                `;
                break;
            } catch (err) {
                const message = err instanceof Error ? err.message : '';
                if (message.includes('duplicate key') && attempt < 4) continue;
                throw err;
            }
        }

        const baseUrl = getBaseUrl(event.headers as Record<string, string | undefined>);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                editToken,
                shortUrl: `${baseUrl}/r/${code}`,
            }),
        };
    } catch (error) {
        console.error('qr-create error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error. Please try again later.' }),
        };
    }
};
