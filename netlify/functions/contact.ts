import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        const data = JSON.parse(event.body || '{}');
        const { name, email, phone, company, message } = data;

        // Validation
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name, email, and message are required fields' }),
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email format' }),
            };
        }

        /**
         * Deliberately logs no visitor data. This previously wrote
         * `{ name, email, company }` into Netlify's function logs, which is a
         * third-party log store with its own retention, readable by anyone with
         * access to the Netlify project, and disclosed nowhere in the privacy
         * policy. The submission is already persisted to Postgres, where it is
         * covered by the deletion promise the policy makes — so the log line
         * added an undisclosed second copy and no operational value.
         */
        console.log('Received contact message');

        // Create table if not exists (Idempotent)
        await sql`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                company TEXT,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Insert data using indexed parameters for safety
        await sql`
            INSERT INTO contact_messages (name, email, phone, company, message)
            VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${message})
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Success! We have received your message.' }),
        };
    } catch (error) {
        console.error('Submission error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error. Please try again later.' }),
        };
    }
};
