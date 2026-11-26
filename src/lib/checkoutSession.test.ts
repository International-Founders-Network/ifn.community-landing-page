import { describe, expect, it, vi } from 'vitest';
import {
    checkoutStatusUrl,
    resolveCheckoutSessionId,
    stripCheckoutSessionId,
} from './checkoutSession';

/**
 * Membership.tsx is a thin caller of these three functions (resolve during
 * render, strip in an effect, fetch checkoutStatusUrl), so the redirect, strip
 * and refresh sequence is exercised here end to end with a fake tab: one
 * sessionStorage and one address bar shared across "page loads".
 */
function fakeTab(href: string) {
    const data: Record<string, string> = {};
    const store = {
        getItem: (k: string) => data[k] ?? null,
        setItem: (k: string, v: string) => {
            data[k] = v;
        },
    };
    const routerState = { usr: null, key: 'abc123', idx: 4 };
    const win = {
        location: { href },
        history: {
            state: routerState,
            replaceState: vi.fn((state: unknown, _title: string, url: string) => {
                win.location.href = new URL(url, win.location.href).href;
                win.history.state = state as typeof routerState;
            }),
        },
    };
    const params = () => new URL(win.location.href).searchParams;
    return { store, win, params, routerState };
}

describe('the Stripe return page', () => {
    it('reads the id, strips it from the URL, and still verifies with it', () => {
        const tab = fakeTab('https://ifn.community/membership?checkout=success&session_id=cs_test_abc&utm_source=x#top');

        const sessionId = resolveCheckoutSessionId(tab.params(), tab.store);
        expect(sessionId).toBe('cs_test_abc');

        expect(stripCheckoutSessionId(tab.win as unknown as Window)).toBe(true);
        expect(tab.win.location.href).toBe('https://ifn.community/membership?checkout=success&utm_source=x#top');
        // react-router's entry key and index survive the rewrite.
        expect(tab.win.history.replaceState).toHaveBeenCalledWith(
            tab.routerState,
            '',
            '/membership?checkout=success&utm_source=x#top',
        );

        expect(checkoutStatusUrl(sessionId!)).toBe('/api/checkout-status?session_id=cs_test_abc');
    });

    it('still verifies after a refresh of the stripped URL, from sessionStorage', () => {
        const tab = fakeTab('https://ifn.community/membership?checkout=success&session_id=cs_test_abc');
        resolveCheckoutSessionId(tab.params(), tab.store);
        stripCheckoutSessionId(tab.win as unknown as Window);

        // Refresh: same tab, same storage, URL now has no session_id.
        expect(tab.params().has('session_id')).toBe(false);
        const afterRefresh = resolveCheckoutSessionId(tab.params(), tab.store);
        expect(afterRefresh).toBe('cs_test_abc');
        expect(checkoutStatusUrl(afterRefresh!)).toBe('/api/checkout-status?session_id=cs_test_abc');
    });

    it('does nothing when there is no session_id to strip', () => {
        const tab = fakeTab('https://ifn.community/membership?checkout=cancelled');
        expect(stripCheckoutSessionId(tab.win as unknown as Window)).toBe(false);
        expect(tab.win.history.replaceState).not.toHaveBeenCalled();
    });

    it('only resolves an id on checkout=success', () => {
        const tab = fakeTab('https://ifn.community/membership?checkout=success&session_id=cs_test_abc');
        resolveCheckoutSessionId(tab.params(), tab.store);
        expect(resolveCheckoutSessionId(new URLSearchParams('checkout=cancelled'), tab.store)).toBeNull();
        expect(resolveCheckoutSessionId(new URLSearchParams(''), tab.store)).toBeNull();
    });

    it('returns null on a bare checkout=success with nothing stored', () => {
        expect(resolveCheckoutSessionId(new URLSearchParams('checkout=success'), fakeTab('https://x.test/').store)).toBeNull();
    });

    it('falls back to the URL id when storage throws', () => {
        const throwing = {
            getItem: () => {
                throw new Error('denied');
            },
            setItem: () => {
                throw new Error('denied');
            },
        };
        expect(resolveCheckoutSessionId(new URLSearchParams('checkout=success&session_id=cs_x'), throwing)).toBe('cs_x');
        expect(resolveCheckoutSessionId(new URLSearchParams('checkout=success'), throwing)).toBeNull();
        expect(resolveCheckoutSessionId(new URLSearchParams('checkout=success'), null)).toBeNull();
    });
});
