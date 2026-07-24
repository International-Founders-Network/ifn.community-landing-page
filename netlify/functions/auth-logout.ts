import { Handler } from '@netlify/functions';
import { clearSessionCookie } from './_lib/auth';

export const handler: Handler = async () => {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
        body: JSON.stringify({ ok: true }),
    };
};
