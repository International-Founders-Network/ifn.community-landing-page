import { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionEmail } from './_lib/auth';

export const handler: Handler = async (event: HandlerEvent) => {
    const email = await getSessionEmail(event);

    if (!email) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    };
};
