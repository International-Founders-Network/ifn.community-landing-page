/**
 * Compiled post bodies for the Admin review drawer, drafts included
 * (openspec/changes/admin-ux-blog-links-review).
 *
 * Written by scripts/compile-blog.mjs. Kept apart from blogEditorial.ts so only
 * admin-blog bundles the HTML; blog-publish-due never needs it. Nothing under
 * src/ may import the JSON: it holds unpublished copy.
 */
import bodiesData from '../_data/blog-bodies.json';

export interface HeldLink {
    text: string;
    href: string;
    /** Normalised hostname that the gate matched, e.g. cooley.com. */
    host: string;
}

export interface PostBody {
    slug: string;
    title: string;
    description: string;
    date: string;
    /** Status and publishAt as they were when the build ran. */
    status: string;
    publishAt: string | null;
    /** Sanitized, gated HTML: exactly what that build would publish. */
    html: string;
    /** Anchors the outbound gate turned into plain text in `html`. */
    heldLinks: HeldLink[];
}

const bodies = (bodiesData as { posts: Record<string, PostBody> }).posts;

export function loadPostBody(slug: string): PostBody | undefined {
    return Object.hasOwn(bodies, slug) ? bodies[slug] : undefined;
}
