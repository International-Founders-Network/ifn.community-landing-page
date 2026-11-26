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
 *
 * This module holds no consent storage of its own. analytics.ts reads the
 * stored choice and calls in; keeping the dependency one way avoids a circular
 * import between the two.
 */

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

/** The visitor has said yes, in this page's lifetime or a stored earlier one. */
let granted = false;
/** The script tag is in the document (or about to be, for a deferred load). */
let scheduled = false;
let injected = false;
/** clarity('stop') has been sent; recording stays off until the next full page load. */
let stopped = false;

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
     * load can be overtaken by a client side navigation into /admin. If it
     * was, the load is dropped and syncClarityRoute picks it up again on the
     * way back out.
     */
    if (isClarityExcludedPath(window.location.pathname)) {
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
    if (isClarityExcludedPath(window.location.pathname)) return;
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
 * Called on every route change from src/components/Head.tsx.
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
export function syncClarityRoute(pathname: string) {
    if (!canRun()) return;
    if (isClarityExcludedPath(pathname)) {
        if (injected && !stopped) {
            stopped = true;
            clarity('stop');
        }
        return;
    }
    load(false);
}
