import { describe, it, expect } from 'vitest';
import {
    buildOutboundGate,
    isHeldHref,
    markdownToHtml,
    outboundHost,
} from '../../scripts/lib/outboundGate.mjs';

describe('outboundGate (openspec/changes/admin-ux-blog-links-review)', () => {
    it('normalises www and case', () => {
        expect(outboundHost('https://WWW.Cooley.com/path')).toBe('cooley.com');
        expect(outboundHost('/membership')).toBe('');
    });

    it('holds gated hosts until allowOutboundLink is true', () => {
        const gate = buildOutboundGate([
            { kind: 'potential', website: 'https://www.cooley.com/x', allowOutboundLink: false },
            { kind: 'partner', website: 'https://stationaustin.com', allowOutboundLink: true },
        ]);
        expect(isHeldHref('https://www.cooley.com/news', gate)).toBe(true);
        expect(isHeldHref('https://stationaustin.com/', gate)).toBe(false);
        expect(isHeldHref('https://www.irs.gov/ein', gate)).toBe(false);
    });

    it('unwraps held anchors but keeps link text and gov links', async () => {
        const gate = buildOutboundGate([
            {
                kind: 'potential',
                website: 'https://www.cooley.com/news/insight/2025/x',
                allowOutboundLink: false,
            },
        ]);
        const md =
            'See [Cooley note](https://www.cooley.com/news/insight/2025/x) and [IRS](https://www.irs.gov/ein).';
        const { html, held } = await markdownToHtml(md, gate);
        expect(html).toContain('Cooley note');
        expect(html).not.toContain('cooley.com');
        expect(html).toContain('href="https://www.irs.gov/ein"');
        expect(held).toHaveLength(1);
        expect(held[0].host).toBe('cooley.com');
    });

    it('keeps the anchor once the row is allowed', async () => {
        const gate = buildOutboundGate([
            {
                kind: 'potential',
                website: 'https://www.cooley.com/news/insight/2025/x',
                allowOutboundLink: true,
            },
        ]);
        const { html, held } = await markdownToHtml(
            'See [Cooley note](https://www.cooley.com/news/insight/2025/x).',
            gate
        );
        expect(html).toContain('href="https://www.cooley.com/news/insight/2025/x"');
        expect(held).toHaveLength(0);
    });
});
