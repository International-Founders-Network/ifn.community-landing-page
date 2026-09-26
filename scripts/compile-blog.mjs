/**
 * COMPILE BLOG MARKDOWN → typed generated module.
 *
 * Source: content/blog/<slug>.md (YAML frontmatter + Markdown body)
 * Output: src/data/blog.generated.ts (committed, like pricing/photos)
 *
 * Output: netlify/functions/_data/blog-queue.json (committed; metadata only)
 *
 * EDITORIAL GATE (openspec/changes/blog-editorial-publish). Every post carries a
 * `status` (draft | in_review | approved | scheduled | live) and an optional
 * `publishAt` (ISO-8601 with offset). A post reaches BLOG_POSTS, and therefore
 * the public bundle, prerender, sitemap and RSS, only when
 *   status === 'live', or
 *   status === 'scheduled' AND publishAt <= now.
 * draft / in_review / approved never publish, whatever else is set.
 *
 * Legacy `draft` boolean: with no `status`, draft: true => draft and
 * draft: false/omitted => live (the welcome post predates `status`). When
 * `status` is present it wins.
 *
 * Neon overlay: when NETLIFY_DATABASE_URL is set, rows in `blog_editorial`
 * override frontmatter `status` / `publishAt` by slug (never body or title).
 * That is how Admin approvals reach the build without editing Markdown.
 *
 * The queue JSON lists ALL posts, including drafts, but carries no HTML. It is
 * read by the admin-blog function only; nothing under src/ imports it, so draft
 * copy never ships in the client bundle.
 *
 * Output: netlify/functions/_data/blog-bodies.json (committed; server-only)
 *
 * Every post's compiled HTML, drafts included, keyed by slug, for the Admin
 * review drawer (GET /api/admin-blog?slug=). Same rule as the queue: imported
 * by admin-blog through _lib/blogBodies.ts only, never from src/.
 *
 * OUTBOUND GATE (openspec/changes/admin-ux-blog-links-review). Anchors to a
 * sponsor or potential host are unwrapped to plain text unless that row is
 * approved in Admin → Links (seed from src/data/linkAllowlistData.ts, merged
 * with the Neon `link_allowlist` overlay). See scripts/lib/outboundGate.mjs.
 * Decided per build: an approval reaches a live post on the next rebuild.
 *
 * Filename stem is the slug unless frontmatter.slug overrides it. Body is
 * compiled to HTML with remark/rehype so React can render without a runtime
 * Markdown parser.
 *
 * Runs before tsc/vite in `npm run build`. Safe to run alone: `node scripts/compile-blog.mjs`.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { neon } from '@neondatabase/serverless';
import { runnerImport } from 'vite';
import { buildOutboundGate, markdownToHtml } from './lib/outboundGate.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'blog');
const OUT_PATH = join(ROOT, 'src', 'data', 'blog.generated.ts');
const QUEUE_PATH = join(ROOT, 'netlify', 'functions', '_data', 'blog-queue.json');
const BODIES_PATH = join(ROOT, 'netlify', 'functions', '_data', 'blog-bodies.json');
const LINK_LIB_PATH = join(ROOT, 'netlify', 'functions', '_lib', 'linkAllowlist.ts');

const STATUSES = ['draft', 'in_review', 'approved', 'scheduled', 'live'];
const SYNDICATION_CHANNELS = ['medium', 'linkedin', 'x', 'instagram'];
/** ISO-8601 date-time that states its offset. A bare local time is ambiguous. */
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

function escapeTsString(value) {
    return JSON.stringify(value ?? '');
}

function slugifyStem(filename) {
    return basename(filename, '.md').toLowerCase();
}

function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toIsoDate(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (isIsoDate(trimmed)) return trimmed;
        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    }
    return null;
}

function parseStatus(data, file) {
    if (data.status === undefined || data.status === null || data.status === '') {
        return data.draft ? 'draft' : 'live';
    }
    const status = String(data.status).trim().toLowerCase();
    if (STATUSES.includes(status)) return status;
    // Fail closed: an unrecognised status must never make a post public.
    console.warn(`${file}: unknown status "${data.status}"; treating as draft.`);
    return 'draft';
}

/**
 * Normalise publishAt to an ISO string, or null. YAML parses an unquoted
 * timestamp into a Date (instant preserved, offset dropped), so accept that too.
 */
