import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        const data = JSON.parse(event.body || '{}');
        const { email } = data;

        // Validation
        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email is required' }),
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email format' }),
            };
        }

        console.log('Received event signup:', { email });

        // Create table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS event_signups (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Insert data
        await sql`
            INSERT INTO event_signups (email)
            VALUES (${email})
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Success! You have been added to our notification list.' }),
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error. Please try again later.' }),
        };
    }
};
