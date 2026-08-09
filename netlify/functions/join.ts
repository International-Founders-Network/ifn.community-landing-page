import { Handler, HandlerEvent } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Field limits. `name` and `email` are NOT NULL in the schema, so a submission
 * missing either used to reach Postgres and come back as a 500 with no usable
 * message. Everything is checked before the database is touched.
 */
const MAX_LENGTHS = {
    name: 120,
    email: 254, // RFC 5321 maximum address length
    linkedin: 500,
    stage: 60,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimmed(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function json(statusCode: number, payload: Record<string, unknown>) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let data: Record<string, unknown>;
    try {
        data = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { error: 'We could not read that submission. Please try again.' });
    }

    const name = trimmed(data.name);
    const email = trimmed(data.email);
    const linkedin = trimmed(data.linkedin);
    const stage = trimmed(data.stage);

    // Validation — messages are written to be shown to the person directly.
    if (!name || !email) {
        return json(400, { error: 'Please enter your name and your email address.' });
    }
    if (!EMAIL_REGEX.test(email)) {
        return json(400, { error: 'That email address does not look right. Please check it.' });
    }
    if (name.length > MAX_LENGTHS.name) {
        return json(400, { error: `Please keep your name to ${MAX_LENGTHS.name} characters or fewer.` });
    }
    if (email.length > MAX_LENGTHS.email) {
        return json(400, { error: `Please keep your email to ${MAX_LENGTHS.email} characters or fewer.` });
    }
    if (linkedin.length > MAX_LENGTHS.linkedin) {
        return json(400, { error: `Please keep your LinkedIn address to ${MAX_LENGTHS.linkedin} characters or fewer.` });
    }
    if (stage.length > MAX_LENGTHS.stage) {
        return json(400, { error: `Please keep the stage to ${MAX_LENGTHS.stage} characters or fewer.` });
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    try {
        // Idempotent. Mirrors db/migrations/00_initial_schema.sql — see db/README.md.
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

        await sql`
            INSERT INTO join_applications (name, email, linkedin, stage)
            VALUES (${name}, ${email}, ${linkedin || null}, ${stage || null})
        `;

        return json(200, { message: 'Application received successfully' });
    } catch (error) {
        // Log the failure, never the applicant. Names, email addresses and
        // LinkedIn profiles must not end up in function logs.
        console.error('Join submission error:', error);
        return json(500, { error: 'Internal server error. Please try again later.' });
    }
};
