/**
 * COMPILE BLOG MARKDOWN → typed generated module.
 *
 * Source: content/blog/<slug>.md (YAML frontmatter + Markdown body)
 * Output: src/data/blog.generated.ts (committed, like pricing/photos)
 *
 * Drafts (draft: true) are excluded from the published list. Filename stem is
 * the slug unless frontmatter.slug overrides it. Body is compiled to HTML with
 * remark/rehype so React can render without a runtime Markdown parser.
 *
 * Runs before tsc/vite in `npm run build`. Safe to run alone: `node scripts/compile-blog.mjs`.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'blog');
const OUT_PATH = join(ROOT, 'src', 'data', 'blog.generated.ts');

function escapeTsString(value) {
    return JSON.stringify(value ?? '');
}

async function mdToHtml(markdown) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(markdown);
    return String(file);
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

async function compile() {
    if (!existsSync(CONTENT_DIR)) {
        mkdirSync(CONTENT_DIR, { recursive: true });
    }

    const files = readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.md'));
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

        const html = await mdToHtml(content.trim());
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
            tags,
            ogImage,
            html,
        });
    }

    const published = posts
        .filter((post) => !post.draft)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

    const body = `/**
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
}

compile().catch((err) => {
    console.error(err);
    process.exit(1);
});
