import { describe, it, expect, beforeEach } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import { isAllowedEmail, createSessionCookie, getSessionEmail, SESSION_COOKIE_NAME } from './auth';

beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!';
    process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community, Other@Example.com';
});

function eventWithCookie(cookieHeader: string | undefined): HandlerEvent {
    return { headers: cookieHeader ? { cookie: cookieHeader } : {} } as unknown as HandlerEvent;
}

function cookieHeaderFromSetCookie(setCookie: string): string {
    // serialize() returns "name=value; HttpOnly; ..." — a request Cookie header only needs "name=value"
    return setCookie.split(';')[0];
}

describe('isAllowedEmail (see openspec/specs/admin-dashboard)', () => {
    it('matches an allowlisted email exactly', () => {
        expect(isAllowedEmail('admin@ifn.community')).toBe(true);
    });

    it('is case-insensitive and trims whitespace', () => {
        expect(isAllowedEmail('  OTHER@example.com  ')).toBe(true);
    });

    it('rejects an email not on the allowlist', () => {
        expect(isAllowedEmail('stranger@example.com')).toBe(false);
    });
});

describe('session cookie sign/verify roundtrip (see openspec/specs/admin-dashboard)', () => {
    it('accepts a valid session for an allowlisted email', async () => {
        const setCookie = await createSessionCookie('admin@ifn.community');
        const event = eventWithCookie(cookieHeaderFromSetCookie(setCookie));
        await expect(getSessionEmail(event)).resolves.toBe('admin@ifn.community');
    });

    it('rejects when there is no session cookie', async () => {
        await expect(getSessionEmail(eventWithCookie(undefined))).resolves.toBeNull();
    });

    it('rejects a tampered session token', async () => {
        const setCookie = await createSessionCookie('admin@ifn.community');
        const tampered = cookieHeaderFromSetCookie(setCookie).replace(`${SESSION_COOKIE_NAME}=`, `${SESSION_COOKIE_NAME}=x`);
        await expect(getSessionEmail(eventWithCookie(tampered))).resolves.toBeNull();
    });

    it('revokes a live session when the email is removed from the allowlist', async () => {
        const setCookie = await createSessionCookie('admin@ifn.community');
        const cookieHeader = cookieHeaderFromSetCookie(setCookie);

        // Session is valid immediately after issuance...
        await expect(getSessionEmail(eventWithCookie(cookieHeader))).resolves.toBe('admin@ifn.community');

        // ...but the same signed token is rejected the moment the allowlist changes,
        // proving authorization is re-checked per-request, not cached from login time.
        process.env.ADMIN_ALLOWED_EMAILS = 'someone-else@ifn.community';
        await expect(getSessionEmail(eventWithCookie(cookieHeader))).resolves.toBeNull();
    });
});
