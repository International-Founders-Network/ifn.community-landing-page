import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

/**
 * public/_headers covers static files only; Netlify does not apply it to
 * function responses. Every API response sets these itself.
 */
export const API_SECURITY_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
};

export function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): HandlerResponse {
    return { statusCode, headers: { ...API_SECURITY_HEADERS, ...headers }, body: JSON.stringify(body) };
}

export function header(event: HandlerEvent, name: string): string | undefined {
    const headers = event.headers || {};
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === lower) return value ?? undefined;
    }
    return undefined;
}

/**
 * CSRF guard for cookie-authenticated writes. The session cookie is already
 * SameSite=Strict; on top of that a write must be JSON (a cross-site <form>
 * cannot send application/json, and a cross-site fetch that does triggers a
 * CORS preflight this API never answers) and, when the browser sends an Origin,
 * it must be this host. Returns an error response, or null to proceed.
 */
export function rejectCrossSiteWrite(event: HandlerEvent): HandlerResponse | null {
    const contentType = header(event, 'content-type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
        return json(415, { error: 'Requests must be sent as application/json.' });
    }

    const origin = header(event, 'origin');
    if (origin) {
        const host = header(event, 'host');
        let originHost: string | null = null;
        try {
            originHost = new URL(origin).host;
        } catch {
            originHost = null;
        }
        if (!host || originHost !== host) {
            return json(403, { error: 'Cross-origin request refused.' });
        }
    }
    return null;
}
