/**
 * Event date and time formatting, shared by `EventCard` (the /events grid) and
 * `EventsPreview` (the home page featured object plus index).
 *
 * WHY THIS LIVES IN `lib/` RATHER THAN IN `EventCard.tsx`. Two components now
 * need the same zone logic, and the audits that produced that logic make
 * duplicating it the worst available option: a second copy is a second place
 * for the DST label or the reader-zone comparison to drift. Exporting these
 * from a component file instead would trip `react-refresh/only-export-components`,
 * which is the same reason `buttonStyles.ts` sits outside `Button.tsx`.
 *
 * Nothing here is new behaviour. Every rule below was already shipping inside
 * `EventCard.tsx` and is moved verbatim, comments included.
 */

/**
 * Austin, and the only place IFN meets. Used when the feed names no zone.
 *
 * MODULE SURFACE. `describeMoment` and the three interfaces are the whole of
 * the public API; the constant and the three helpers below it are private
 * because nothing outside this file consumes them, and an exported helper that
 * no caller uses is an invitation to grow a second code path for the zone logic
 * these two audits exist to keep in one place.
 */
const AUSTIN_TIME_ZONE = 'America/Chicago';

/** The minimum an event has to carry for a moment to be described. */
export interface DatedEvent {
    /** ISO 8601 instant. */
    start_at: string;
    /** IANA zone (e.g. `America/Chicago`) when the source supplies one. */
    timezone?: string;
    location_name?: string;
}

function isSupportedTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone });
        return true;
    } catch {
        return false;
    }
}

/**
 * The zone the event actually happens in, never the reader's.
 *
 * An Austin meetup starting 2026-08-27T23:30Z is 6:30 PM CDT. Rendered in the reader's
 * zone with no label, a founder in Berlin was being told 1:30 AM the following day.
 * Returns null when the zone genuinely cannot be established, so the caller can say so
 * rather than guess.
 */
function resolveEventTimeZone(event: Pick<DatedEvent, 'timezone' | 'location_name'>): string | null {
    const declared = event.timezone?.trim();
    if (declared && isSupportedTimeZone(declared)) return declared;

    const place = event.location_name?.toLowerCase() ?? '';
    if (/austin|texas|\btx\b/.test(place)) return AUSTIN_TIME_ZONE;

    return null;
}

function viewerTimeZone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

export interface FormattedMoment {
    /** Short month, e.g. "Aug". */
    month: string;
    /** Day of month, e.g. "27". */
    day: string;
    /** Full weekday, e.g. "Thursday". */
    weekday: string;
    /** Four-digit year, e.g. "2026". */
    year: string;
    /** e.g. "Thu, Aug 27, 2026" */
    date: string;
    /** e.g. "6:30 PM" */
    time: string;
    /** e.g. "CDT" */
    zone: string;
}

function formatMoment(date: Date, timeZone: string): FormattedMoment {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).formatToParts(date);

    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';

    // `weekday: 'long'` gives "Thursday"; the short form the card badge wants is
    // its first three letters, which is how `en-US` abbreviates every weekday.
    const weekday = part('weekday');

    return {
        month: part('month'),
        day: part('day'),
        weekday,
        year: part('year'),
        date: `${weekday.slice(0, 3)}, ${part('month')} ${part('day')}, ${part('year')}`,
        time: `${part('hour')}:${part('minute')} ${part('dayPeriod')}`,
        zone: part('timeZoneName'),
    };
}

export interface DescribedMoment {
    /** The parsed instant. */
    date: Date;
    /** The event's own zone, or null when it could not be established. */
    eventZone: string | null;
    /** Formatted in the event's zone when known, otherwise in the reader's. */
    shown: FormattedMoment;
    /** The same instant in the reader's zone. */
    inReaderZone: FormattedMoment;
    /** True when the two differ, so the reader needs both printed. */
    showReaderLine: boolean;
}

/**
 * One instant, described the way every surface on this site prints it.
 *
 * When the event's own zone is unknown we fall back to the reader's zone and label it
 * as theirs, rather than printing an Austin abbreviation we cannot stand behind.
 */
export function describeMoment(event: DatedEvent): DescribedMoment {
    const date = new Date(event.start_at);
    const eventZone = resolveEventTimeZone(event);
    const readerZone = viewerTimeZone();

    const shown = formatMoment(date, eventZone ?? readerZone);
    const inReaderZone = formatMoment(date, readerZone);
    const showReaderLine =
        eventZone !== null && (inReaderZone.date !== shown.date || inReaderZone.time !== shown.time);

    return { date, eventZone, shown, inReaderZone, showReaderLine };
}
