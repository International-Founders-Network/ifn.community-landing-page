/**
 * America/Chicago wall-time helpers for Admin → Blog scheduling.
 *
 * `<input type="datetime-local">` yields zone-less wall time ("2026-10-01T09:00").
 * The editorial contract says that wall time is Chicago time, and publishAt must
 * be stored as an instant WITH its offset. The offset depends on the date (CST
 * -06:00 vs CDT -05:00), so it cannot be a constant.
 *
 * Approach, no Temporal and no tz library: ask Intl for Chicago's offset at a
 * guessed instant (`timeZoneName: 'longOffset'` gives "GMT-05:00"), subtract it
 * from the wall time read as if it were UTC, then re-check the offset at the
 * result in case the guess straddled a DST switch. The returned string is built
 * from the Chicago wall clock AT the resolved instant, so it is always
 * self-consistent. A wall time that does not exist (the spring-forward hour,
 * e.g. 02:30 on the second Sunday of March) resolves one hour later; a repeated
 * fall-back time resolves to its first (CDT) occurrence.
 */
const ZONE = 'America/Chicago';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
});

interface ChicagoParts {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    seconds: string;
    offset: string; // -05:00
    offsetMinutes: number;
}

function chicagoParts(ms: number): ChicagoParts {
    const parts: Record<string, string> = {};
    for (const p of partsFormatter.formatToParts(new Date(ms))) parts[p.type] = p.value;
    // "GMT-05:00", or bare "GMT" at a zero offset (never for Chicago, but be exact).
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(parts.timeZoneName ?? '');
    const sign = match?.[1] === '-' ? -1 : 1;
    const offsetMinutes = match ? sign * (Number(match[2]) * 60 + Number(match[3])) : 0;
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        time: `${parts.hour}:${parts.minute}`,
        seconds: parts.second,
        offset: match ? `${match[1]}${match[2]}:${match[3]}` : '+00:00',
        offsetMinutes,
    };
}

/** "2026-10-01T09:00" (Chicago wall time) → "2026-10-01T09:00:00-05:00", or null if unparseable. */
export function chicagoWallTimeToIso(local: string): string | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
    if (!m) return null;
    const wallAsUtc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    const first = wallAsUtc - chicagoParts(wallAsUtc).offsetMinutes * 60_000;
    const second = wallAsUtc - chicagoParts(first).offsetMinutes * 60_000;
    const wanted = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
    const exact = [first, second].filter((ms) => {
        const c = chicagoParts(ms);
        return `${c.date}T${c.time}` === wanted;
    });
    // Exact match: earliest (first occurrence on fall-back). No match: the
    // wall time falls in the spring-forward gap, so take the later instant.
    const instant = exact.length > 0 ? Math.min(...exact) : Math.max(first, second);
    const p = chicagoParts(instant);
    return `${p.date}T${p.time}:${p.seconds}${p.offset}`;
}

/** ISO instant → "YYYY-MM-DDTHH:mm" in Chicago, for prefilling a datetime-local input. */
export function isoToChicagoWallTime(iso: string): string {
    const p = chicagoParts(Date.parse(iso));
    return `${p.date}T${p.time}`;
}

/** ISO instant → Chicago calendar day "YYYY-MM-DD", for grouping by day. */
export function chicagoDateKey(iso: string): string {
    return chicagoParts(Date.parse(iso)).date;
}

/** ISO instant → "Oct 1, 2026, 9:00 AM CDT" in Chicago. */
export function formatChicago(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        timeZone: ZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}
