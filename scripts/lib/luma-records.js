/**
 * Pure helpers for the Luma sync: record mapping, the IFN workshop filter,
 * and the per-calendar failure isolation. The Station Austin venue correction
 * stays in `scripts/update-events.js`, applied to meetup records only.
 *
 * Nothing in here touches the network or Puppeteer, so
 * `netlify/tests/luma-sync.test.ts` can import it directly. The browser side
 * lives in `scripts/lib/luma-calendar.js`.
 */
import fs from 'fs';

/**
 * IFN_ATX meetup record. The same shape `scripts/update-events.js` has always
 * written into events.json, field for field; `scripts/sync-all.js` folds
 * `platform`/`url` into `registrations` afterwards. Do not add workshop fields
 * here: events.json feeds /events, the home page, and the Event JSON-LD.
 */
export function toMeetupRecord(item) {
    const event = item?.event || item;
    // Skip if not an event object
    if (!event || (!event.name && !event.title)) return null;

    const record = {
        id: event.api_id || event.id || '',
        title: event.name || event.title || '',
        start_at: event.start_at || '',
        location_name: event.geo_address_info?.full_address || event.geo_address_info?.city || event.location_name || '',
        url: (event.url || event.url_handle) ? `https://lu.ma/${event.url || event.url_handle}` : `https://lu.ma/${event.api_id}`,
        cover_url: event.cover_url || '',
        platform: 'luma',
        raw_date: event.start_at
    };
    if (!record.title || !record.start_at) return null;
    return record;
}

export function toMeetupRecords(items) {
    return items.map(toMeetupRecord).filter(Boolean);
}

/**
 * WHICH CLAUDE WORKSHOPS ARE IFN'S.
 *
 * lu.ma/claudeworkshops is a global calendar: around 94 upcoming events, run by
 * about 76 different hosts. /workshops must list only the ones IFN runs, and
 * whatever passes this check is published on ifn.community with its own title,
 * cover, and link, then pushed to main by the Sync Events workflow with no
 * review.
 *
 * So the match is on the IFN Community Luma account's host id
 * (`usr-8gxHhjHqtCy7lLP`, username `ifn_community`, the same account that
 * hosts the IFN_ATX meetups), not on anything another host can type. A host
 * display name of "IFN Community", or an event titled "... with International
 * Founders Network ...", is free text any host on the calendar can set, and
 * neither is enough on its own.
 *
 * If IFN ever hosts from a different Luma account, add its `usr-` id here.
 */
export const IFN_HOST_API_IDS = new Set(['usr-8gxHhjHqtCy7lLP']);

export function isIfnWorkshop(item) {
    if (!item?.event) return false;
    const hosts = Array.isArray(item.hosts) ? item.hosts : [];
    return hosts.some((host) => typeof host?.api_id === 'string' && IFN_HOST_API_IDS.has(host.api_id));
}

/**
 * Only Luma's own image CDN, which is also the only remote origin the site's
 * img-src allows. Anything else is dropped and the card shows its placeholder.
 */
function lumaCover(url) {
    return typeof url === 'string' && url.startsWith('https://images.lumacdn.com/') ? url : '';
}

/**
 * A street address only when Luma publishes one. Guests-only events come back
 * with `geo_address_info.mode === 'obfuscated'` and no address, and the site
 * must not fill one in from anywhere else.
 */
function publishedAddress(event) {
    const geo = event.geo_address_info;
    if (!geo || geo.mode === 'obfuscated') return undefined;
    const address = typeof geo.full_address === 'string' ? geo.full_address.trim() : '';
    return address || undefined;
}

/**
 * workshops.json record. Shaped to be an `Event` (src/components/EventCard.tsx)
 * so the meetup card renders it, plus `slug`, `end_at`, and `host`.
 * `location_name` is left off entirely when there is no published address.
 */
export function toWorkshopRecord(item) {
    const event = item.event;
    const slug = event.url || event.api_id;
    const record = {
        id: event.api_id,
        slug,
        title: event.name,
        start_at: event.start_at,
        end_at: event.end_at || undefined,
        timezone: event.timezone || undefined,
        location_name: publishedAddress(event),
        cover_url: lumaCover(event.cover_url),
        host: (item.hosts || []).map((host) => host?.name).filter(Boolean).join(', '),
        registrations: [{ platform: 'luma', url: `https://lu.ma/${slug}` }],
    };
    for (const key of Object.keys(record)) {
        if (record[key] === undefined) delete record[key];
    }
    return record;
}

/** IFN's workshops only, one per Luma event id, soonest first. */
export function toWorkshopRecords(items) {
    const byId = new Map();
    for (const item of items) {
        if (!isIfnWorkshop(item) || !item.event?.api_id || !item.event?.start_at) continue;
        byId.set(item.event.api_id, toWorkshopRecord(item));
    }
    return [...byId.values()].sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
}

/**
 * FAILURE ISOLATION BETWEEN CALENDARS.
 *
 * Each job scrapes one calendar and owns one output file. A job that throws, or
 * that comes back empty when `allowEmpty` is false, leaves its file exactly as
 * it was: the last good data stays on the site rather than an empty list. One
 * job failing never stops the next one from running or writing, so the Sync
 * Events workflow can still commit the file that did succeed.
 *
 * Returns one `{ name, ok, count?, error? }` per job. Never throws.
 */
export async function runCalendarJobs(jobs, { writeFile = defaultWriteFile, log = console } = {}) {
    const results = [];
    for (const job of jobs) {
        try {
            const items = await job.scrape();
            const records = job.toRecords(items);
            if (records.length === 0 && !job.allowEmpty) {
                throw new Error(`No events extracted from ${job.url}`);
            }
            writeFile(job.outputFile, JSON.stringify(records, null, 2));
            log.log(`[${job.name}] Wrote ${records.length} records to ${job.outputFile}`);
            results.push({ name: job.name, ok: true, count: records.length });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            log.error(`[${job.name}] Sync failed, ${job.outputFile} left untouched: ${message}`);
            if (process.env.GITHUB_ACTIONS) {
                log.log(`::error title=Luma sync (${job.name})::${message}. ${job.outputFile} was not changed.`);
            }
            results.push({ name: job.name, ok: false, error: message });
        }
    }
    return results;
}

function defaultWriteFile(file, contents) {
    fs.writeFileSync(file, contents);
}
