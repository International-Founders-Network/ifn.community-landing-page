import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { header, json, rejectCrossSiteWrite } from './http';

/**
 * Admin auth for qr.ifn.community. Same scheme as the main site's
 * netlify/functions/_lib/auth.ts (Google Sign-In, ADMIN_ALLOWED_EMAILS,
 * an ADMIN_SESSION_SECRET-signed httpOnly cookie), copied rather than imported
 * because apps/qr must stay extractable into its own repo.
 *
 * Differences from the main site, on purpose:
 *   - Its own cookie name, and the session JWT carries an audience. A main-site
 *     session token is rejected here even if both sites share one secret.
 *   - Fail closed. If the secret, the allowlist or the Google client ID is
 *     missing, every admin check refuses with 503 instead of throwing.
 *   - requireAdmin() bundles the session check with the CSRF guard so a
 *     handler cannot forget one of them.
 */

export const SESSION_COOKIE_NAME = 'ifn_qr_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days; the allowlist is re-checked on every request
const SESSION_AUDIENCE = 'ifn-qr-admin';

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function isLocalDev(): boolean {
    return process.env.NETLIFY_DEV === 'true' || process.env.CONTEXT === 'dev';
}

function allowedEmails(): string[] {
    return (process.env.ADMIN_ALLOWED_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

/** Names of required env vars that are unset. Empty means admin auth can run. */
export function missingAuthConfig(): string[] {
    const missing: string[] = [];
    if (!process.env.ADMIN_SESSION_SECRET) missing.push('ADMIN_SESSION_SECRET');
    if (allowedEmails().length === 0) missing.push('ADMIN_ALLOWED_EMAILS');
    if (!process.env.VITE_GOOGLE_CLIENT_ID) missing.push('VITE_GOOGLE_CLIENT_ID');
    return missing;
}

export function authNotConfiguredResponse(): HandlerResponse {
    const missing = missingAuthConfig();
    console.error(`qr admin auth is not configured; missing: ${missing.join(', ')}`);
    return json(503, { error: 'Admin sign-in is not configured on this site.' });
}

function getSessionSecret(): Uint8Array {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
    return new TextEncoder().encode(secret);
}

export function isAllowedEmail(email: string): boolean {
    return allowedEmails().includes(email.trim().toLowerCase());
}

export interface GoogleIdentity {
    email: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');

    const { payload } = await jwtVerify(idToken, googleJwks, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: clientId,
    });

    if (!payload.email || typeof payload.email !== 'string') {
        throw new Error('Google token missing email');
    }
    if (payload.email_verified !== true) {
        throw new Error('Google email is not verified');
    }
    return { email: payload.email };
}

export async function createSessionCookie(email: string): Promise<string> {
    const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .setAudience(SESSION_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
        .sign(getSessionSecret());

    return serializeCookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: !isLocalDev(),
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
    });
}

export function clearSessionCookie(): string {
    return serializeCookie(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: !isLocalDev(),
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });
}

export type SessionState = { status: 'none' } | { status: 'forbidden'; email: string } | { status: 'ok'; email: string };

/** Reads and verifies the session cookie. Callers must check missingAuthConfig() first. */
export async function readSession(event: HandlerEvent): Promise<SessionState> {
    const cookieHeader = header(event, 'cookie');
    if (!cookieHeader) return { status: 'none' };

    const token = parseCookie(cookieHeader)[SESSION_COOKIE_NAME];
    if (!token) return { status: 'none' };

    try {
        const { payload } = await jwtVerify(token, getSessionSecret(), {
            algorithms: ['HS256'],
            audience: SESSION_AUDIENCE,
        });
        const email = payload.email;
        if (typeof email !== 'string') return { status: 'none' };
        if (!isAllowedEmail(email)) return { status: 'forbidden', email };
        return { status: 'ok', email };
    } catch {
        return { status: 'none' };
    }
}

export type AdminCheck = { ok: true; email: string } | { ok: false; response: HandlerResponse };

/**
 * The gate every short-link endpoint goes through. `write` adds the CSRF guard
 * and should be true for anything that is not a GET.
 */
export async function requireAdmin(event: HandlerEvent, { write }: { write: boolean }): Promise<AdminCheck> {
    if (missingAuthConfig().length > 0) return { ok: false, response: authNotConfiguredResponse() };

    if (write) {
        const csrf = rejectCrossSiteWrite(event);
        if (csrf) return { ok: false, response: csrf };
    }

    const session = await readSession(event);
    if (session.status === 'none') {
        return { ok: false, response: json(401, { error: 'Sign in with an authorized IFN Google account first.' }) };
    }
    if (session.status === 'forbidden') {
        return { ok: false, response: json(403, { error: 'This account is not authorized to manage short links.' }) };
    }
    return { ok: true, email: session.email };
}
