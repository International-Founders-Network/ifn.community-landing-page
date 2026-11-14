import type { Handler, HandlerEvent } from '@netlify/functions';
import {
    authNotConfiguredResponse,
    createSessionCookie,
    isAllowedEmail,
    missingAuthConfig,
    verifyGoogleIdToken,
} from './_lib/auth';
import { json, rejectCrossSiteWrite } from './_lib/http';

// Exchanges a Google Sign-In ID token for the QR admin session cookie.
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (missingAuthConfig().length > 0) return authNotConfiguredResponse();

    const csrf = rejectCrossSiteWrite(event);
    if (csrf) return csrf;

    let credential: unknown;
    try {
        credential = (JSON.parse(event.body || '{}') as { credential?: unknown }).credential;
    } catch {
        return json(400, { error: 'Invalid JSON body' });
    }
    if (!credential || typeof credential !== 'string') {
        return json(400, { error: 'Missing Google credential' });
    }

    let email: string;
    try {
        email = (await verifyGoogleIdToken(credential)).email;
    } catch (error) {
        console.error('qr auth-google: token rejected:', error instanceof Error ? error.message : error);
        return json(401, { error: 'Authentication failed' });
    }

    if (!isAllowedEmail(email)) {
        return json(403, { error: 'This account is not authorized to manage short links.' });
    }

    const cookie = await createSessionCookie(email);
    return json(200, { email }, { 'Set-Cookie': cookie });
};
