import { describe, it, expect, beforeEach } from 'vitest';
import type { HandlerEvent } from '@netlify/functions';
import {
    createMemberSessionCookie,
    clearMemberSessionCookie,
    getMemberSession,
    getMemberSessionEmail,
    MEMBER_SESSION_COOKIE_NAME,
} from '../functions/_lib/memberSession';
import { createSessionCookie, getSessionEmail, SESSION_COOKIE_NAME } from '../functions/_lib/auth';
import { isMemberEntitled } from '../functions/_lib/memberEntitlement';

beforeEach(() => {
    process.env.MEMBER_SESSION_SECRET = 'member-secret-at-least-32-bytes-ok!!';
    process.env.ADMIN_SESSION_SECRET = 'admin-secret-at-least-32-bytes-long!!';
    process.env.ADMIN_ALLOWED_EMAILS = 'admin@ifn.community';
    delete process.env.NETLIFY_DATABASE_URL;
});

function eventWithCookie(cookieHeader: string | undefined): HandlerEvent {
    return { headers: cookieHeader ? { cookie: cookieHeader } : {} } as unknown as HandlerEvent;
}

function cookieHeaderFromSetCookie(setCookie: string): string {
    return setCookie.split(';')[0];
}

describe('member session sign/verify roundtrip (see MEMBER-CENTER-IA.md)', () => {
    it('accepts a valid session for any email, with no allowlist involved', async () => {
        // The point of the whole file: this address is NOT in ADMIN_ALLOWED_EMAILS
        // and is still a valid member session.
        const setCookie = await createMemberSessionCookie('paying.member@example.com');
        const event = eventWithCookie(cookieHeaderFromSetCookie(setCookie));
        await expect(getMemberSessionEmail(event)).resolves.toBe('paying.member@example.com');
    });

    it('rejects when there is no member cookie', async () => {
        await expect(getMemberSessionEmail(eventWithCookie(undefined))).resolves.toBeNull();
    });

    it('rejects a tampered token', async () => {
        const setCookie = await createMemberSessionCookie('member@example.com');
        const tampered = cookieHeaderFromSetCookie(setCookie).replace(
            `${MEMBER_SESSION_COOKIE_NAME}=`,
            `${MEMBER_SESSION_COOKIE_NAME}=x`,
        );
        await expect(getMemberSessionEmail(eventWithCookie(tampered))).resolves.toBeNull();
    });

    it('marks a stub session so gated endpoints can refuse it', async () => {
        const real = await createMemberSessionCookie('member@example.com');
        const stub = await createMemberSessionCookie('member@example.com', { stub: true });

        await expect(
            getMemberSession(eventWithCookie(cookieHeaderFromSetCookie(real))),
        ).resolves.toEqual({ email: 'member@example.com', stub: false });
        await expect(
            getMemberSession(eventWithCookie(cookieHeaderFromSetCookie(stub))),
        ).resolves.toEqual({ email: 'member@example.com', stub: true });
    });

    it('clears the member cookie by expiring it', () => {
        const cleared = clearMemberSessionCookie();
        expect(cleared).toContain(`${MEMBER_SESSION_COOKIE_NAME}=`);
        expect(cleared).toContain('Max-Age=0');
    });
});

describe('member and admin sessions are separate (LOCK: never conflate the two)', () => {
    it('uses a different cookie name', async () => {
        const memberCookie = await createMemberSessionCookie('member@example.com');
        expect(memberCookie.startsWith(`${MEMBER_SESSION_COOKIE_NAME}=`)).toBe(true);
        expect(MEMBER_SESSION_COOKIE_NAME).not.toBe(SESSION_COOKIE_NAME);
    });

    it('does not let an admin session act as a member session, or the reverse', async () => {
        const adminHeader = cookieHeaderFromSetCookie(await createSessionCookie('admin@ifn.community'));
        const memberHeader = cookieHeaderFromSetCookie(await createMemberSessionCookie('admin@ifn.community'));

        // Each verifier only sees its own cookie name, so neither header carries
        // across. An operator signed into /admin is not thereby a member, and a
        // member is never thereby an operator.
        await expect(getMemberSessionEmail(eventWithCookie(adminHeader))).resolves.toBeNull();
        await expect(getSessionEmail(eventWithCookie(memberHeader))).resolves.toBeNull();
    });

    it('rotating the member secret does not touch a live admin session', async () => {
        const adminHeader = cookieHeaderFromSetCookie(await createSessionCookie('admin@ifn.community'));
        const memberHeader = cookieHeaderFromSetCookie(await createMemberSessionCookie('m@example.com'));

        process.env.MEMBER_SESSION_SECRET = 'a-completely-different-member-secret!!';

        await expect(getMemberSessionEmail(eventWithCookie(memberHeader))).resolves.toBeNull();
        await expect(getSessionEmail(eventWithCookie(adminHeader))).resolves.toBe('admin@ifn.community');
    });

    it('refuses to sign a member session with the admin secret', async () => {
        delete process.env.MEMBER_SESSION_SECRET;
        await expect(createMemberSessionCookie('member@example.com')).rejects.toThrow(
            /MEMBER_SESSION_SECRET/,
        );
    });
});

describe('entitlement fails closed (see netlify/functions/_lib/memberEntitlement.ts)', () => {
    it('reports database_not_configured rather than guessing', async () => {
        await expect(isMemberEntitled('member@example.com')).resolves.toEqual({
            entitled: false,
            reason: 'database_not_configured',
        });
    });

    it('rejects an empty email before touching anything', async () => {
        process.env.NETLIFY_DATABASE_URL = 'postgres://unused';
        await expect(isMemberEntitled('   ')).resolves.toEqual({
            entitled: false,
            reason: 'no_email',
        });
    });
});
