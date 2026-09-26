/**
 * Blog editorial state machine, shared by admin-blog and blog-publish-due.
 *
 *   draft → in_review → approved → scheduled → live
 *                    ↖ hold (approved | scheduled → in_review)
 *
 * Content sets draft / in_review in frontmatter. Every later state is written
 * here, to the Neon `blog_editorial` overlay, by an allowlisted admin or by the
 * scheduled promoter. scripts/compile-blog.mjs applies the same public gate at
 * build time; keep isPubliclyVisible in step with its isPublic.
 */
import type { NeonQueryFunction } from '@neondatabase/serverless';
import queueData from '../_data/blog-queue.json';

export const BLOG_STATUSES = ['draft', 'in_review', 'approved', 'scheduled', 'live'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_ACTIONS = ['approve', 'schedule', 'mark_live', 'hold'] as const;
export type BlogAction = (typeof BLOG_ACTIONS)[number];

export interface QueueEntry {
    slug: string;
    title: string;
    date: string;
    status: BlogStatus;
    publishAt: string | null;
    tags: string[];
    draft: boolean;
    publicInBuild: boolean;
}

export interface OverlayRow {
    slug: string;
    status: BlogStatus;
    publishAt: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface EditorialPost extends QueueEntry {
    /** 'overlay' when Neon holds a row for this slug, else 'frontmatter'. */
    source: 'overlay' | 'frontmatter';
    updatedAt: string | null;
    updatedBy: string | null;
}

/** Metadata for every post at the last build. No HTML by construction. */
export function loadQueue(): QueueEntry[] {
    return (queueData as { posts: QueueEntry[] }).posts;
}

/** ISO-8601 date-time with an explicit offset or Z. */
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

export function isValidPublishAt(value: unknown): value is string {
    return typeof value === 'string' && ISO_WITH_OFFSET.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * publishAt carries its own offset, so comparing instants is the same as
 * comparing against "now in America/Chicago". No wall-clock maths needed.
 */
export function isPubliclyVisible(status: BlogStatus, publishAt: string | null, nowMs = Date.now()): boolean {
    if (status === 'live') return true;
    if (status === 'scheduled' && publishAt) return Date.parse(publishAt) <= nowMs;
    return false;
}

export type TransitionResult =
    | { ok: true; status: BlogStatus; publishAt: string | null }
    | { ok: false; error: string };

/**
 * The only transitions Admin may make. Nothing reaches approved without passing
 * through in_review, and nothing reaches scheduled/live without approved.
 */
export function applyAction(
    current: { status: BlogStatus; publishAt: string | null },
    action: BlogAction,
    publishAt?: unknown
): TransitionResult {
    const from = current.status;
    switch (action) {
        case 'approve':
            if (from !== 'in_review') return { ok: false, error: `Cannot approve from ${from}; needs in_review.` };
            return { ok: true, status: 'approved', publishAt: null };
        case 'schedule':
            if (from !== 'approved' && from !== 'scheduled') {
                return { ok: false, error: `Cannot schedule from ${from}; approve first.` };
            }
            if (!isValidPublishAt(publishAt)) {
                return { ok: false, error: 'Schedule needs publishAt as ISO-8601 with an offset.' };
            }
            return { ok: true, status: 'scheduled', publishAt };
        case 'mark_live':
            if (from !== 'approved' && from !== 'scheduled') {
                return { ok: false, error: `Cannot mark live from ${from}; approve first.` };
            }
            return { ok: true, status: 'live', publishAt: current.publishAt };
        case 'hold':
            if (from !== 'approved' && from !== 'scheduled') {
                return { ok: false, error: `Cannot hold from ${from}; only approved or scheduled posts can be held.` };
            }
            return { ok: true, status: 'in_review', publishAt: null };
        default:
            return { ok: false, error: 'Unknown action.' };
    }
}

/** Overlay wins for status and publishAt only; title, date and tags stay from the Markdown. */
export function mergeOverlay(queue: QueueEntry[], overlay: OverlayRow[]): EditorialPost[] {
    const bySlug = new Map(overlay.map((row) => [row.slug, row]));
    return queue.map((entry) => {
        const row = bySlug.get(entry.slug);
        if (!row) return { ...entry, source: 'frontmatter', updatedAt: null, updatedBy: null };
        return {
            ...entry,
            status: row.status,
            publishAt: row.publishAt,
            source: 'overlay',
            updatedAt: row.updatedAt,
            updatedBy: row.updatedBy,
        };
    });
}

type Sql = NeonQueryFunction<false, false>;

export async function ensureTable(sql: Sql): Promise<void> {
    // Mirrors db/migrations/04_blog_editorial.sql; keep the two in step.
    await sql`
        CREATE TABLE IF NOT EXISTS blog_editorial (
            slug TEXT PRIMARY KEY,
            status TEXT NOT NULL CHECK (status IN ('draft','in_review','approved','scheduled','live')),
            publish_at TIMESTAMPTZ NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_by TEXT NULL
        )
    `;
}

function toIso(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function loadOverlay(sql: Sql): Promise<OverlayRow[]> {
    const rows = (await sql`SELECT slug, status, publish_at, updated_at, updated_by FROM blog_editorial`) as Record<
        string,
        unknown
    >[];
    return rows
        .filter((row) => BLOG_STATUSES.includes(row.status as BlogStatus))
        .map((row) => ({
            slug: String(row.slug),
            status: row.status as BlogStatus,
            publishAt: toIso(row.publish_at),
            updatedAt: toIso(row.updated_at),
            updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
        }));
}

export async function upsertOverlay(
    sql: Sql,
    slug: string,
    status: BlogStatus,
    publishAt: string | null,
    updatedBy: string
): Promise<void> {
    await sql`
        INSERT INTO blog_editorial (slug, status, publish_at, updated_at, updated_by)
        VALUES (${slug}, ${status}, ${publishAt}, now(), ${updatedBy})
        ON CONFLICT (slug) DO UPDATE
        SET status = EXCLUDED.status,
            publish_at = EXCLUDED.publish_at,
            updated_at = now(),
            updated_by = EXCLUDED.updated_by
    `;
}