function parsePublishAt(value, label) {
    if (value === undefined || value === null || value === '') return null;
    if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) return value.toISOString();
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (ISO_WITH_OFFSET.test(trimmed) && !Number.isNaN(Date.parse(trimmed))) return trimmed;
    }
    console.warn(`${label}: invalid publishAt ${JSON.stringify(value)}; ignoring (needs ISO-8601 with offset).`);
    return null;
}

function parseSyndication(value) {
    const out = {};
    for (const channel of SYNDICATION_CHANNELS) {
        out[channel] = Boolean(value && typeof value === 'object' && value[channel] === true);
    }
    return out;
}

/**
 * The single public gate. publishAt carries its own offset, so comparing
 * instants IS comparing against "now in America/Chicago": 09:00-05:00 and
 * 14:00Z are the same moment. No wall-clock conversion is needed or wanted.
 */
function isPublic(status, publishAt, nowMs) {
    if (status === 'live') return true;
    if (status === 'scheduled' && publishAt) return Date.parse(publishAt) <= nowMs;
    return false;
}

/**
 * Editorial overlay from Neon. No database configured => frontmatter only
 * (local dev, CI). Table not created yet => frontmatter only. Any OTHER failure
 * fails the build on purpose: silently dropping the overlay would unpublish
 * every post that went live through Admin, and a failed build leaves the
 * previous deploy serving instead.
 */
async function loadOverlay(sql) {
    if (!sql) return new Map();
    try {
        const rows = await sql`SELECT slug, status, publish_at FROM blog_editorial`;
        const overlay = new Map();
        for (const row of rows) {
            if (!STATUSES.includes(row.status)) continue;
            overlay.set(row.slug, {
                status: row.status,
                publishAt: row.publish_at ? new Date(row.publish_at).toISOString() : null,
            });
        }
        console.log(`Blog editorial overlay: ${overlay.size} row(s) from Neon.`);
        return overlay;
    } catch (err) {
        if (err && err.code === '42P01') {
            console.warn('Blog editorial overlay: blog_editorial table not found; using frontmatter only.');
            return new Map();
        }
        throw err;
    }
}

/**
 * Effective Admin → Links rows: the seed (src/data/linkAllowlistData.ts)
 * merged with the Neon `link_allowlist` overlay by the same module admin-links
 * serves from. That module is TypeScript, so it is loaded through Vite's
 * runnerImport (no vite.config, nothing written to disk) rather than
 * duplicated here.
 *
 * Same failure policy as the editorial overlay: no database => seed only; table
 * not created yet => seed only; any other error fails the build. Dropping the
 * overlay silently would strip every link Venkat approved, and would reopen a
 * link he held on any sponsor seeded as verified.
 */
async function loadLinkRows(sql) {
    const { module: links } = await runnerImport(LINK_LIB_PATH);
    const seed = links.loadLinkSeed();
    if (!sql) return links.mergeLinkOverlay(seed, []);
    try {
        const overlay = await links.loadLinkOverlay(sql);
        console.log(`Link allowlist overlay: ${overlay.length} row(s) from Neon.`);
        return links.mergeLinkOverlay(seed, overlay);
    } catch (err) {
        if (err && err.code === '42P01') {
            console.warn('Link allowlist overlay: link_allowlist table not found; using the seed only.');
            return links.mergeLinkOverlay(seed, []);
        }
        throw err;
    }
}

