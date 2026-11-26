/**
 * THE STRIPE CHECKOUT SESSION ID ON THE RETURN PAGE.
 *
 * Stripe sends the payer back to /membership?checkout=success&session_id=cs_...
 * (success_url in netlify/functions/checkout.ts). The id is the only thing
 * /api/checkout-status needs to hand back the members Slack invite, so it must
 * not sit in the address bar, where it would be copied into shared links,
 * history sync and any analytics or recording vendor reading the URL.
 *
 * The page reads it once, keeps it in sessionStorage (tab scoped, gone when the
 * tab closes) so a refresh can still verify, and strips it from the URL. The
 * `checkout` parameter stays, so the page renders the same state.
 */

const STORAGE_KEY = 'ifn-checkout-session-id';

type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;

/** sessionStorage, or null where touching it throws (Safari private mode, sandboxed frames). */
export function checkoutSessionStore(): SessionStore | null {
    try {
        return typeof window === 'undefined' ? null : window.sessionStorage;
    } catch {
        return null;
    }
}

/**
 * The session id to verify, or null. Only on `checkout=success`: the URL's id
 * when present (persisted on the way through), otherwise the one stored by an
 * earlier load of this tab, which is the refresh after stripping.
 */
export function resolveCheckoutSessionId(
    params: URLSearchParams,
    store: SessionStore | null,
): string | null {
    if (params.get('checkout') !== 'success') return null;
    const fromUrl = params.get('session_id');
    try {
        if (fromUrl) {
            store?.setItem(STORAGE_KEY, fromUrl);
            return fromUrl;
        }
        return store?.getItem(STORAGE_KEY) || null;
    } catch {
        return fromUrl || null;
    }
}

export function checkoutStatusUrl(sessionId: string): string {
    return `/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`;
}

type HistoryWindow = Pick<Window, 'location' | 'history'>;

/**
 * Removes session_id from the address bar, keeping every other parameter, the
 * hash, and `history.state`. Returns whether anything changed.
 *
 * `history.replaceState` rather than react-router's `navigate(..., { replace:
 * true })`, deliberately. A router navigation changes `location.search`, which
 * re-runs Head.tsx's effect and sends a SECOND GA4 page_view for the payment
 * page, double counting the one conversion the site most needs to count.
 * Passing the existing `history.state` through keeps react-router's own entry
 * key and index intact, so back, forward and later navigations behave exactly
 * as before; the router simply still holds the pre-strip search for this one
 * entry in memory, which nothing reads after the first render.
 */
export function stripCheckoutSessionId(win: HistoryWindow = window): boolean {
    const url = new URL(win.location.href);
    if (!url.searchParams.has('session_id')) return false;
    url.searchParams.delete('session_id');
    win.history.replaceState(win.history.state, '', url.pathname + url.search + url.hash);
    return true;
}
