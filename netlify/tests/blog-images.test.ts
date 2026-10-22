import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import {
    checkImageSets,
    imageSetPaths,
    missingImageFiles,
} from '../../scripts/lib/blogImages.mjs';

const ROOT = resolve(__dirname, '../..');
const PUBLIC_DIR = join(ROOT, 'public');
const ALT = 'Diagram: three tracks.';

/** A fake filesystem holding exactly these site paths under /pub. */
function fsWith(...sitePaths: string[]) {
    const present = new Set(sitePaths.map((p) => join('/pub', p)));
    return (path: string) => present.has(path);
}

describe('blog image gate (openspec/changes/blog-brand-images)', () => {
    const full = Object.values(imageSetPaths('a'));

    it('names the four files of a set by convention', () => {
        expect(imageSetPaths('a')).toEqual({
            hero: '/blog/a-hero.webp',
            hero800: '/blog/a-hero-800.webp',
            thumb: '/blog/a-thumb.webp',
            og: '/blog/a-og.png',
        });
    });

    it('passes a public post with a complete set and alt text', () => {
        const result = checkImageSets([{ slug: 'a', isPublic: true, imageAlt: ALT }], '/pub', fsWith(...full));
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
        expect(result.readiness.get('a')).toEqual({ ready: true, missing: [] });
    });

    it('fails a public post missing its hero, naming slug, file and command', () => {
        const exists = fsWith('/blog/a-hero-800.webp', '/blog/a-thumb.webp', '/blog/a-og.png');
        const { errors, readiness } = checkImageSets([{ slug: 'a', isPublic: true, imageAlt: ALT }], '/pub', exists);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('"a"');
        expect(errors[0]).toContain('public/blog/a-hero.webp');
        expect(errors[0]).toContain('node scripts/build-blog-og-images.mjs a');
        expect(readiness.get('a')).toEqual({ ready: false, missing: ['public/blog/a-hero.webp'] });
    });

    it('fails a public post missing its OG image', () => {
        const exists = fsWith('/blog/a-hero.webp', '/blog/a-hero-800.webp', '/blog/a-thumb.webp');
        const { errors } = checkImageSets([{ slug: 'a', isPublic: true, imageAlt: ALT }], '/pub', exists);
        expect(errors[0]).toContain('public/blog/a-og.png');
    });

    it('fails a public post with files but no imageAlt, and says to add it', () => {
        const { errors } = checkImageSets([{ slug: 'a', isPublic: true, imageAlt: '' }], '/pub', fsWith(...full));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('imageAlt');
        expect(errors[0]).not.toContain('build-blog-og-images');
    });

    it('only warns for a post that is not public', () => {
        const { errors, warnings, readiness } = checkImageSets(
            [{ slug: 'a', isPublic: false, imageAlt: ALT }],
            '/pub',
            fsWith(),
        );
        expect(errors).toEqual([]);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('node scripts/build-blog-og-images.mjs a');
        expect(readiness.get('a')?.ready).toBe(false);
        expect(readiness.get('a')?.missing).toHaveLength(4);
    });
});

describe('committed blog image sets', () => {
    const slugs = readdirSync(join(ROOT, 'content/blog'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''));
    const manifest = JSON.parse(readFileSync(join(ROOT, 'scripts/blog-og-manifest.json'), 'utf8')) as {
        slug: string;
    }[];

    it.each(slugs)('%s has a manifest entry, a complete image set and imageAlt', (slug) => {
        expect(manifest.some((entry) => entry.slug === slug)).toBe(true);
        expect(missingImageFiles(slug, PUBLIC_DIR)).toEqual([]);
        const { data } = matter(readFileSync(join(ROOT, 'content/blog', `${slug}.md`), 'utf8'));
        expect(typeof data.imageAlt).toBe('string');
        expect(data.imageAlt.trim()).not.toBe('');
        expect(data.imageAlt).not.toMatch(/[–—]/);
        expect(data.ogImage).toBe(imageSetPaths(slug).og);
    });
});
