/**
 * GOOGLE ANALYTICS 4.
 *
 * The site had no measurement of any kind: no vendor tag anywhere in the
 * bundle, Netlify Analytics not enabled on the account, and the only thing
 * resembling an event log was two `console.log` calls writing visitor email
 * addresses into ephemeral Netlify function logs. The question "how many people
 * visited, and how many of them joined" had no answer.
 *
 * Google Search Console, by contrast, IS already verified — via a DNS TXT
 * record on the apex (`google-site-verification=90MHOrfuYTGyBMQxF68DP-…`), not
 * via anything in this repo, which is why no file here mentions it. GSC covers
 * how people ARRIVE from search; GA4 covers what they do once they are here.
 * The two are complementary and linking them in the GA4 admin is worth doing.
 *
 * DESIGN CONSTRAINTS THIS FILE HONOURS:
 *
 *   1. NO TAG WITHOUT CONSENT. GA4 writes first-party cookies, so it loads
 *      behind Google Consent Mode v2 with storage denied by default. Until a
 *      visitor accepts, GA4 sends cookieless pings: aggregate counts still
 *      arrive, no identifier is stored, and no consent banner is required for
 *      that state to be lawful. Accepting upgrades the same session in place.
 *
 *   2. NO TAG WITHOUT AN ID. If VITE_GA4_MEASUREMENT_ID is unset the whole
 *      module is inert — no script injected, no globals touched, every export a
 *      no-op. That keeps local dev and preview deploys out of the production
 *      property without anybody having to remember to disable anything.
 *
 *   3. MANUAL PAGEVIEWS. `send_page_view: false` is set at config time. GA4's
 *      automatic pageview fires once, on script load, and never again — in a
 *      single-page app that means one recorded pageview per SESSION, with every
 *      subsequent route change attributed to the landing URL. Pageviews are
 *      sent explicitly from src/components/Head.tsx instead, after the title
 *      has been updated for the new route.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as
    | string
    | undefined;

/**
 * `gtag.js` communicates through two globals it expects to already exist.
 * Declaring them is not optional here: tsconfig.app.json sets `strict: true`
 * and CI runs `tsc -b`, so touching `window.gtag` without this fails the build
 * with TS2339. src/pages/Admin.tsx already establishes this pattern for the
 * Google Identity library, which also proves `declare global` survives the
 * `erasableSyntaxOnly` setting in this project's tsconfig.
 */
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

const CONSENT_STORAGE_KEY = 'ifn-analytics-consent';

export type ConsentChoice = 'granted' | 'denied';

/** Whether analytics is configured at all. Everything below short-circuits on this. */
export const isAnalyticsEnabled = Boolean(MEASUREMENT_ID);

/**
 * The visitor's stored choice, or null if they have not made one.
 * Wrapped because Safari in private browsing throws on localStorage access
 * rather than returning null — the same reason the theme bootstrap in
 * index.html is wrapped.
 */
export function storedConsent(): ConsentChoice | null {
    try {
        const value = localStorage.getItem(CONSENT_STORAGE_KEY);
        return value === 'granted' || value === 'denied' ? value : null;
    } catch {
        return null;
    }
}

function persistConsent(choice: ConsentChoice) {
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
        /* Storage unavailable. The choice holds for this page view only. */
    }
}

function gtag(...args: unknown[]) {
    /**
     * Pushing `arguments`-shaped entries onto dataLayer is gtag.js's documented
     * contract, and it works before the script has loaded — queued calls replay
     * on arrival. That is why config and consent can be set synchronously here
     * without waiting for the network.
     */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
}

let initialised = false;

/**
 * Inject gtag.js and set the initial consent state. Safe to call more than
 * once; only the first call does anything.
 *
 * Called from src/main.tsx before the app mounts, so that the consent defaults
 * are registered before any event can be queued.
 */
export function initAnalytics() {
    if (!MEASUREMENT_ID || initialised) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    /**
     * Never measure the prerender. scripts/prerender.mjs drives a real Chrome
     * over the built site, so without this guard every production build would
     * fire a pageview for all eleven routes from a data-centre IP and pollute
     * the property with phantom traffic on every deploy.
     */
    if (navigator.webdriver) return;

    initialised = true;

    const consent = storedConsent();

    /**
     * Consent Mode v2 defaults, set BEFORE the config command and before the
     * script tag, which is the order Google's documentation requires — defaults
     * registered after the first config are not applied retroactively.
     *
     * `ad_storage`, `ad_user_data` and `ad_personalization` are denied
     * unconditionally and are never upgraded, because this site runs no ads and
     * has no reason to build advertising profiles of its visitors. Only
     * `analytics_storage` is subject to the visitor's choice.
     */
    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: consent === 'granted' ? 'granted' : 'denied',
        wait_for_update: 500,
    });

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
        send_page_view: false,
        /** Truncate the referrer and drop the query from the reported page path's
         *  sensitive parts is not needed here, but IP anonymisation is implicit
         *  in GA4 and stated for the reader's benefit rather than configured. */
        anonymize_ip: true,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
}

/**
 * Record the visitor's decision and update the live GA4 instance in place.
 * No page reload is needed: Consent Mode is designed to be updated mid-session.
 */
export function setConsent(choice: ConsentChoice) {
    persistConsent(choice);
    if (!MEASUREMENT_ID) return;
    gtag('consent', 'update', {
        analytics_storage: choice === 'granted' ? 'granted' : 'denied',
    });
}

/**
 * A single-page-app pageview.
 *
 * `path` must already include the query string, so that UTM parameters reach
 * GA4 — campaign attribution is derived from them, and dropping them makes
 * every campaign IFN ever runs look like direct traffic.
 */
export function trackPageview(path: string, title: string) {
    if (!MEASUREMENT_ID) return;
    gtag('event', 'page_view', {
        page_path: path,
        page_location: `${window.location.origin}${path}`,
        page_title: title,
    });
}

/**
 * The conversions worth counting.
 *
 * Named as a closed union rather than accepting free strings, because GA4's
 * reporting is only as good as the consistency of its event names and a typo
 * produces a silently separate event that nobody notices for a quarter.
 *
 * These correspond to the four success states the app already reaches and has
 * never reported:
 *   join_submit     — JoinModal reaches step 'success'
 *   contact_submit  — Contact form sets isSuccess
 *   event_signup    — Events page sets status 'success'
 *   membership_intent — the /membership call to action is followed
 *   luma_click      — an outbound click to the Luma calendar, the real
 *                     top-of-funnel action the site cannot otherwise see
 */
export type ConversionEvent =
    | 'join_submit'
    | 'contact_submit'
    | 'event_signup'
    | 'membership_intent'
    | 'luma_click';

export function trackEvent(
    name: ConversionEvent,
    params: Record<string, string | number | boolean> = {},
) {
    if (!MEASUREMENT_ID) return;
    gtag('event', name, params);
}
