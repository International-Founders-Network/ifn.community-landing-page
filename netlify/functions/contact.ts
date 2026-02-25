import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        const data = JSON.parse(event.body || '{}');
        console.log('Received contact message:', data);

        // Create table if not exists
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

        // Insert data
        await sql`
      INSERT INTO contact_messages (name, email, phone, company, message)
      VALUES (${data.name}, ${data.email}, ${data.phone}, ${data.company}, ${data.message})
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Message sent successfully' }),
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process request' }),
        };
    }
};
