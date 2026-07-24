import { Handler, HandlerEvent } from '@netlify/functions';
import { verifyGoogleIdToken, isAllowedEmail, createSessionCookie } from './_lib/auth';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        const { credential } = data;

        if (!credential || typeof credential !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing Google credential' }),
            };
        }

        const identity = await verifyGoogleIdToken(credential);

        if (!isAllowedEmail(identity.email)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'This account is not authorized for admin access.' }),
            };
        }

        const cookie = await createSessionCookie(identity.email);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
            body: JSON.stringify({ email: identity.email }),
        };
    } catch (error) {
        console.error('Google auth error:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Authentication failed' }),
        };
    }
};
