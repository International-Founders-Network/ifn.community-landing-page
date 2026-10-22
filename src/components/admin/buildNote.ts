/**
 * What Admin says after a write that fires the Netlify build hook. admin-blog
 * and admin-links return `build`: 'triggered' | 'not-configured' | 'failed'
 * (netlify/functions/_lib/buildHook.ts), or 'skipped' for an approve, which
 * changes nothing public. Lives outside the component files so both panels can
 * share it without breaking React Fast Refresh.
 *
 * A triggered hook means the rebuild is already running: nothing else needs
 * doing, so the copy must not read as if someone has to start a build.
 */
import { formatChicago } from '../../lib/chicagoTime';
import { STATUS_LABEL, type BlogAction, type BlogStatus } from './blogQueue';

export type NoticeTone = 'info' | 'warning';

export interface Notice {
    tone: NoticeTone;
    text: string;
}

const NOT_UPDATING = 'The site will not update until a deploy is triggered in Netlify.';

/** True when the write landed but no rebuild is coming. */
export function buildNeedsAttention(build: unknown): boolean {
    return build === 'not-configured' || build === 'failed';
}

/** Sentence appended to a notice for the `build` field. */
export function buildNote(build: unknown): string {
    switch (build) {
        case 'triggered':
            return ' Site rebuild started, live in a few minutes.';
        case 'not-configured':
            return ` Warning: no build hook is configured. ${NOT_UPDATING}`;
        case 'failed':
            return ` Warning: the rebuild request failed. ${NOT_UPDATING}`;
        default:
            return '';
    }
}

/** The notice after one editorial action on a post. */
export function blogActionNotice(
    post: { title: string; status: BlogStatus; publishAt: string | null },
    action: BlogAction,
    build: unknown
): Notice {
    const tone: NoticeTone = buildNeedsAttention(build) ? 'warning' : 'info';
    const name = `${post.title}:`;
    switch (action) {
        case 'approve':
            return { tone: 'info', text: `${name} approved. Nothing changes on the site until it is scheduled or marked live.` };
        case 'mark_live':
            if (build === 'triggered') {
                return { tone, text: `${name} publishing. Site rebuild started, live in a few minutes.` };
            }
            return { tone, text: `${name} marked live.${buildNote(build)}` };
        case 'schedule': {
            const when = post.publishAt ? ` for ${formatChicago(post.publishAt)}` : '';
            return { tone, text: `${name} scheduled${when}. It goes out on its own at that time.${buildNote(build)}` };
        }
        case 'hold':
            return { tone, text: `${name} back to ${STATUS_LABEL.in_review.toLowerCase()}.${buildNote(build)}` };
        default:
            return { tone, text: `${name} now ${STATUS_LABEL[post.status]}.${buildNote(build)}` };
    }
}
