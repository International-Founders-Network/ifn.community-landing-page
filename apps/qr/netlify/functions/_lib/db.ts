import { neon } from '@neondatabase/serverless';

// Lives in _lib/ rather than the functions root: Netlify deploys every file in
// the functions root as its own function, which is how _db.ts used to ship as
// a public endpoint.

export function getSql() {
    return neon(process.env.NETLIFY_DATABASE_URL!);
}

export async function ensureQrTables(sql: ReturnType<typeof getSql>) {
    await sql`
        CREATE TABLE IF NOT EXISTS qr_links (
            id SERIAL PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            edit_token TEXT UNIQUE NOT NULL,
            target_url TEXT NOT NULL,
            label TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS qr_scans (
            id SERIAL PRIMARY KEY,
            qr_link_id INTEGER NOT NULL REFERENCES qr_links(id) ON DELETE CASCADE,
            scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_agent TEXT,
            referrer TEXT
        )
    `;
}

export function getBaseUrl(headers: Record<string, string | undefined>): string {
    const proto = headers['x-forwarded-proto'] || 'https';
    const host = headers.host || 'qr.ifn.community';
    return `${proto}://${host}`;
}
