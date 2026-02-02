
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

        // Wait for the content to appear
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Scroll to bottom to ensure lazy-loaded items appear
        await page.evaluate(async () => {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        // Extract data
        const events = await page.evaluate(() => {
            const items = [];
            const cards = document.querySelectorAll('.content-card');

            cards.forEach((card, index) => {
                const eventLink = card.querySelector('.event-link');
                const title = eventLink?.getAttribute('aria-label') || '';
                const url = eventLink?.href || '';
                const imgUrl = card.querySelector('img')?.src || '';

                // Extract dates by looking at preceding siblings (headers)
                let dateStr = '';
                let curr = card.previousElementSibling;
                while (curr && !curr.classList.contains('content-card')) {
                    if (curr.innerText) dateStr = curr.innerText + ' ' + dateStr;
                    curr = curr.previousElementSibling;
                }
                dateStr = dateStr.trim();

                // Extract time
                const text = card.innerText;
                const timeMatch = text.match(/\d+:\d+\s*[APM]+/i);
                const time = timeMatch ? timeMatch[0] : '';

                // Combined Start String (Approximate parsing for our app)
                // We'll trust the JSON editing for perfect ISO dates, but here we construct a display string
                // Ideally, we'd parse this to a real date object, but Luma's date format varies.
                // For now, let's try to construct a valid date if possible, assuming current/next year.

                // Location
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                let location = '';
                const byIdx = lines.findIndex(l => l.startsWith('By '));
                if (byIdx !== -1 && lines[byIdx + 1]) {
                    location = lines[byIdx + 1];
                } else {
                    location = lines[lines.length - 1];
                }

                // Simple ID generation
                const id = url.split('/').pop() || `event-${index}`;

                // Try to parse date
                // dateStr example: "Feb 26 Thursday" or "Thursday Feb 26"
                // time: "6:30 PM"
                let isoDate = new Date().toISOString();
                try {
                    // Very basic parser: "Feb 26 2026 6:30 PM"
                    const currentYear = new Date().getFullYear();
                    // Just assume 2026 per user context or current year + logic
                    const parseString = `${dateStr} ${currentYear} ${time}`;
                    const parsed = new Date(parseString);
                    if (!isNaN(parsed.getTime())) {
                        isoDate = parsed.toISOString();
                    }
                } catch (e) {
                    console.warn("Date parse error", e);
                }

                items.push({
                    id,
                    title,
                    start_at: isoDate, // The UI uses this for sorting/display
                    location_name: location,
                    url,
                    cover_url: imgUrl,
                    raw_date: dateStr + ' ' + time // Debug field
                });
            });
            return items;
        });

        console.log(`Found ${events.length} events.`);

        // Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));
        console.log(`Successfully wrote extracted data to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error('Error scraping:', e);
    } finally {
        await browser.close();
    }
}

scrapeEvents();
