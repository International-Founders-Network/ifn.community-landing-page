
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://www.meetup.com/international-founders-network-austin/events/';
const OUTPUT_FILE = path.join(__dirname, '../src/data/events-meetup.json');

async function scrapeMeetup() {
    console.log(`Starting Meetup scraper for ${TARGET_URL}...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    try {
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for JSON-LD script or event cards to load
        await page.waitForFunction(() => {
            return document.querySelectorAll('script[type="application/ld+json"]').length > 0 ||
                   document.querySelectorAll('[data-testid="event-card"]').length > 0;
        }, { timeout: 15000 }).catch(() => console.log('Timeout waiting for elements, proceeding anyway...'));

        // Meetup often stores data in `__NEXT_DATA__` Apollo state
        const events = await page.evaluate(() => {
            const items = [];
            
            // Try extracting from __NEXT_DATA__ first
            const nextDataScript = document.getElementById('__NEXT_DATA__');
            if (nextDataScript) {
                try {
                    const json = JSON.parse(nextDataScript.innerText);
                    const apolloState = json.props?.pageProps?.__APOLLO_STATE__ || {};
                    
                    Object.values(apolloState).forEach(item => {
                        if (item && item.__typename === 'Event' && item.title) {
                            items.push({
                                id: item.id || `meetup-${Math.random().toString(36).substr(2, 9)}`,
                                title: item.title,
                                start_at: item.dateTime,
                                location_name: item.venue?.name || 'Austin, TX',
                                url: item.eventUrl || `https://www.meetup.com/international-founders-network-austin/events/${item.id}/`,
                                cover_url: item.displayPhoto?.highResUrl || '',
                                platform: 'meetup',
                                raw_date: item.dateTime
                            });
                        }
                    });
                    
                    if (items.length > 0) return items.filter(item => item && item.start_at);
                } catch (e) { console.error("Failed to parse __NEXT_DATA__"); }
            }

            // Fallback to Schema.org JSON-LD
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            scripts.forEach(script => {
                try {
                    const data = JSON.parse(script.innerText);
                    const eventList = Array.isArray(data) ? data : [data];

                    eventList.forEach(item => {
                        if (item['@type'] === 'Event' || (item['@context']?.includes('schema.org') && item.name)) {
                            items.push({
                                id: item.url?.split('/').filter(Boolean).pop() || `meetup-${Math.random().toString(36).substr(2, 9)}`,
                                title: item.name,
                                start_at: item.startDate,
                                location_name: item.location?.name || item.location?.address?.addressLocality || 'Austin, TX',
                                url: item.url,
                                cover_url: item.image?.[0] || item.image || '',
                                platform: 'meetup',
                                raw_date: item.startDate
                            });
                        }
                    });
                } catch (e) { }
            });

            return items.filter(item => item && item.start_at);
        });

        console.log(`Found ${events.length} Meetup events.`);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));
        console.log(`Successfully wrote extracted data to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error('Error scraping Meetup:', e);
    } finally {
        await browser.close();
    }
}

scrapeMeetup();
