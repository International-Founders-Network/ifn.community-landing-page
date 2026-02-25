
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LUMA_FILE = path.join(__dirname, '../src/data/events.json');
const MEETUP_FILE = path.join(__dirname, '../src/data/events-meetup.json');
const FINAL_FILE = path.join(__dirname, '../src/data/events.json');

async function syncAll() {
    console.log('--- Starting Global Event Sync ---');

    try {
        console.log('Syncing Luma...');
        execSync('node scripts/update-events.js', { stdio: 'inherit' });

        console.log('Syncing Meetup...');
        execSync('node scripts/sync-meetup.js', { stdio: 'inherit' });

        const lumaData = JSON.parse(fs.readFileSync(LUMA_FILE, 'utf8'));
        let meetupData = [];
        if (fs.existsSync(MEETUP_FILE)) {
            meetupData = JSON.parse(fs.readFileSync(MEETUP_FILE, 'utf8'));
        }

        // Merge and sort by date
        const allEvents = [...lumaData, ...meetupData].sort((a, b) =>
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        );

        // Remove duplicates by ID (if any across platforms, though unlikely)
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());

        fs.writeFileSync(FINAL_FILE, JSON.stringify(uniqueEvents, null, 2));
        console.log(`--- Sync Complete! Total Events: ${uniqueEvents.length} ---`);

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncAll();
