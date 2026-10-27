import { describe, it, expect } from 'vitest';
import { resolveSlackInvite, parseInviteExpiry } from '../functions/_lib/slackInvite';

// A placeholder that can never resolve. No real invite link belongs in this repo.
const URL_OK = 'https://example.invalid/slack-invite';
const BEFORE = new Date('2026-11-01T12:00:00Z');

describe('resolveSlackInvite', () => {
    it('returns the URL when it is https and the expiry is in the future', () => {
        expect(
            resolveSlackInvite(
                { SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: '2026-11-25' },
                BEFORE,
            ),
        ).toEqual({ url: URL_OK });
    });

    it('accepts a full ISO timestamp with a zone', () => {
        expect(
            resolveSlackInvite(
                { SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: '2026-11-25T06:00:00Z' },
                BEFORE,
            ),
        ).toEqual({ url: URL_OK });
    });

    it('returns null when the URL is missing', () => {
        expect(resolveSlackInvite({ SLACK_INVITE_EXPIRES_AT: '2026-11-25' }, BEFORE)).toEqual({
            url: null,
        });
    });

    it('returns null when the URL is blank', () => {
        expect(
            resolveSlackInvite({ SLACK_INVITE_URL: '   ', SLACK_INVITE_EXPIRES_AT: '2026-11-25' }, BEFORE),
        ).toEqual({ url: null });
    });

    it('returns null for a URL that is not https', () => {
        for (const bad of ['http://example.invalid/slack-invite', 'javascript:alert(1)', 'not a url']) {
            expect(
                resolveSlackInvite({ SLACK_INVITE_URL: bad, SLACK_INVITE_EXPIRES_AT: '2026-11-25' }, BEFORE),
                bad,
            ).toEqual({ url: null });
        }
    });

    it('returns null when the expiry is missing', () => {
        expect(resolveSlackInvite({ SLACK_INVITE_URL: URL_OK }, BEFORE)).toEqual({ url: null });
        expect(
            resolveSlackInvite({ SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: ' ' }, BEFORE),
        ).toEqual({ url: null });
    });

    it('returns null when the expiry cannot be parsed', () => {
        for (const bad of ['soon', '25/11/2026', '2026-11-25T00:00:00', '2026-13-45']) {
            expect(
                resolveSlackInvite({ SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: bad }, BEFORE),
                bad,
            ).toEqual({ url: null });
        }
    });

    it('returns null at exactly the expiry instant', () => {
        const env = { SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: '2026-11-25T06:00:00Z' };
        expect(resolveSlackInvite(env, new Date('2026-11-25T06:00:00Z'))).toEqual({ url: null });
    });

    it('returns null after the expiry', () => {
        const env = { SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: '2026-11-25' };
        expect(resolveSlackInvite(env, new Date('2026-12-01T00:00:00Z'))).toEqual({ url: null });
    });

    it('reads a date-only expiry as the start of that day in Central standard time', () => {
        const env = { SLACK_INVITE_URL: URL_OK, SLACK_INVITE_EXPIRES_AT: '2026-11-25' };
        // 2026-11-25T00:00:00-06:00 is 06:00Z.
        expect(parseInviteExpiry('2026-11-25')).toBe(Date.parse('2026-11-25T06:00:00Z'));
        expect(resolveSlackInvite(env, new Date('2026-11-25T05:59:59.999Z'))).toEqual({ url: URL_OK });
        expect(resolveSlackInvite(env, new Date('2026-11-25T06:00:00Z'))).toEqual({ url: null });
        // Midnight UTC on the 25th is still the evening of the 24th in Austin.
        expect(resolveSlackInvite(env, new Date('2026-11-25T00:00:00Z'))).toEqual({ url: URL_OK });
    });
});
