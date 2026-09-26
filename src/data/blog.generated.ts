/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by scripts/compile-blog.mjs from content/blog/*.md.
 * Regenerate with: node scripts/compile-blog.mjs
 *
 * Draft posts are excluded. Filename stem is the default slug.
 */

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    excerpt: string;
    /** Publish date YYYY-MM-DD (America/Chicago intent; store as ISO date). */
    date: string;
    updated: string | null;
    tags: string[];
    ogImage: string | null;
    /** Sanitized HTML from Markdown body. */
    html: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "welcome-to-the-ifn-blog",
        title: "Welcome to the IFN blog",
        description: "Peer notes from IFN meetups in Austin for international founders. Field notes you can read before you walk into the room.",
        excerpt: "Peer notes from IFN meetups in Austin for international founders. Field notes you can read before you walk into the room.",
        date: "2026-09-26",
        updated: null,
        tags: ["austin","landing","community"],
        ogImage: null,
        html: "<p>IFN runs a free monthly meetup in Austin for international and immigrant founders. The same questions show up every month: how people register a company in the United States, how they stay inside visa limits while they build, how they open a bank account, and how local funding conversations differ from the ones they had at home.</p>\n<p>This blog is where we write those conversations down. Not legal advice. Not a course. Peer experience from founders who are doing the work in Austin, so you can arrive at the next meetup with sharper questions.</p>\n<h2>What you will find here</h2>\n<ul>\n<li>Field notes from the room: what surprised people who just landed, and what they wish they had asked earlier.</li>\n<li>Orientation on visas, entity setup, banking, housing, hiring, and fundraising as an international founder, always as peer framing. When a topic needs counsel, we say so.</li>\n<li>Soft pointers to the next meetup, the optional membership (private member channel and members-only call), and the Resources hub when a catalog title is useful.</li>\n</ul>\n<h2>What this is not</h2>\n<p>This is not the paid Resources library. Guides that belong behind membership stay there. The blog stays free to read.</p>\n<p>It is also not a newsletter signup page. When we publish, the post lives at <code>/blog</code>. Come to a meetup if you want the live version of the same conversation.</p>\n<h2>Start here</h2>\n<p>If you are new to Austin as an international founder, come to the next meetup first. Register on Luma. Bring one concrete question. The blog will keep adding the written version of what the room keeps teaching.</p>",
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}
