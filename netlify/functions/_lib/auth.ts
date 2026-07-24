import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import type { HandlerEvent } from '@netlify/functions';

export const SESSION_COOKIE_NAME = 'ifn_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function getSessionSecret(): Uint8Array {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
        throw new Error('ADMIN_SESSION_SECRET is not configured');
    }
    return new TextEncoder().encode(secret);
}

function isLocalDev(): boolean {
    return process.env.NETLIFY_DEV === 'true' || process.env.CONTEXT === 'dev';
}

export function isAllowedEmail(email: string): boolean {
    const allowed = (process.env.ADMIN_ALLOWED_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return allowed.includes(email.trim().toLowerCase());
}

export interface GoogleIdentity {
    email: string;
    name?: string;
    picture?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
    }

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

    return {
        email: payload.email,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    };
}

export async function createSessionCookie(email: string): Promise<string> {
    const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
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

/** Verifies the session cookie on an incoming request and returns the authenticated admin's email, or null. */
export async function getSessionEmail(event: HandlerEvent): Promise<string | null> {
    const cookieHeader = event.headers.cookie || event.headers.Cookie;
    if (!cookieHeader) return null;

    const cookies = parseCookie(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getSessionSecret());
        const email = payload.email;
        if (typeof email !== 'string' || !isAllowedEmail(email)) return null;
        return email;
    } catch {
        return null;
    }
}
