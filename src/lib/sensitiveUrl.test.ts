import { describe, expect, it } from 'vitest';
import { SENSITIVE_QUERY_PARAMS, hasSensitiveParams, redactSensitivePath } from './sensitiveUrl';

describe('hasSensitiveParams', () => {
    it('flags every listed name, case insensitive', () => {
        for (const name of SENSITIVE_QUERY_PARAMS) {
            expect(hasSensitiveParams(`?${name}=x`)).toBe(true);
            expect(hasSensitiveParams(`?a=1&${name.toUpperCase()}=x`)).toBe(true);
        }
    });

    it('checks a query shaped fragment', () => {
        expect(hasSensitiveParams('', '#access_token=abc&state=1')).toBe(true);
        expect(hasSensitiveParams('', '#pricing')).toBe(false);
    });

    it('ignores ordinary params and lookalike names', () => {
        expect(hasSensitiveParams('?checkout=success&utm_source=x&tab=join&intent=sponsor')).toBe(false);
        expect(hasSensitiveParams('?session=1&emails=0&keyword=x')).toBe(false);
        expect(hasSensitiveParams('')).toBe(false);
    });

    it('matches on the name, never the value', () => {
        expect(hasSensitiveParams('?q=session_id')).toBe(false);
    });
});

describe('redactSensitivePath', () => {
    it('removes sensitive params and keeps the rest in order', () => {
        expect(redactSensitivePath('/membership?checkout=success&session_id=cs_test_abc&utm_source=x')).toBe(
            '/membership?checkout=success&utm_source=x',
        );
        expect(redactSensitivePath('/?Email=a%40b.co')).toBe('/');
    });

    it('returns a clean path byte for byte', () => {
        const path = '/events?utm_campaign=a%20b+c#top';
        expect(redactSensitivePath(path)).toBe(path);
    });

    it('drops a fragment that carries a token', () => {
        expect(redactSensitivePath('/x?a=1#access_token=abc')).toBe('/x?a=1');
    });
});
