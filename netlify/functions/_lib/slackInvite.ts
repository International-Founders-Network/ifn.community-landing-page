/**
 * Decides whether the Members Slack invite link may be shown right now.
 *
 * SLACK_INVITE_URL is a shared invite link that admits anyone holding it, so it
 * is read from the function's own environment at request time and handed only
 * to a buyer whose checkout the server has just verified with Stripe. It must
 * never become a VITE_* variable: anything Vite sees ends up in the public
 * bundle.
 *
 * Slack shared invite links expire, so the link is withheld once
 * SLACK_INVITE_EXPIRES_AT has passed. A missing or unreadable expiry also
 * withholds it: the page then tells the buyer to email us, which is a better
 * outcome than a button that opens a dead invite.
 */

/** `process.env`, or a plain object in tests. */
export interface SlackInviteEnv {
    [name: string]: string | undefined;
    SLACK_INVITE_URL?: string;
    SLACK_INVITE_EXPIRES_AT?: string;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A full timestamp must carry its own zone (Z or +hh:mm). Without one,
 * `Date.parse` reads it in the server's local zone, which differs between
 * Netlify and a laptop.
 */
const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Central time, standard offset. A date-only expiry such as 2026-11-25 means
 * "the link stops at the start of that day in Austin". IFN runs on Central
 * time, and the dates we expect (late November onward) fall in CST, so the
 * fixed -06:00 offset is exact for them and at most an hour early in summer.
 * Early is the safe direction: the buyer gets the email fallback instead of a
 * link that may already be dead.
 */
const CENTRAL_STANDARD_OFFSET = '-06:00';

/** Epoch millis of the expiry, or null when it is missing or unreadable. */
export function parseInviteExpiry(raw: string | undefined): number | null {
    const value = raw?.trim();
    if (!value) return null;

    let iso: string;
    if (DATE_ONLY.test(value)) {
        iso = `${value}T00:00:00${CENTRAL_STANDARD_OFFSET}`;
    } else if (ISO_WITH_ZONE.test(value)) {
        iso = value;
    } else {
        return null;
    }

    const ms = Date.parse(iso);
    return Number.isFinite(ms) ? ms : null;
}

/** True only for an absolute https URL. */
function isHttpsUrl(raw: string): boolean {
    try {
        return new URL(raw).protocol === 'https:';
    } catch {
        return false;
    }
}

export function resolveSlackInvite(env: SlackInviteEnv, now: Date): { url: string | null } {
    const url = env.SLACK_INVITE_URL?.trim();
    if (!url || !isHttpsUrl(url)) return { url: null };

    const expiresAt = parseInviteExpiry(env.SLACK_INVITE_EXPIRES_AT);
    if (expiresAt === null) return { url: null };

    return now.getTime() < expiresAt ? { url } : { url: null };
}
