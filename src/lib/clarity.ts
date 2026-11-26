/**
 * MICROSOFT CLARITY (heatmaps and session recordings).
 *
 * Clarity is stricter than GA4 here, by design. GA4 loads for everyone behind
 * Consent Mode and sends cookieless pings until the visitor accepts. Clarity
 * records the page itself, so it is not fetched at all until the visitor has
 * said yes through the same banner and the same stored choice GA4 uses
 * (`ifn-analytics-consent`, owned by src/lib/analytics.ts). There is no
 * separate Clarity consent UI and there must never be one.
 *
 * WHAT LOADS WHEN:
 *
 *   - VITE_CLARITY_PROJECT_ID unset, empty, or not a short alphanumeric
 *     string: nothing, ever. No stub, no script, no warning.
 *   - Consent stored as granted on an earlier visit: the tag is injected after
 *     `load` plus one idle callback, the same deferral GA4 uses so it stays out
 *     of the LCP window.
 *   - Consent granted now, via the banner: injected immediately.
 *   - Consent denied or not yet given: nothing.
 *   - /admin and everything under it: never injected. See syncClarityRoute.
 *   - /membership while ?checkout= is present (the Stripe return page): never
 *     injected.
 *   - Any URL in this document's lifetime carrying a sensitive query parameter
 *     (src/lib/sensitiveUrl.ts, chiefly Stripe's session_id): never injected,
 *     and stopped if already running, until the next full page load. See
 *     `sensitiveLatched` below.
 *
 * This module holds no consent storage of its own. analytics.ts reads the
 * stored choice and calls in; keeping the dependency one way avoids a circular
 * import between the two.
 */

import { hasSensitiveParams } from './sensitiveUrl';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
    interface Window {
        clarity?: ClarityFn;
    }
}

/**
 * Real Clarity project ids are 10 lowercase alphanumerics. The bounds are
 * looser than that on purpose, but tight enough that nothing able to break out
 * of a URL path segment can ever reach the script src below.
 */
const PROJECT_ID_PATTERN = /^[a-z0-9]{4,32}$/i;

export function parseClarityProjectId(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const id = raw.trim();
    return PROJECT_ID_PATTERN.test(id) ? id : null;
}

const PROJECT_ID = parseClarityProjectId(import.meta.env.VITE_CLARITY_PROJECT_ID);

export const isClarityConfigured = PROJECT_ID !== null;

/** Internal routes that are never recorded. Everything admin lives under /admin. */
export function isClarityExcludedPath(pathname: string): boolean {
    return /^\/admin(\/|$)/i.test(pathname);
}

/**
 * Routes excluded for this URL. Adds, to the admin paths, the Stripe return
 * page: /membership with any `checkout` parameter, success or cancelled. Its
 * success state renders the members Slack invite link.
 */
export function isClarityExcludedLocation(pathname: string, search: string): boolean {
    if (isClarityExcludedPath(pathname)) return true;
    return (
        /^\/membership\/?$/i.test(pathname) &&
        new URLSearchParams(search.replace(/^\?/, '')).has('checkout')
    );
}

/** The visitor has said yes, in this page's lifetime or a stored earlier one. */
let granted = false;
/** The script tag is in the document (or about to be, for a deferred load). */
let scheduled = false;
let injected = false;
/** clarity('stop') has been sent; recording stays off until the next full page load. */
let stopped = false;

/**
 * THE SENSITIVE URL LATCH. Once any URL seen in this document carries a
 * sensitive query parameter, Clarity does not load, and if running is
 * stopped, for the rest of the document's lifetime. Consent granted later on
 * the same page does not lift it, and neither does src/pages/Membership.tsx
 * stripping session_id from the address bar: the stripped URL looks clean,
 * but Clarity reports the page URL and referrer it saw, and the DOM was
 * rendered from the original. Only a full page load resets it.
 *
 * Checked at module evaluation, which is before the app renders (src/main.tsx
 * imports this through analytics.ts), so the INITIAL URL is captured before
 * anything can rewrite it.
 */
let sensitiveLatched = false;

function latchIfSensitive(search: string, hash: string): boolean {
    if (hasSensitiveParams(search, hash)) sensitiveLatched = true;
    return sensitiveLatched;
}

if (typeof window !== 'undefined' && window.location) {
    latchIfSensitive(window.location.search ?? '', window.location.hash ?? '');
}

