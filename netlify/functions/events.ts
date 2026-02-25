import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import eventsData from '../../src/data/events.json';

export const handler: Handler = async (event) => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        // Check if table exists and has data, otherwise we might want to seed it or just return JSON
        // For now, let's try to fetch from DB, and fallback to JSON if empty/error

        // Create table if not exists
        await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start_at TIMESTAMP WITH TIME ZONE,
        location_name TEXT,
        url TEXT,
        cover_url TEXT,
        raw_date TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const events = await sql`SELECT * FROM events ORDER BY start_at ASC`;

        // If DB is empty, let's return the bundled JSON but maybe seed the DB for next time?
        if (events.length === 0) {
            console.log('DB empty, returning bundled JSON');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventsData),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(events),
        };
    } catch (error) {
        console.error('Database error, falling back to JSON:', error);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventsData),
        };
    }
};
