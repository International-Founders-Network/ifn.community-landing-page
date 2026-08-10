#!/usr/bin/env node
/**
 * Applies db/migrations/02_event_venue_station_austin.sql to a Postgres you name.
 *
 * The live `events` rows still say "Capital Factory" while src/data/events.json
 * and the site copy say "Station Austin", so /api/events contradicts the page.
 * This runner fixes that, deliberately, against a database you point it at.
 *
 *   Preview (default, writes nothing):
 *     DATABASE_URL='...' node scripts/fix-event-venue.mjs
 *
 *   Apply:
 *     DATABASE_URL='...' node scripts/fix-event-venue.mjs --apply
 *
 * There is no connection string in this repo. You supply DATABASE_URL (or
 * NETLIFY_DATABASE_URL, the name the deployed functions use) on the command
 * line. Nothing is written unless you pass --apply.
 *
 * It is safe to run twice: the UPDATE matches the two exact old strings and
 * writes a value that matches neither, so the second run reports 0 rows.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_FILE = path.join(__dirname, '../db/migrations/02_event_venue_station_austin.sql');

/** The two venue strings that appear in this repo's history. Exact match only. */
const OLD_VALUES = [
    'Capital Factory, 701 Brazos St, Austin, TX 78701, USA',
    'Capital Factory, Austin, TX',
];

/** Byte for byte the value in src/data/events.json. */
const NEW_VALUE = 'Station Austin, 701 Brazos St, Austin, TX 78701, USA';

function loadMigration() {
    const text = readFileSync(MIGRATION_FILE, 'utf8');

    // The Neon HTTP driver sends one statement per round trip, so refuse to run
    // a file that has grown a second one rather than silently truncating it.
    const statements = (text.match(/;/g) || []).length;
    if (statements !== 1) {
        throw new Error(
            `${MIGRATION_FILE} must contain exactly one statement, found ${statements} semicolons.`,
        );
    }

    // Keep this script's constants and the SQL of record in lockstep.
    for (const value of [...OLD_VALUES, NEW_VALUE]) {
        if (!text.includes(`'${value}'`)) {
            throw new Error(`${MIGRATION_FILE} no longer contains the literal '${value}'.`);
        }
    }

    return text;
}

function resolveConnectionString() {
    const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
    if (url && url.trim()) return url.trim();

    console.error('No database URL found.');
    console.error('');
    console.error('Set DATABASE_URL (or NETLIFY_DATABASE_URL) for this one command, e.g.');
    console.error("  DATABASE_URL='<your connection string>' node scripts/fix-event-venue.mjs");
    console.error('');
    console.error('Nothing is written without --apply.');
    return null;
}

const inPlaceholders = OLD_VALUES.map((_, i) => `$${i + 1}`).join(', ');

async function countsByOldValue(sql) {
    return sql.query(
        `SELECT location_name, count(*)::int AS n
           FROM events
          WHERE location_name IN (${inPlaceholders})
          GROUP BY location_name
          ORDER BY location_name`,
        OLD_VALUES,
    );
}

async function countAlreadyCorrect(sql) {
    const rows = await sql.query(
        'SELECT count(*)::int AS n FROM events WHERE location_name = $1',
        [NEW_VALUE],
    );
    return rows[0]?.n ?? 0;
}

async function unrecordedVariants(sql) {
    return sql.query(
        `SELECT location_name, count(*)::int AS n
           FROM events
          WHERE location_name ILIKE '%capital factory%'
            AND location_name NOT IN (${inPlaceholders})
          GROUP BY location_name
          ORDER BY location_name`,
        OLD_VALUES,
    );
}

function printGroups(label, rows) {
    if (rows.length === 0) {
        console.log(`  ${label}: none`);
        return;
    }
    for (const row of rows) {
        console.log(`  ${label}: ${row.n} row(s) "${row.location_name}"`);
    }
}

function total(rows) {
    return rows.reduce((sum, row) => sum + row.n, 0);
}

async function main() {
    const apply = process.argv.includes('--apply');
    const migration = loadMigration();

    const connectionString = resolveConnectionString();
    if (!connectionString) {
        process.exitCode = 1;
        return;
    }

    const sql = neon(connectionString);

    console.log(apply ? 'Mode: APPLY (rows will be written)' : 'Mode: preview (nothing will be written)');
    console.log('');

    let before;
    try {
        before = await countsByOldValue(sql);
    } catch (error) {
        // 42P01 is "undefined_table" specifically. Do NOT widen this to any
        // "does not exist" message: a missing `location_name` column reports the
        // same words, and turning that into a reassuring all-clear is the exact
        // silent contradiction this script exists to prevent.
        const missingTable =
            error?.code === '42P01' || /relation ".*" does not exist/.test(String(error?.message || ''));
        if (missingTable) {
            console.log('No `events` table in this database, so there is nothing to correct.');
            console.log('The site is serving the bundled src/data/events.json, which is already right.');
            return;
        }
        throw error;
    }

    const correct = await countAlreadyCorrect(sql);
    const unknown = await unrecordedVariants(sql);

    console.log('Current state:');
    printGroups('stale', before);
    console.log(`  already correct: ${correct} row(s) "${NEW_VALUE}"`);
    printGroups('unrecorded variant', unknown);
    console.log('');

    const pending = total(before);

    if (!apply) {
        console.log(
            pending === 0
                ? 'Nothing to do. No row matches either recorded old value.'
                : `Would update ${pending} row(s). Re-run with --apply to write.`,
        );
    } else if (pending === 0) {
        console.log('Nothing to do. No row matches either recorded old value, so no write was sent.');
    } else {
        await sql.query(migration);
        const after = await countsByOldValue(sql);
        const remaining = total(after);
        if (remaining !== 0) {
            console.error(`FAILED: ${remaining} stale row(s) survived the update.`);
            process.exitCode = 1;
            return;
        }
        console.log(`Updated ${pending} row(s) to "${NEW_VALUE}".`);
        console.log(`Total rows now carrying the correct venue: ${await countAlreadyCorrect(sql)}`);
    }

    if (unknown.length > 0) {
        console.log('');
        console.log('WARNING: rows above are labelled "unrecorded variant".');
        console.log('They mention Capital Factory but match neither recorded old string, so this');
        console.log('script left them alone on purpose. Decide what they should say, then either');
        console.log('add the exact string to OLD_VALUES and the migration, or edit those rows by hand.');
    }
}

main().catch((error) => {
    console.error('fix-event-venue failed:', error?.message || error);
    process.exitCode = 1;
});
