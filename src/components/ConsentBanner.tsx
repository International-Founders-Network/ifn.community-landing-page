import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import {
    isAnalyticsEnabled,
    setConsent,
    storedConsent,
} from '../lib/analytics';

/**
 * THE ANALYTICS CONSENT BANNER.
 *
 * Required because the site uses GA4, which writes first-party cookies. Under
 * GDPR and ePrivacy, analytics cookies need consent before they are set; under
 * CCPA/CPRA they need disclosure and an opt-out. IFN's audience is Austin-based
 * but explicitly international, so assuming no European visitor would be a poor
 * bet for a community whose whole proposition is that its members came from
 * somewhere else.
 *
 * WHY THE PAGE IS NOT BLOCKED AND WHY THERE IS NO "REJECT" DARK PATTERN.
 * Google Consent Mode v2 is initialised with `analytics_storage: 'denied'`
 * before gtag.js loads (see src/lib/analytics.ts), so the lawful default is
 * already in force when this banner appears. GA4 sends cookieless pings in that
 * state: IFN still gets aggregate pageview and event counts, and no identifier
 * is stored on the visitor's device. Consent therefore buys returning-visitor
 * and session accuracy, not the difference between data and no data — which is
 * exactly why the two buttons are given equal visual weight and why dismissing
 * the banner is a real, honest "no" rather than a deferral that re-asks on the
 * next page. A banner that nags, pre-ticks, or makes refusal harder than
 * acceptance is non-compliant in the EU regardless of what it claims.
 *
 * Advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) are
 * denied permanently and are not on offer here, because the site runs no ads.
 */
export function ConsentBanner() {
    /**
     * THE CLIENT-ONLY GUARD, AND WHY IT IS NOT A LAZY useState ANY MORE.
     *
     * This used to read localStorage in a lazy `useState` initialiser, which was
     * safe only because src/main.tsx used `createRoot` and threw the prerendered
     * markup away. It now uses `hydrateRoot`, so the first client render must
     * match the HTML that scripts/prerender.mjs produced — and that HTML never
     * contains this banner, because the prerender strips it.
     *
     * `useSyncExternalStore` is the sanctioned way to express "this value only
     * exists on the client": the third argument is the server snapshot, so the
     * hydrating render sees `false` and agrees with the markup, and the store
     * re-reads as `true` immediately afterwards. `subscribe` returns a no-op
     * unsubscribe because the value never changes after mount.
     */
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const [dismissed, setDismissed] = useState(false);

    const visible =
        isClient && !dismissed && isAnalyticsEnabled && storedConsent() === null;

    if (!visible) return null;

    const decide = (choice: 'granted' | 'denied') => {
        setConsent(choice);
        setDismissed(true);
    };

    return (
        <div
            /**
             * `role="region"` with a label, not `role="dialog"`. A dialog would
             * imply a focus trap and an expectation that the page behind it is
             * inert; this banner deliberately does neither, because trapping a
             * reader in a cookie notice before they have seen a word of the
             * page is the pattern regulators single out.
             */
            role="region"
            aria-label="Analytics consent"
            className="fixed inset-x-0 bottom-0 z-[90] border-t border-rule bg-paper px-4 py-4 sm:px-6"
        >
            <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-muted">
                    We use Google Analytics to count visits and understand which
                    pages are useful. Nothing you type into a form is ever sent
                    to it. You can say no and the site works exactly the same.{' '}
                    <Link
                        to="/privacy-policy"
                        className="font-medium text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                        Privacy policy
                    </Link>
                    .
                </p>

                <div className="flex shrink-0 gap-3">
                    {/* Equal weight, by construction: same padding, same border,
                        same type scale. Only the fill differs, and neither
                        reads as the "safe" choice. */}
                    <button
                        type="button"
                        onClick={() => decide('denied')}
                        className="rounded-lg border border-rule px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                        No thanks
                    </button>
                    <button
                        type="button"
                        onClick={() => decide('granted')}
                        className="rounded-lg border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                        Allow analytics
                    </button>
                </div>
            </div>
        </div>
    );
}
