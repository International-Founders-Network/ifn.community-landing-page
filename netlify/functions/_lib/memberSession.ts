import { SignJWT, jwtVerify } from 'jose';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import type { HandlerEvent } from '@netlify/functions';

/**
 * MEMBER SESSION: signature only. This file answers exactly one question,
 * "which email does this browser hold a signed session for", and it must never
 * grow a second one. Entitlement ("has this person paid") lives in
 * `./memberEntitlement.ts` and is re-checked per request.
 *
 * WHY A SECOND COOKIE RATHER THAN REUSING ifn_admin_session:
 *
 *   1. The admin cookie's verification path is `getSessionEmail` in
 *      `./auth.ts`, and that function ends with `isAllowedEmail(email)`. Any
 *      member session carried in that cookie either fails that check or forces
 *      the check to be loosened, and loosening it would grant dashboard access
 *      to every paying member. The two cookies keep the two questions apart:
 *      "is this an IFN operator" and "has this person paid".
 *
 *   2. Revoking one should not revoke the other. Rotating the admin secret
 *      after a laptop is lost should not sign out 40 members mid-download.
 *
 *   3. The lifetimes differ. See SESSION_TTL_SECONDS below.
 *
 * The plumbing in `./auth.ts` (HS256 sign, jwtVerify, httpOnly + secure +
 * sameSite cookie) is the model this file copies. The ALLOWLIST is not, and
 * `isAllowedEmail` is deliberately not imported here.
 */

/** The member session cookie. Deliberately not `ifn_admin_session`. */
export const MEMBER_SESSION_COOKIE_NAME = 'ifn_member_session';

/**
 * 30 days, against the admin session's 7.
 *
 * The admin cookie is short because it is the only thing between a stolen
 * laptop and the submissions dashboard: there, session age IS the access
 * control. Here it is not. A member session grants nothing on its own; every
 * gated endpoint calls `isMemberEntitled` again on the request, so a session
 * belonging to someone who cancelled three weeks ago returns 403 rather than a
 * PDF no matter how fresh the cookie is. That decoupling is what makes a long
 * TTL safe, and a short one would only mean re-authenticating to open a guide
 * already paid for.
 */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getMemberSessionSecret(): Uint8Array {
    const secret = process.env.MEMBER_SESSION_SECRET;
    if (!secret) {
        // Not ADMIN_SESSION_SECRET, and no fallback to it. A shared secret would
        // make one rotation revoke both sessions, and would let a token minted
        // for one audience verify against the other.
        throw new Error('MEMBER_SESSION_SECRET is not configured');
    }
    return new TextEncoder().encode(secret);
}

function isLocalDev(): boolean {
    return process.env.NETLIFY_DEV === 'true' || process.env.CONTEXT === 'dev';
}

export interface MemberSession {
    email: string;
    /**
     * True when the session was minted by `member-auth-stub`, the preview-only
     * door. Gated endpoints refuse these outright, so a deploy preview can show
     * the entitled layout without ever being able to hand out a file.
     */
    stub: boolean;
}

export interface CreateMemberSessionOptions {
    /** Mint a preview session. Only `member-auth-stub` passes this. */
    stub?: boolean;
}

export async function createMemberSessionCookie(
    email: string,
    options: CreateMemberSessionOptions = {},
): Promise<string> {
    const token = await new SignJWT({ email, stub: options.stub === true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
        .sign(getMemberSessionSecret());

    return serializeCookie(MEMBER_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: !isLocalDev(),
        // `lax`, not `strict`: a member arriving from a link in a receipt email
        // or from the Stripe customer portal should land on /members already
        // recognised. The admin cookie can afford `strict` because nobody
        // deep-links into the dashboard.
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
    });
}

export function clearMemberSessionCookie(): string {
    return serializeCookie(MEMBER_SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: !isLocalDev(),
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
}

/**
 * Verifies the member session cookie and returns its claims, or null.
 *
 * SIGNATURE CHECK ONLY. No entitlement lookup, no allowlist, no database. A
 * caller that needs to know whether to hand over a file calls
 * `isMemberEntitled` as a separate step, on purpose: folding the two together
 * here would mean a cancelled member either stays signed in with access or gets
 * silently logged out, and both are wrong.
 */
export async function getMemberSession(event: HandlerEvent): Promise<MemberSession | null> {
    const cookieHeader = event.headers.cookie || event.headers.Cookie;
    if (!cookieHeader) return null;

    const cookies = parseCookie(cookieHeader);
    const token = cookies[MEMBER_SESSION_COOKIE_NAME];
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getMemberSessionSecret());
        const email = payload.email;
        if (typeof email !== 'string' || !email) return null;
        return { email, stub: payload.stub === true };
    } catch {
        return null;
    }
}

/** The email on a valid member session, or null. Signature only; see above. */
export async function getMemberSessionEmail(event: HandlerEvent): Promise<string | null> {
    const session = await getMemberSession(event);
    return session ? session.email : null;
}
