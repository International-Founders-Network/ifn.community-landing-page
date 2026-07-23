import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { getSessionEmail } from './_lib/auth';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const email = await getSessionEmail(event);
    if (!email) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        // Batched as a single HTTP round trip to Neon instead of 3 concurrent requests —
        // each request pays its own TLS/handshake overhead, so batching cuts latency noticeably.
        const [joinApplications, contactMessages, eventSignups] = await sql.transaction(
            [
                sql`SELECT id, name, email, linkedin, stage, created_at FROM join_applications ORDER BY created_at DESC`,
                sql`SELECT id, name, email, phone, company, message, created_at FROM contact_messages ORDER BY created_at DESC`,
                sql`SELECT id, email, created_at FROM event_signups ORDER BY created_at DESC`,
            ],
            { readOnly: true }
        );

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinApplications, contactMessages, eventSignups }),
        };
    } catch (error) {
        console.error('Admin submissions error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to load submissions' }),
        };
    }
};
