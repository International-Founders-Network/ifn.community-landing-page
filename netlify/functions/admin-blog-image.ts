import { Handler, HandlerEvent } from '@netlify/functions';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSessionEmail } from './_lib/auth';
import { loadQueue } from './_lib/blogEditorial';

/**
 * Admin → Blog images for posts that are not public.
 *
 * public/blog/ holds every post's image set, but vite.config.ts
 * (ifn-blog-image-prune) deletes the files of non-public posts from dist/, so
 * /blog/<slug>-hero.webp 404s for a draft. That gate stays. Admin instead reads
 * the file through this function, behind the same allowlisted session as
 * admin-blog. netlify.toml ships public/blog/*.webp with this function only
 * (included_files).
 *
 * The caller picks a slug from the queue and a variant name, never a path, so
 * nothing outside the queue's own image set can be read.
 */

const VARIANTS = ['hero', 'hero800', 'thumb'] as const;
type Variant = (typeof VARIANTS)[number];

/** First root whose public/ holds the site path, or null. */
export function resolvePublicFile(
    sitePath: string,
    roots: string[],
    exists: (path: string) => boolean = existsSync
): string | null {
    for (const root of roots) {
        const candidate = join(root, 'public', sitePath);
        if (exists(candidate)) return candidate;
    }
    return null;
}

/** Repo root under netlify dev and vitest; the unzipped bundle root on Netlify. */
function publicRoots(): string[] {
    return [process.cwd(), process.env.LAMBDA_TASK_ROOT].filter((root): root is string => Boolean(root));
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

    const email = await getSessionEmail(event);
    if (!email) return { statusCode: 401, body: 'Not authenticated' };

    const variant = event.queryStringParameters?.variant as Variant;
    if (!VARIANTS.includes(variant)) return { statusCode: 400, body: 'Unknown variant' };

    const slug = event.queryStringParameters?.slug;
    const entry = loadQueue().find((post) => post.slug === slug);
    if (!entry) return { statusCode: 404, body: 'Unknown slug' };

    const file = resolvePublicFile(entry.images[variant], publicRoots());
    if (!file) {
        console.error(`admin-blog-image: ${entry.images[variant]} not found in the function bundle.`);
        return { statusCode: 404, body: 'Image not found' };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/webp',
            // A signed-in admin only. Never in a shared cache.
            'Cache-Control': 'private, max-age=300',
            'X-Robots-Tag': 'noindex, nofollow',
        },
        body: readFileSync(file).toString('base64'),
        isBase64Encoded: true,
    };
};
