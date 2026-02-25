import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        const data = JSON.parse(event.body || '{}');
        console.log('Received join application:', data);

        // Create table if not exists (simplistic check)
        await sql`
      CREATE TABLE IF NOT EXISTS join_applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        linkedin TEXT,
        stage TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Insert data
        await sql`
      INSERT INTO join_applications (name, email, linkedin, stage)
      VALUES (${data.name}, ${data.email}, ${data.linkedin}, ${data.stage})
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Application received successfully' }),
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process request' }),
        };
    }
};
