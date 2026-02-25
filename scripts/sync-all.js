
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

        // --- Intelligent De-duplication & Merging ---
        const mergedEvents = new Map();

        [...lumaData, ...meetupData].forEach(event => {
            // Create a normalization key: "title|date" 
            const datePart = event.start_at.split('T')[0];
            const titlePart = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            const key = `${titlePart}|${datePart}`;

            if (mergedEvents.has(key)) {
                const existing = mergedEvents.get(key);

                // Initialize registrations array if it doesn't exist
                if (!existing.registrations) {
                    existing.registrations = [{ platform: existing.platform, url: existing.url }];
                    delete existing.platform;
                    delete existing.url;
                }

                // Merge this registration if it hasn't been added yet
                const platformExists = existing.registrations.some(r => r.platform === event.platform);
                if (!platformExists) {
                    existing.registrations.push({ platform: event.platform, url: event.url });
                }

                // Keep the record with the most detail
                if (event.location_name?.length > (existing.location_name?.length || 0)) {
                    existing.location_name = event.location_name;
                }
            } else {
                // First time seeing this event: Initialize unified structure
                const newEvent = { ...event };
                newEvent.registrations = [{ platform: event.platform, url: event.url }];
                delete newEvent.platform;
                delete newEvent.url;
                mergedEvents.set(key, newEvent);
            }
        });

        const uniqueEvents = Array.from(mergedEvents.values()).sort((a, b) =>
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        );

        fs.writeFileSync(FINAL_FILE, JSON.stringify(uniqueEvents, null, 2));
        console.log(`--- Sync Complete! Total Unique Events: ${uniqueEvents.length} ---`);

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncAll();
