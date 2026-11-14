/**
 * Where a trackable short link (qr.ifn.community/r/<code>) is allowed to send
 * people. This is the ONE list: the browser imports it to show an error before
 * submitting, and netlify/functions imports it to enforce the same rule at
 * create, edit and redirect time. Without it /r/<code> is an open redirect on
 * an IFN domain.
 *
 * Matching is on the parsed hostname only, exact host or "." + host suffix, so
 * ifn.community.evil.com, evilifn.community and https://ifn.community@evil.com
 * all fail. https only, no credentials in the URL, no explicit port.
 *
 * Static QR codes are not affected: they encode the destination directly and
 * never touch this server.
 */

/** A host here also allows every subdomain of it. */
export const ALLOWED_REDIRECT_DOMAINS: readonly string[] = [
    'ifn.community',
    'lu.ma',
    'luma.com',
    'meetup.com',
    // Eventbrite runs one site per country. Only domains Eventbrite itself
    // operates belong here: a lookalike TLD owned by someone else would turn
    // this back into an open redirect. Check eventbrite.com's country selector
    // before adding one.
    'eventbrite.com',
    'eventbrite.ca',
    'eventbrite.co.uk',
    'eventbrite.ie',
    'eventbrite.com.au',
    'eventbrite.co.nz',
    'eventbrite.de',
    'eventbrite.at',
    'eventbrite.ch',
    'eventbrite.fr',
    'eventbrite.be',
    'eventbrite.nl',
    'eventbrite.es',
    'eventbrite.it',
    'eventbrite.pt',
    'eventbrite.se',
    'eventbrite.dk',
    'eventbrite.fi',
    'eventbrite.com.br',
    'eventbrite.com.mx',
    'eventbrite.com.ar',
    'eventbrite.com.pe',
    'eventbrite.cl',
    'eventbrite.co',
    'eventbrite.hk',
    'eventbrite.sg',
];

/** Longest URL we will store or redirect to. */
export const MAX_TARGET_URL_LENGTH = 2048;

/** Shown in the UI and returned by the API when a destination is refused. */
export const REDIRECT_ALLOWLIST_MESSAGE =
    'Trackable links can only point to https:// pages on ifn.community, lu.ma, luma.com, meetup.com or eventbrite. ' +
    'Turn off "trackable" to make a static QR code for any other URL.';

export function isAllowedRedirectHost(hostname: string): boolean {
    const host = hostname.toLowerCase();
    return ALLOWED_REDIRECT_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export type RedirectTargetCheck = { ok: true; url: string } | { ok: false; error: string };

/**
 * Validates a destination and returns it normalised (URL.href), which is what
 * should be stored and what goes in the Location header.
 */
export function checkRedirectTarget(value: unknown): RedirectTargetCheck {
    if (typeof value !== 'string' || value.trim() === '') {
        return { ok: false, error: 'A destination URL is required.' };
    }
    const raw = value.trim();
    if (raw.length > MAX_TARGET_URL_LENGTH) {
        return { ok: false, error: `The destination URL is longer than ${MAX_TARGET_URL_LENGTH} characters.` };
    }

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return { ok: false, error: 'Enter a full URL starting with https://' };
    }

    if (url.protocol !== 'https:' || url.username !== '' || url.password !== '' || url.port !== '') {
        return { ok: false, error: REDIRECT_ALLOWLIST_MESSAGE };
    }
    if (!isAllowedRedirectHost(url.hostname)) {
        return { ok: false, error: REDIRECT_ALLOWLIST_MESSAGE };
    }
    return { ok: true, url: url.href };
}

export function isAllowedRedirectTarget(value: unknown): boolean {
    return checkRedirectTarget(value).ok;
}
