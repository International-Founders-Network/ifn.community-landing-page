
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
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        // Meetup often stores data in a script tag with type "application/ld+json" or a global variable
        const events = await page.evaluate(() => {
            const items = [];
            // Try Schema.org JSON-LD first (most reliable for events)
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');

            scripts.forEach(script => {
                try {
                    const data = JSON.parse(script.innerText);
                    // Single event or array of events
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

            // Fallback to DOM if JSON-LD is missing or empty
            if (items.length === 0) {
                const cards = document.querySelectorAll('[data-testid="event-card"]');
                cards.forEach((card, index) => {
                    const title = card.querySelector('h2')?.innerText || card.querySelector('h3')?.innerText || '';
                    const url = card.querySelector('a')?.href || '';
                    const time = card.querySelector('time')?.getAttribute('datetime') || '';
                    const img = card.querySelector('img')?.src || '';

                    if (title && url) {
                        items.push({
                            id: url.split('/').filter(Boolean).pop() || `meetup-${index}`,
                            title,
                            start_at: time,
                            location_name: 'Austin, TX',
                            url,
                            cover_url: img,
                            platform: 'meetup',
                            raw_date: time
                        });
                    }
                });
            }

            return items;
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
