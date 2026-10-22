/**
 * BLOG IMAGE SETS: one naming convention shared by the generator
 * (scripts/build-blog-og-images.mjs) and the build gate (scripts/compile-blog.mjs).
 *
 * Every post owns four files under public/blog/:
 *   <slug>-hero.webp      1600x900  post page hero (one accent mark)
 *   <slug>-hero-800.webp   800x450  hero srcset derivative
 *   <slug>-thumb.webp      640x360  /blog index thumbnail (monochrome, no labels)
 *   <slug>-og.png         1200x630  og:image, twitter:image, BlogPosting image
 *
 * A post that is public in the build must have all four, or the build fails.
 * A post that is not public only warns, so drafts can land before their art.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const IMAGE_SET_COMMAND = 'node scripts/build-blog-og-images.mjs';

export const IMAGE_SIZES = {
    hero: { width: 1600, height: 900 },
    hero800: { width: 800, height: 450 },
    thumb: { width: 640, height: 360 },
    og: { width: 1200, height: 630 },
};

/** Site paths (as served, leading slash) for one post's image set. */
export function imageSetPaths(slug) {
    return {
        hero: `/blog/${slug}-hero.webp`,
        hero800: `/blog/${slug}-hero-800.webp`,
        thumb: `/blog/${slug}-thumb.webp`,
        og: `/blog/${slug}-og.png`,
    };
}

/**
 * Which files of a post's set are absent from publicDir. Returns repo-relative
 * paths (public/blog/...) so a failure message can be acted on as printed.
 */
export function missingImageFiles(slug, publicDir, exists = existsSync) {
    return Object.values(imageSetPaths(slug))
        .filter((sitePath) => !exists(join(publicDir, sitePath)))
        .map((sitePath) => `public${sitePath}`);
}

/**
 * The gate. posts: [{ slug, isPublic, imageAlt }]. A missing or empty
 * imageAlt counts as missing too: the hero and thumbnail render their alt from
 * it. Returns { errors, warnings, readiness }
 * where readiness maps slug -> { ready, missing }. compile-blog throws when
 * errors is non-empty.
 */
export function checkImageSets(posts, publicDir, exists = existsSync) {
    const errors = [];
    const warnings = [];
    const readiness = new Map();
    for (const post of posts) {
        const files = missingImageFiles(post.slug, publicDir, exists);
        const missing = post.imageAlt ? files : [...files, 'imageAlt in frontmatter'];
        readiness.set(post.slug, { ready: missing.length === 0, missing });
        if (missing.length === 0) continue;
        const fixes = [];
        if (files.length > 0) {
            fixes.push(`Generate it with: ${IMAGE_SET_COMMAND} ${post.slug} (needs an entry in scripts/blog-og-manifest.json).`);
        }
        if (!post.imageAlt) fixes.push(`Add imageAlt to the post's frontmatter in content/blog/.`);
        const fix = fixes.join(' ');
        if (post.isPublic) {
            errors.push(
                `Blog post "${post.slug}" is public in this build but its image set is incomplete. Missing: ${missing.join(', ')}. ${fix}`,
            );
        } else {
            warnings.push(
                `Blog post "${post.slug}" (not public) has no complete image set yet. Missing: ${missing.join(', ')}. ${fix} It must exist before the post goes live.`,
            );
        }
    }
    return { errors, warnings, readiness };
}