/** The current document URL is latched or excluded. */
function blockedHere(): boolean {
    const { pathname, search = '', hash = '' } = window.location;
    if (latchIfSensitive(search, hash)) return true;
    return isClarityExcludedLocation(pathname, search);
}

function stopIfRunning() {
    if (injected && !stopped) {
        stopped = true;
        clarity('stop');
    }
}

function canRun(): boolean {
    if (!PROJECT_ID) return false;
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    /** Never record the prerender. Same guard, same reason, as GA4. */
    if (navigator.webdriver) return false;
    return true;
}

/**
 * Every call goes through `window.clarity`, never a captured reference: the
 * tag replaces the stub with the real dispatcher when it arrives and drains
 * the queue in push order.
 */
function clarity(...args: unknown[]) {
    window.clarity?.(...args);
}

/**
 * Clarity's standard queue stub. Like gtag, it must push `arguments` (the
 * array-like object the tag's queue processor spreads), and so it must be a
 * `function`, not an arrow.
 */
function installStub() {
    if (window.clarity) return;
    const stub: ClarityFn = function () {
        // eslint-disable-next-line prefer-rest-params
        (stub.q = stub.q || []).push(arguments);
    };
    window.clarity = stub;
}

function injectTag() {
    if (injected || !PROJECT_ID) return;
    if (!granted) {
        scheduled = false;
        return;
    }
    /**
     * Checked again at injection time, not only at scheduling time: a deferred
     * load can be overtaken by a client side navigation into /admin or onto a
     * sensitive URL. If it was, the load is dropped; syncClarityRoute picks it
     * up again on the way back out of an excluded route, but never after the
     * sensitive latch has closed.
     */
    if (blockedHere()) {
        scheduled = false;
        return;
    }
    injected = true;
    installStub();
    clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(PROJECT_ID)}`;
    document.head.appendChild(script);
}

function load(defer: boolean) {
    if (scheduled || stopped || !granted) return;
    if (blockedHere()) return;
    scheduled = true;

    if (!defer) {
        injectTag();
        return;
    }

    /** Same load plus idle deferral as GA4; see the long note in analytics.ts. */
    const whenIdle = () => {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(injectTag, { timeout: 2000 });
        } else {
            window.setTimeout(injectTag, 1000);
        }
    };
    if (document.readyState === 'complete') {
        whenIdle();
    } else {
        window.addEventListener('load', whenIdle, { once: true });
    }
}

/** Page start. `consentGranted` is the stored choice from analytics.ts. */
export function initClarity(consentGranted: boolean) {
    if (!canRun() || !consentGranted) return;
    granted = true;
    load(true);
}

/** The visitor accepted in the banner. The page has loaded, so no deferral. */
export function grantClarity() {
    if (!canRun()) return;
    granted = true;
    load(false);
}

/**
 * The visitor declined. Mirrors GA4's `consent update` to denied. If the tag
 * was never loaded there is nothing to tell it and nothing is loaded now. If
 * it was, Clarity is told consent is denied and asked to erase its cookies,
 * which per Microsoft's Consent API v2 docs ends the session and prevents
 * further tracking until consent is granted again.
 */
export function revokeClarity() {
    if (!canRun()) return;
    granted = false;
    if (!injected) return;
    clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
    clarity('consent', false);
}

/**
 * Called on every route change, through trackPageview() in analytics.ts, from
 * src/components/Head.tsx. `path` is the unredacted pathname plus search.
 *
 * Entering /admin after Clarity has loaded sends `stop`, which halts every
 * recording module. It is not restarted on the way back out: the only people
 * who reach /admin are organisers, and a full page load starts a fresh,
 * correctly gated session. AdminShell also carries data-clarity-mask, so even
 * the few milliseconds between navigation and this effect are masked.
 *
 * Leaving /admin when Clarity never loaded (the visitor landed on /admin with
 * consent stored) loads it now, so the public pages are measured as normal.
 */
export function syncClarityRoute(path: string) {
    if (!canRun()) return;
    const url = new URL(path, 'https://ifn.invalid');
    /**
     * A sensitive URL (latching) is handled exactly like entry to /admin:
     * stop if running, never load. Both the router's path and the address bar
     * are checked, because either can carry the parameter.
     */
    const latched = latchIfSensitive(url.search, url.hash) || blockedHere();
    if (latched || isClarityExcludedLocation(url.pathname, url.search)) {
        stopIfRunning();
        return;
    }
    load(false);
}
