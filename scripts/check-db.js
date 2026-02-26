import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

async function checkDatabase() {
    let url = process.env.NETLIFY_DATABASE_URL;

    if (!url) {
        // Fallback to manual .env read
        try {
            const envContent = fs.readFileSync('.env', 'utf8');
            const match = envContent.match(/NETLIFY_DATABASE_URL="?([^"\n]+)"?/);
            if (match) url = match[1];
        } catch (e) {
            console.error('Failed to read .env file');
        }
    }
    if (!url) {
        console.error('NETLIFY_DATABASE_URL not found in environment');
        return;
    }

    const sql = neon(url);

    try {
        console.log('\n--- Event Signups ---');
        const signups = await sql`SELECT * FROM event_signups ORDER BY created_at DESC LIMIT 5`;
        console.table(signups);

        console.log('\n--- Contact Messages ---');
        const contacts = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5`;
        console.table(contacts);

        console.log('\n--- Join Applications ---');
        const joins = await sql`SELECT * FROM join_applications ORDER BY created_at DESC LIMIT 5`;
        console.table(joins);

    } catch (error) {
        console.error('Error querying database:', error);
    }
}

checkDatabase();
