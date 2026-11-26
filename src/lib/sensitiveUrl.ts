/**
 * QUERY PARAMETERS THAT MUST NEVER REACH A THIRD PARTY ANALYTICS VENDOR.
 *
 * The one this site actually produces is `session_id`: Stripe returns the
 * payer to /membership?checkout=success&session_id=cs_... (success_url in
 * netlify/functions/checkout.ts), and that id is what /api/checkout-status
 * exchanges for the members Slack invite. The rest are the usual carriers of
 * credentials or personal data (OAuth and magic link redirects, Stripe's own
 * redirect parameters, email links) so that a future flow, or a crafted inbound
 * link, cannot put one in front of Clarity or GA4 either.
 *
 * Matching is on the parameter NAME, case insensitive, exact. Values are never
 * inspected.
 */
export const SENSITIVE_QUERY_PARAMS: readonly string[] = [
    'session_id',
    'checkout_session_id',
    'email',
    'token',
    'access_token',
    'id_token',
    'refresh_token',
    'credential',
    'code',
    'otp',
    'password',
    'secret',
    'client_secret',
    'key',
    'api_key',
    'invite',
    'payment_intent',
    'payment_intent_client_secret',
    'setup_intent',
    'setup_intent_client_secret',
];

const SENSITIVE = new Set(SENSITIVE_QUERY_PARAMS);

function isSensitiveName(name: string): boolean {
    return SENSITIVE.has(name.toLowerCase());
}

function paramsOf(part: string): URLSearchParams {
    return new URLSearchParams(part.replace(/^[?#]/, ''));
}

/**
 * True when the query string, or a fragment shaped like one (OAuth implicit
 * flows put tokens there), names any sensitive parameter.
 */
export function hasSensitiveParams(search: string, hash = ''): boolean {
    for (const part of [search, hash]) {
        if (!part) continue;
        for (const name of paramsOf(part).keys()) {
            if (isSensitiveName(name)) return true;
        }
    }
    return false;
}

/**
 * A root relative path (`/x?a=1#y`) with every sensitive query parameter
 * removed. Returned unchanged, byte for byte, when there is nothing to remove,
 * so ordinary UTM links are never re-encoded.
 */
export function redactSensitivePath(path: string): string {
    const url = new URL(path, 'https://ifn.invalid');
    const names = [...new Set(url.searchParams.keys())].filter(isSensitiveName);
    const hashSensitive = hasSensitiveParams('', url.hash);
    if (names.length === 0 && !hashSensitive) return path;
    for (const name of names) url.searchParams.delete(name);
    return url.pathname + url.search + (hashSensitive ? '' : url.hash);
}
