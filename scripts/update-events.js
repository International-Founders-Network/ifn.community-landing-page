
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://lu.ma/IFN_ATX';
const OUTPUT_FILE = path.join(__dirname, '../src/data/events.json');

async function scrapeEvents() {
    console.log(`Starting scraper for ${TARGET_URL}...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a reasonable viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        // Extract data from __NEXT_DATA__ script tag
        const data = await page.evaluate(() => {
            const script = document.getElementById('__NEXT_DATA__');
            if (!script) return null;
            try {
                const json = JSON.parse(script.innerText);
                // Luma's structure usually has events in props.pageProps.calendar or similar
                // We'll search for things that look like events
                const props = json.props?.pageProps;

                // Luma's structure: featured_items often contains the upcoming events in a list view
                const initialData = props?.initialData?.data || {};
                const calendarEvents = initialData.featured_items || props?.calendar_items || props?.initialData?.items || [];

                return calendarEvents.map(item => {
                    const event = item.event || item;
                    // Skip if not an event object
                    if (!event.name && !event.title) return null;

                    return {
                        id: event.api_id || event.id || '',
                        title: event.name || event.title || '',
                        start_at: event.start_at || '',
                        location_name: event.geo_address_info?.full_address || event.geo_address_info?.city || event.location_name || '',
                        url: `https://lu.ma/${event.url_handle || event.api_id}`,
                        cover_url: event.cover_url || '',
                        platform: 'luma',
                        raw_date: event.start_at
                    };
                }).filter(e => e && e.title && e.start_at);
            } catch (e) {
                console.error("Failed to parse __NEXT_DATA__", e);
                return null;
            }
        });

        if (!data || data.length === 0) {
            console.warn("Could not extract events from __NEXT_DATA__, falling back to DOM scraping...");
            // ... (keep minimal fallback or just error out if we want consistency)
            // For now, let's just log and fail so we know it needs a real fix
            throw new Error("No data found in __NEXT_DATA__");
        }

        console.log(`Found ${data.length} events.`);

        // Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`Successfully wrote extracted data to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error('Error scraping:', e);
    } finally {
        await browser.close();
    }
}

scrapeEvents();
