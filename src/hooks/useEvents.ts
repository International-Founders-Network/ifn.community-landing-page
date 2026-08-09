import { useEffect, useState } from 'react';
import type { Event, EventRegistration, RegistrationPlatform } from '../components/EventCard';
import eventsData from '../data/events.json';

/**
 * Shape of a record as it actually arrives — deliberately loose.
 *
 * Two producers feed this hook and they do not agree:
 *  - `src/data/events.json` (the scraped snapshot) carries `registrations`, and every
 *    entry in it is currently an empty object `{}` because `scripts/sync-all.js` reads
 *    `platform`/`url` fields the scraper never wrote.
 *  - the `events` table has a single `url` column and no `registrations` column at all,
 *    so live rows arrive with `registrations` undefined.
 * Normalising here means `EventCard` renders one predictable shape either way, and
 * never renders a link with no destination.
 */
interface RawEvent {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    start_at?: unknown;
    location_name?: unknown;
    cover_url?: unknown;
    timezone?: unknown;
    url?: unknown;
    registrations?: unknown;
}

export interface UseEventsReturn {
    events: Event[];
    loading: boolean;
    /** Human-readable reason the live calendar could not be read, or null. */
    error: string | null;
    /**
     * True when the list on screen is the bundled snapshot rather than live data.
     * Surfaces in the UI — the audit's complaint was that this state was silent.
     */
    isStale: boolean;
}

function asText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function platformFromUrl(url: string): RegistrationPlatform {
    const lower = url.toLowerCase();
    if (lower.includes('lu.ma') || lower.includes('luma.com')) return 'luma';
    if (lower.includes('meetup.com')) return 'meetup';
    return 'other';
}

function normalizeRegistrations(raw: RawEvent): EventRegistration[] {
    const entries = Array.isArray(raw.registrations) ? raw.registrations : [];
    const out: EventRegistration[] = [];

    for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const url = asText((entry as { url?: unknown }).url);
        // No destination means no link. The snapshot's `[{}]` entries land here.
        if (!url) continue;
        const declared = asText((entry as { platform?: unknown }).platform)?.toLowerCase();
        const platform: RegistrationPlatform =
            declared === 'luma' || declared === 'meetup' ? declared : platformFromUrl(url);
        if (!out.some((existing) => existing.url === url)) out.push({ platform, url });
    }

    if (out.length === 0) {
        // Live database rows carry a single `url` instead of a registrations array.
        const single = asText(raw.url);
        if (single) out.push({ platform: platformFromUrl(single), url: single });
    }

    return out;
}

function normalizeEvent(raw: RawEvent): Event | null {
    const id = asText(raw.id) ?? (typeof raw.id === 'number' ? String(raw.id) : undefined);
    const title = asText(raw.title);
    const startAt = asText(raw.start_at) ?? (raw.start_at instanceof Date ? raw.start_at.toISOString() : undefined);
    if (!id || !title || !startAt) return null;

    const parsed = new Date(startAt);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
        id,
        title,
        description: asText(raw.description),
        // Normalised to ISO so `<time dateTime>` is always machine-readable.
        start_at: parsed.toISOString(),
        location_name: asText(raw.location_name),
        cover_url: asText(raw.cover_url),
        timezone: asText(raw.timezone),
        registrations: normalizeRegistrations(raw),
    };
}

function normalizeEvents(list: RawEvent[]): Event[] {
    return list
        .map(normalizeEvent)
        .filter((event): event is Event => event !== null)
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

/** Identity of a list of events, used to recognise the bundled snapshot coming back from the API. */
function fingerprint(events: Event[]): string {
    return events.map((event) => `${event.id}@${event.start_at}`).join('|');
}

/**
 * Did this payload come out of the bundled snapshot rather than the database?
 *
 * `netlify/functions/events.ts` answers 200 with the snapshot when the `events` table is
 * empty or the query throws, so the status code proves nothing. Two independent signals
 * have to agree before we tell a reader their dates may be behind:
 *
 *  1. Shape. The `events` table has no `registrations` column, so live rows never carry
 *     that key; every record in the snapshot does.
 *  2. Contents. The same meetups, at the same instants, as the file we shipped.
 *
 * Requiring both means a healthy database seeded from the same scrape — same ids, same
 * times, but DB-shaped rows — is not mislabelled as stale. If the schema ever grows a
 * registrations column this check goes quiet rather than crying wolf, which is the right
 * direction to fail in: a missed warning costs less than a permanent false one.
 */
function looksLikeBundledSnapshot(payload: RawEvent[], normalized: Event[]): boolean {
    if (payload.length === 0) return false;
    const snapshotShaped = payload.every(
        (item) => item !== null && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, 'registrations'),
    );
    return snapshotShaped && fingerprint(normalized) === FALLBACK_FINGERPRINT;
}

const FALLBACK_EVENTS = normalizeEvents(eventsData as unknown as RawEvent[]);
const FALLBACK_FINGERPRINT = fingerprint(FALLBACK_EVENTS);

export function useEvents(): UseEventsReturn {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStale, setIsStale] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadEvents = async () => {
            try {
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error(`/api/events responded ${response.status}`);

                const payload: unknown = await response.json();
                if (!Array.isArray(payload)) throw new Error('/api/events did not return a list');

                const raw = payload as RawEvent[];
                const live = normalizeEvents(raw);
                if (cancelled) return;

                setEvents(live);
                setError(null);
                setIsStale(looksLikeBundledSnapshot(raw, live));
            } catch (err) {
                if (cancelled) return;
                console.warn('Live events unavailable, using the bundled snapshot:', err);
                setEvents(FALLBACK_EVENTS);
                setIsStale(true);
                setError('We could not reach the live calendar.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadEvents();
        return () => {
            cancelled = true;
        };
    }, []);

    return { events, loading, error, isStale };
}
