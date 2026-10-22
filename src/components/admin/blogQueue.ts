/**
 * Admin → Blog: the queue's client-side model. Pure, so the rules the list and
 * the review page both follow are tested once (src/components/admin/blogQueue.test.ts).
 *
 * The transitions mirror applyAction in netlify/functions/_lib/blogEditorial.ts,
 * which is what the server enforces. This file only decides which buttons to
 * offer; it never imports the server module, because that one bundles the queue
 * JSON and draft metadata must not reach the client bundle that way.
 */
import { chicagoWallTimeToIso, formatChicago } from '../../lib/chicagoTime';

export type BlogStatus = 'draft' | 'in_review' | 'approved' | 'scheduled' | 'live';
export type BlogAction = 'approve' | 'schedule' | 'mark_live' | 'hold';
export type ImageVariant = 'hero' | 'hero800' | 'thumb';

export interface EditorialPost {
    slug: string;
    title: string;
    date: string;
    status: BlogStatus;
    publishAt: string | null;
    tags: string[];
    draft: boolean;
    publicInBuild: boolean;
    /** Hero, thumbnail, OG image and imageAlt all present at the last build. */
    imagesReady: boolean;
    imagesMissing: string[];
    /** Site paths of the image set. */
    images: { hero: string; hero800: string; thumb: string; og: string };
    imageAlt: string;
    source: 'overlay' | 'frontmatter';
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface HeldLink {
    text: string;
    href: string;
    host: string;
}

export interface PostBody {
    description: string;
    /** Sanitized by rehype-sanitize at compile, then gated: what the last build would publish. */
    html: string;
    /** Anchors the outbound gate turned into plain text in `html`. */
    heldLinks: HeldLink[];
}

export const STATUS_LABEL: Record<BlogStatus, string> = {
    draft: 'Draft',
    in_review: 'In review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    live: 'Live',
};

/** Button text per action. Hold is "Back to review": that is where it puts the post. */
export const ACTION_LABEL: Record<BlogAction, string> = {
    approve: 'Approve',
    schedule: 'Schedule',
    mark_live: 'Mark live',
    hold: 'Back to review',
};

/** The actions the server will accept from this status, in button order. */
export function availableActions(status: BlogStatus): BlogAction[] {
    switch (status) {
        case 'in_review':
            return ['approve'];
        case 'approved':
        case 'scheduled':
            return ['schedule', 'mark_live', 'hold'];
        default:
            return [];
    }
}

/** Why a post offers no actions. Null when it offers some. */
export function noActionsReason(status: BlogStatus): string | null {
    if (status === 'live') return 'Live. Nothing to approve.';
    if (status === 'draft') return 'Draft. Content moves it to in review before it can be approved.';
    return null;
}

/** Same rule as isPubliclyVisible on the server and isPublic in compile-blog. */
export function isPubliclyVisible(status: BlogStatus, publishAt: string | null, nowMs = Date.now()): boolean {
    if (status === 'live') return true;
    if (status === 'scheduled' && publishAt) return Date.parse(publishAt) <= nowMs;
    return false;
}

export type SiteStateKind = 'on-site' | 'publishing' | 'removing' | 'off-site';

/**
 * Whether the post is on the site, comparing what the editorial state says
 * (overlay, now) with what the last build published (publicInBuild). A gap
 * between the two is a rebuild that has not finished yet, because every
 * action that changes public state fires the build hook.
 */
export function siteState(
    post: Pick<EditorialPost, 'status' | 'publishAt' | 'publicInBuild'>,
    nowMs = Date.now()
): { kind: SiteStateKind; label: string } {
    const shouldBePublic = isPubliclyVisible(post.status, post.publishAt, nowMs);
    if (post.publicInBuild && shouldBePublic) return { kind: 'on-site', label: 'On site in current build' };
    if (!post.publicInBuild && shouldBePublic) return { kind: 'publishing', label: 'Publishing (rebuild in progress)' };
    if (post.publicInBuild) return { kind: 'removing', label: 'On site until the rebuild finishes' };
    return { kind: 'off-site', label: 'Not on site' };
}

/**
 * Where Admin loads one image of a post's set. A post public in this build has
 * its files in dist/ at the plain site path. Any other post's files are pruned
 * from dist/ (they 404 publicly), so Admin reads them through the authed
 * admin-blog-image function.
 */
export function adminImageUrl(
    post: Pick<EditorialPost, 'slug' | 'publicInBuild' | 'images'>,
    variant: ImageVariant
): string {
    if (post.publicInBuild) return post.images[variant];
    return `/api/admin-blog-image?slug=${encodeURIComponent(post.slug)}&variant=${variant}`;
}

/** True when the image gate found this variant's file missing at the last build. */
export function imageMissing(post: Pick<EditorialPost, 'images' | 'imagesMissing'>, variant: ImageVariant): boolean {
    return post.imagesMissing.includes(`public${post.images[variant]}`);
}

export const MARK_LIVE_CONFIRM = 'Publish now? The site rebuilds and the post is live in a few minutes.';

export type PreparedAction =
    | { kind: 'send'; publishAt?: string }
    | { kind: 'error'; message: string }
    | { kind: 'cancelled' };

/**
 * Turn a button press into a PATCH body, or an error, or nothing when the
 * person backs out of a confirm. Schedule converts the Chicago wall time;
 * a time already past asks first, since the post would then go out on the
 * rebuild that the schedule itself starts.
 */
export function prepareAction(
    post: Pick<EditorialPost, 'title'>,
    action: BlogAction,
    wallTime: string,
    confirm: (message: string) => boolean,
    nowMs = Date.now()
): PreparedAction {
    if (action === 'mark_live') {
        return confirm(`${MARK_LIVE_CONFIRM}\n\n"${post.title}"`) ? { kind: 'send' } : { kind: 'cancelled' };
    }
    if (action !== 'schedule') return { kind: 'send' };

    const iso = wallTime ? chicagoWallTimeToIso(wallTime) : null;
    if (!iso) return { kind: 'error', message: `Pick a publish time (America/Chicago) for "${post.title}" first.` };
    if (
        Date.parse(iso) <= nowMs &&
        !confirm(
            `${formatChicago(iso)} has already passed, so "${post.title}" would publish as soon as the rebuild finishes. Schedule it anyway?`
        )
    ) {
        return { kind: 'cancelled' };
    }
    return { kind: 'send', publishAt: iso };
}
