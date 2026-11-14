import type { Handler, HandlerEvent } from '@netlify/functions';
import { clearSessionCookie } from './_lib/auth';
import { json, rejectCrossSiteWrite } from './_lib/http';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    const csrf = rejectCrossSiteWrite(event);
    if (csrf) return csrf;
    return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
};
