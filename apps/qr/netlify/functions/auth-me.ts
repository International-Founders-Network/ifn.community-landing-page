import type { Handler, HandlerEvent } from '@netlify/functions';
import { requireAdmin } from './_lib/auth';
import { json } from './_lib/http';

// Who is signed in. 401 when nobody is, 503 when admin auth is not configured.
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') return json(405, { error: 'Method Not Allowed' });
    const admin = await requireAdmin(event, { write: false });
    if (!admin.ok) return admin.response;
    return json(200, { email: admin.email });
};
