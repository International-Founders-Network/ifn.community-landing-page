import { describe, it, expect } from 'vitest';
import {
    checkRedirectTarget,
    isAllowedRedirectHost,
    isAllowedRedirectTarget,
    MAX_TARGET_URL_LENGTH,
} from '../../src/lib/redirectAllowlist';

describe('redirect allowlist: allowed destinations', () => {
    it.each([
        'https://ifn.community',
        'https://ifn.community/events',
        'https://www.ifn.community/membership?ref=qr',
        'https://members.ifn.community/library',
        'https://lu.ma/IFN_ATX',
        'https://luma.com/ifn',
        'https://www.luma.com/event/abc',
        'https://www.meetup.com/austin-founders/events/123/',
        'https://meetup.com/x',
        'https://www.eventbrite.com/e/123',
        'https://eventbrite.com/e/123',
        'https://www.eventbrite.co.uk/e/123',
        'https://www.eventbrite.ca/e/123',
        'https://www.eventbrite.com.au/e/123',
        'https://IFN.Community/Events',
        'https://ifn.community:443/explicit-default-port',
    ])('allows %s', (url) => {
        expect(isAllowedRedirectTarget(url)).toBe(true);
    });

    it('returns the normalised URL', () => {
        expect(checkRedirectTarget('  https://IFN.community/a b ')).toEqual({ ok: true, url: 'https://ifn.community/a%20b' });
    });
});

describe('redirect allowlist: refused destinations', () => {
    it.each([
        ['plain http', 'http://ifn.community/events'],
        ['http subdomain', 'http://lu.ma/IFN_ATX'],
        ['unrelated host', 'https://evil.com'],
        ['allowed name as a label of an evil host', 'https://ifn.community.evil.com/'],
        ['allowed name as prefix without a dot', 'https://evilifn.community/'],
        ['luma lookalike', 'https://lu.ma.evil.com/'],
        ['luma suffix trick', 'https://notluma.com/'],
        ['meetup lookalike', 'https://meetup.com.evil.io/'],
        ['eventbrite lookalike', 'https://eventbrite.com.evil.net/'],
        ['eventbrite TLD not on the list', 'https://eventbrite.xyz/'],
        ['userinfo trick', 'https://ifn.community@evil.com/'],
        ['userinfo with password', 'https://ifn.community:pw@evil.com/'],
        ['credentials on an allowed host', 'https://user:pw@ifn.community/'],
        ['non-default port', 'https://ifn.community:8443/'],
        ['trailing-dot host', 'https://ifn.community./'],
        ['javascript: scheme', 'javascript:alert(1)'],
        ['data: scheme', 'data:text/html,hi'],
        ['protocol-relative', '//evil.com'],
        ['relative path', '/r/abc'],
        ['backslash trick', 'https://evil.com\\@ifn.community/'],
        ['empty', ''],
        ['not a string', 42],
        ['too long', `https://ifn.community/${'a'.repeat(MAX_TARGET_URL_LENGTH)}`],
    ])('refuses %s', (_label, value) => {
        expect(isAllowedRedirectTarget(value)).toBe(false);
    });

    it('matches hostnames exactly or on a dot boundary only', () => {
        expect(isAllowedRedirectHost('ifn.community')).toBe(true);
        expect(isAllowedRedirectHost('a.b.ifn.community')).toBe(true);
        expect(isAllowedRedirectHost('xifn.community')).toBe(false);
        expect(isAllowedRedirectHost('ifn.community.attacker.com')).toBe(false);
    });
});
