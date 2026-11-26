/**
 * One Luma calendar scrape, shared by every calendar the site syncs.
 *
 * Loads the public calendar page in headless Chrome, reads the first page of
 * upcoming entries from __NEXT_DATA__, then keeps following
 * `calendar/get-items` with `next_cursor` until `has_more` is false.
 *
 * PAGINATION IS NOT OPTIONAL. The page only embeds the first 16 or so
 * upcoming entries. On lu.ma/claudeworkshops (about 94 upcoming events) that
 * first page ends around December 3 and does not contain either IFN Austin
 * workshop; they only arrive on later get-items pages.
 *
 * Returns the raw calendar entries (`{ event, hosts, ... }`). Throws on any
 * failure, including a page that fails partway through pagination, so the
 * caller never writes a partial list.
 */
const GET_ITEMS_URL = 'https://api.luma.com/calendar/get-items';
const PAGE_SIZE = 20;
// A runaway cursor should fail loudly, not loop. 50 pages is 1,000 events.
const MAX_PAGES = 50;

export async function scrapeLumaCalendar(browser, calendarUrl) {
    console.log(`Scraping Luma calendar ${calendarUrl}...`);
    const page = await browser.newPage();
    try {
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
        await page.goto(calendarUrl, { waitUntil: 'networkidle2' });

        // Runs in the browser: everything it needs is passed in, nothing from
        // this module's scope is visible there.
        const result = await page.evaluate(async ({ getItemsUrl, pageSize, maxPages }) => {
            const script = document.getElementById('__NEXT_DATA__');
            if (!script) throw new Error('No __NEXT_DATA__ on the calendar page');
            const json = JSON.parse(script.innerText);
            const props = json.props?.pageProps;
            const data = props?.initialData?.data || {};
            const calendarApiId = data.calendar?.api_id;
            const upcoming = data.upcoming;

            if (!upcoming || !Array.isArray(upcoming.entries)) {
                // Older page shape with no `upcoming` block: take what is embedded.
                const items = data.featured_items || props?.calendar_items || props?.initialData?.items || [];
                return { calendarApiId, entries: items, pages: 1 };
            }

            const entries = [...upcoming.entries];
            let hasMore = Boolean(upcoming.has_more);
            let cursor = upcoming.next_cursor;
            let pages = 1;

            while (hasMore) {
                if (!calendarApiId) throw new Error('Calendar api_id missing, cannot paginate');
                if (!cursor) throw new Error('has_more is true but next_cursor is missing');
                if (pages >= maxPages) throw new Error(`Gave up after ${maxPages} pages`);

                const params = new URLSearchParams({
                    calendar_api_id: calendarApiId,
                    pagination_limit: String(pageSize),
                    period: 'future',
                    pagination_cursor: cursor,
                });
                const res = await fetch(`${getItemsUrl}?${params}`, { credentials: 'include' });
                if (!res.ok) throw new Error(`get-items answered ${res.status} on page ${pages + 1}`);
                const body = await res.json();
                if (!Array.isArray(body.entries)) throw new Error(`get-items page ${pages + 1} has no entries array`);

                entries.push(...body.entries);
                hasMore = Boolean(body.has_more);
                cursor = body.next_cursor;
                pages += 1;
            }

            return { calendarApiId, entries, pages };
        }, { getItemsUrl: GET_ITEMS_URL, pageSize: PAGE_SIZE, maxPages: MAX_PAGES });

        console.log(`  ${calendarUrl}: ${result.entries.length} entries over ${result.pages} page(s), calendar ${result.calendarApiId}`);
        return result.entries;
    } finally {
        await page.close();
    }
}
