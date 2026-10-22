import { describe, expect, it, vi } from 'vitest';

/**
 * The real blog.generated.ts only holds posts that are public at compile time,
 * and the Week 1 posts go live through the Neon overlay at Netlify build, so
 * the fixture stands in for "a published post with ogImage set".
 */
vi.mock('./blog.generated', () => {
    const posts = [
        {
            slug: 'forming-a-us-company-from-abroad',
            title: 'Forming a US company from abroad: what peers actually sequence',
            description: 'desc',
            excerpt: 'desc',
            date: '2026-09-29',
            updated: null,
            tags: [],
            ogImage: '/blog/forming-a-us-company-from-abroad-og.png',
            image: {
                hero: '/blog/forming-a-us-company-from-abroad-hero.webp',
                hero800: '/blog/forming-a-us-company-from-abroad-hero-800.webp',
                thumb: '/blog/forming-a-us-company-from-abroad-thumb.webp',
                alt: 'Diagram: three separate tracks.',
            },
            html: '',
        },
        {
            slug: 'welcome-to-the-ifn-blog',
            title: 'Welcome to the IFN blog',
            description: 'desc',
            excerpt: 'desc',
            date: '2026-09-26',
            updated: null,
            tags: [],
            ogImage: '/blog/welcome-to-the-ifn-blog-og.png',
            image: {
                hero: '/blog/welcome-to-the-ifn-blog-hero.webp',
                hero800: '/blog/welcome-to-the-ifn-blog-hero-800.webp',
                thumb: '/blog/welcome-to-the-ifn-blog-thumb.webp',
                alt: 'Diagram: five note sheets.',
            },
            html: '',
        },
    ];
    return {
        BLOG_POSTS: posts,
        getPostBySlug: (slug: string) => posts.find((post) => post.slug === slug),
    };
});

const { absoluteUrl, seoFor } = await import('./seo');
const { blogPostingSchema } = await import('./structuredData');

describe('per-post share images', () => {
    it('carries a published post’s ogImage as an article route image', () => {
        const seo = seoFor('/blog/forming-a-us-company-from-abroad');
        expect(seo.image).toBe('/blog/forming-a-us-company-from-abroad-og.png');
        expect(seo.imageAlt).toContain('Forming a US company from abroad');
        expect(seo.imageAlt).toContain('Diagram: three separate tracks.');
        expect(seo.ogType).toBe('article');
        expect(absoluteUrl(seo.image!)).toBe(
            'https://ifn.community/blog/forming-a-us-company-from-abroad-og.png',
        );
    });

    it('gives every post its own image and leaves static routes on the default', () => {
        expect(seoFor('/blog/welcome-to-the-ifn-blog').image).toBe('/blog/welcome-to-the-ifn-blog-og.png');
        expect(seoFor('/membership').image).toBeUndefined();
        expect(seoFor('/membership').ogType).toBeUndefined();
    });

    it('passes absolute URLs through untouched', () => {
        expect(absoluteUrl('https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png');
    });

    it('puts the absolute OG image on every BlogPosting', () => {
        expect(blogPostingSchema('/blog/forming-a-us-company-from-abroad')?.image).toBe(
            'https://ifn.community/blog/forming-a-us-company-from-abroad-og.png',
        );
        expect(blogPostingSchema('/blog/welcome-to-the-ifn-blog')?.image).toBe(
            'https://ifn.community/blog/welcome-to-the-ifn-blog-og.png',
        );
    });
});
