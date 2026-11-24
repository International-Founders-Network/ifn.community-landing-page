import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import {
    checkImageSets,
    committedImageSetRequired,
    imageSetPaths,
    missingImageFiles,
    requiresImageSet,
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

    it('fails a scheduled post missing images even when it is not yet public', () => {
        const { errors, warnings } = checkImageSets(
            [{ slug: 'a', isPublic: false, requiresImageSet: true, imageAlt: ALT }],
            '/pub',
            fsWith(),
        );
        expect(warnings).toEqual([]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('"a"');
        expect(errors[0]).toContain('public/blog/a-hero.webp');
        expect(errors[0]).toContain('node scripts/build-blog-og-images.mjs a');
    });

    it('only warns for an in_review post when requiresImageSet is false', () => {
        const { errors, warnings } = checkImageSets(
            [{ slug: 'a', isPublic: false, requiresImageSet: false, imageAlt: ALT }],
            '/pub',
            fsWith(),
        );
        expect(errors).toEqual([]);
        expect(warnings).toHaveLength(1);
    });
});

describe('committedImageSetRequired', () => {
    it('enforces live posts and scheduled posts, including when only publishAt is set', () => {
        expect(requiresImageSet('live')).toBe(true);
        expect(requiresImageSet('scheduled')).toBe(true);
        expect(requiresImageSet('in_review')).toBe(false);
        expect(committedImageSetRequired({ status: 'live' })).toBe(true);
        expect(committedImageSetRequired({ status: 'scheduled', publishAt: '2026-12-01T09:00:00-06:00' })).toBe(true);
        expect(committedImageSetRequired({ status: 'approved', publishAt: '2026-12-01T09:00:00-06:00' })).toBe(true);
        expect(committedImageSetRequired({ draft: false })).toBe(true);
    });

    it('skips in_review and draft:true slugs, even if publishAt is present', () => {
        expect(committedImageSetRequired({ status: 'in_review', draft: true })).toBe(false);
        expect(committedImageSetRequired({ status: 'in_review', draft: true, publishAt: '2026-12-01T09:00:00-06:00' })).toBe(
            false,
        );
        expect(committedImageSetRequired({ status: 'draft' })).toBe(false);
        expect(committedImageSetRequired({ draft: true })).toBe(false);
        expect(committedImageSetRequired({ status: 'approved' })).toBe(false);
    });
});

describe('committed blog image sets', () => {
    const files = readdirSync(join(ROOT, 'content/blog')).filter((f) => f.endsWith('.md'));
    const posts = files.map((file) => {
        const slug = file.replace(/\.md$/, '');
        const { data } = matter(readFileSync(join(ROOT, 'content/blog', file), 'utf8'));
        return { slug, data, required: committedImageSetRequired(data) };
    });
    const required = posts.filter((post) => post.required);
    const skipped = posts.filter((post) => !post.required);
    const manifest = JSON.parse(readFileSync(join(ROOT, 'scripts/blog-og-manifest.json'), 'utf8')) as {
        slug: string;
    }[];

    it('splits the repo into live-or-scheduled posts and skipped drafts', () => {
        expect(required.length + skipped.length).toBe(posts.length);
        expect(required.length).toBeGreaterThan(0);
        expect(skipped.length).toBeGreaterThan(0);
    });

    it.each(required)('$slug (live or scheduled) has a manifest entry, a complete image set and imageAlt', (post) => {
        expect(manifest.some((entry) => entry.slug === post.slug)).toBe(true);
        expect(missingImageFiles(post.slug, PUBLIC_DIR)).toEqual([]);
        expect(typeof post.data.imageAlt).toBe('string');
        expect(String(post.data.imageAlt).trim()).not.toBe('');
        expect(String(post.data.imageAlt)).not.toMatch(/[–—]/);
        expect(post.data.ogImage).toBe(imageSetPaths(post.slug).og);
    });

    it.each(skipped)('$slug (in_review or draft) is not required to have an image set yet', (post) => {
        expect(post.required).toBe(false);
        const status = typeof post.data.status === 'string' ? post.data.status : '';
        expect(status === 'in_review' || status === 'draft' || post.data.draft === true).toBe(true);
    });
});