async function compile() {
    if (!existsSync(CONTENT_DIR)) {
        mkdirSync(CONTENT_DIR, { recursive: true });
    }

    const files = readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.md'));
    const dbUrl = process.env.NETLIFY_DATABASE_URL;
    const sql = dbUrl ? neon(dbUrl) : null;
    const overlay = await loadOverlay(sql);
    const gate = buildOutboundGate(await loadLinkRows(sql));
    const nowMs = Date.now();
    const posts = [];

    for (const file of files) {
        const raw = readFileSync(join(CONTENT_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        const stem = slugifyStem(file);
        const slug =
            typeof data.slug === 'string' && data.slug.trim()
                ? data.slug.trim().toLowerCase()
                : stem;

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            throw new Error(`Invalid blog slug "${slug}" from ${file}`);
        }

        const draft = Boolean(data.draft);
        let status = parseStatus(data, file);
        let publishAt = parsePublishAt(data.publishAt, file);
        const override = overlay.get(slug);
        if (override) {
            status = override.status;
            publishAt = override.publishAt;
        }
        if (status === 'scheduled' && !publishAt) {
            console.warn(`${file}: status scheduled without publishAt; not public.`);
        }
        const title = typeof data.title === 'string' ? data.title.trim() : '';
        const description =
            typeof data.description === 'string' ? data.description.trim() : '';
        const date = toIsoDate(data.date);
        const updated = toIsoDate(data.updated);
        const tags = Array.isArray(data.tags)
            ? data.tags.filter((t) => typeof t === 'string').map((t) => t.trim())
            : [];
        const ogImage =
            typeof data.ogImage === 'string' && data.ogImage.trim()
                ? data.ogImage.trim()
                : null;

        if (!title) throw new Error(`${file}: frontmatter title is required`);
        if (!description) throw new Error(`${file}: frontmatter description is required`);
        if (!date) throw new Error(`${file}: frontmatter date (YYYY-MM-DD) is required`);

        const { html, held } = await markdownToHtml(content.trim(), gate);
        if (held.length > 0) {
            const hosts = [...new Set(held.map((link) => link.host))].join(', ');
            console.log(`${file}: ${held.length} outbound link(s) held as plain text, not approved in Admin → Links: ${hosts}`);
        }
        const excerpt =
            description.length > 180 ? `${description.slice(0, 177)}…` : description;

        posts.push({
            slug,
            title,
            description,
            excerpt,
            date,
            updated,
            draft,
            status,
            publishAt,
            syndication: parseSyndication(data.syndication),
            tags,
            ogImage,
            html,
            heldLinks: held,
            isPublic: isPublic(status, publishAt, nowMs),
        });
    }

    const published = posts
        .filter((post) => post.isPublic)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

    const body = `/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by scripts/compile-blog.mjs from content/blog/*.md.
 * Regenerate with: node scripts/compile-blog.mjs
 *
 * Only public posts are included: status live, or scheduled with publishAt
 * already past. Drafts, in-review and approved posts never appear here.
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
${published
    .map(
        (post) => `    {
        slug: ${escapeTsString(post.slug)},
        title: ${escapeTsString(post.title)},
        description: ${escapeTsString(post.description)},
        excerpt: ${escapeTsString(post.excerpt)},
        date: ${escapeTsString(post.date)},
        updated: ${post.updated ? escapeTsString(post.updated) : 'null'},
        tags: ${JSON.stringify(post.tags)},
        ogImage: ${post.ogImage ? escapeTsString(post.ogImage) : 'null'},
        html: ${escapeTsString(post.html)},
    }`,
    )
    .join(',\n')}
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}
`;

    writeFileSync(OUT_PATH, body, 'utf8');
    console.log(`Compiled ${published.length} published blog post(s) → src/data/blog.generated.ts`);

    // Metadata only. No html, no description body text beyond what Admin lists.
    const queue = posts
        .map((post) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            status: post.status,
            publishAt: post.publishAt,
            tags: post.tags,
            draft: post.draft,
            syndication: post.syndication,
            publicInBuild: post.isPublic,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
    mkdirSync(dirname(QUEUE_PATH), { recursive: true });
    writeFileSync(QUEUE_PATH, `${JSON.stringify({ posts: queue }, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${queue.length} post(s) to the editorial queue → netlify/functions/_data/blog-queue.json`);

    // Full bodies for the Admin review drawer, drafts included. The HTML is the
    // gated HTML this build would publish; heldLinks lists what the gate held.
    const bodies = Object.fromEntries(
        [...posts]
            .sort((a, b) => a.slug.localeCompare(b.slug))
            .map((post) => [
                post.slug,
                {
                    slug: post.slug,
                    title: post.title,
                    description: post.description,
                    date: post.date,
                    status: post.status,
                    publishAt: post.publishAt,
                    html: post.html,
                    heldLinks: post.heldLinks,
                },
            ]),
    );
    writeFileSync(BODIES_PATH, `${JSON.stringify({ posts: bodies }, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${posts.length} post bod${posts.length === 1 ? 'y' : 'ies'} for Admin review → netlify/functions/_data/blog-bodies.json`);
}

compile().catch((err) => {
    console.error(err);
    process.exit(1);
});
