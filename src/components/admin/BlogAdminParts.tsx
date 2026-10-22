import { Loader2 } from 'lucide-react';
import { Button } from '../Button';
import {
    ACTION_LABEL,
    adminImageUrl,
    availableActions,
    imageMissing,
    noActionsReason,
    type BlogAction,
    type EditorialPost,
} from './blogQueue';
import { BUILD_PHASE_LABEL, type BuildPhase } from './buildPhase';
import type { Notice } from './buildNote';

const INPUT =
    'h-11 rounded-lg border border-edge bg-paper px-3 text-sm text-ink transition-colors focus:border-ink ' +
    'focus:outline-hidden focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper';

/**
 * The actions this post's status allows (availableActions), in one row:
 * Approve; or a Chicago time with Schedule, then Mark live and Back to review.
 */
export function PostActions({
    post,
    inputId,
    wallTime,
    disabled,
    onWallTimeChange,
    onAct,
    showReason = false,
}: {
    post: EditorialPost;
    inputId: string;
    wallTime: string;
    disabled: boolean;
    onWallTimeChange: (value: string) => void;
    onAct: (action: BlogAction) => void;
    /** Say why there is nothing to do (draft, live) instead of rendering nothing. */
    showReason?: boolean;
}) {
    const actions = availableActions(post.status);
    if (actions.length === 0) {
        const reason = noActionsReason(post.status);
        return showReason && reason ? <span className="text-sm text-muted">{reason}</span> : null;
    }
    return (
        <>
            {actions.includes('approve') && (
                <Button size="sm" onClick={() => onAct('approve')} disabled={disabled}>
                    {ACTION_LABEL.approve}
                    <span className="sr-only"> {post.title}</span>
                </Button>
            )}
            {actions.includes('schedule') && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <label htmlFor={inputId} className="sr-only">
                        Publish time for {post.title}, America/Chicago
                    </label>
                    <input
                        id={inputId}
                        type="datetime-local"
                        className={INPUT}
                        value={wallTime}
                        onChange={(e) => onWallTimeChange(e.target.value)}
                    />
                    <span className="text-xs text-muted">America/Chicago</span>
                    <Button size="sm" onClick={() => onAct('schedule')} disabled={disabled}>
                        {post.status === 'scheduled' ? 'Reschedule' : ACTION_LABEL.schedule}
                    </Button>
                </span>
            )}
            {actions.includes('mark_live') && (
                <Button size="sm" variant="outline" onClick={() => onAct('mark_live')} disabled={disabled}>
                    {ACTION_LABEL.mark_live}
                </Button>
            )}
            {actions.includes('hold') && (
                <Button size="sm" variant="ghost" onClick={() => onAct('hold')} disabled={disabled}>
                    {ACTION_LABEL.hold}
                </Button>
            )}
        </>
    );
}

/**
 * What the last action did and where its rebuild is. A warning (no hook, hook
 * failed, build failed) uses the error form: --ink with a 3px rule, no accent.
 */
export function ActionFeedback({
    notice,
    error,
    buildPhase,
}: {
    notice: Notice | null;
    error: string | null;
    buildPhase: BuildPhase | null;
}) {
    const phaseText = buildPhase ? BUILD_PHASE_LABEL[buildPhase] : '';
    const pending = buildPhase === 'checking' || buildPhase === 'waiting' || buildPhase === 'building';
    const phaseWarns = buildPhase === 'failed' || buildPhase === 'timeout';
    return (
        <>
            {error && (
                <p role="alert" className="border-l-[3px] border-l-ink py-1 pl-4 text-sm text-ink">
                    {error}
                </p>
            )}
            {notice?.tone === 'warning' && (
                <p role="alert" className="border-l-[3px] border-l-ink py-1 pl-4 text-sm text-ink">
                    {notice.text}
                </p>
            )}
            <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {notice?.tone === 'info' && <span>{notice.text}</span>}
                {phaseText && (
                    <span
                        className={`inline-flex items-center gap-2 font-semibold ${
                            phaseWarns ? 'border-l-[3px] border-l-ink pl-3 text-ink' : 'text-ink'
                        }`}
                    >
                        {pending && <Loader2 className="h-4 w-4 animate-spin motion-status" aria-hidden="true" />}
                        {phaseText}
                    </span>
                )}
            </p>
        </>
    );
}

/** 16:9 thumbnail from the post's image set; a labelled blank when the file is missing. */
export function PostThumb({ post, className = '' }: { post: EditorialPost; className?: string }) {
    if (imageMissing(post, 'thumb')) {
        return (
            <div
                className={`flex aspect-video items-center justify-center border border-dashed border-edge bg-band px-2 text-center text-xs text-muted ${className}`}
            >
                No image yet
            </div>
        );
    }
    return (
        <img
            src={adminImageUrl(post, 'thumb')}
            alt=""
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            className={`aspect-video border border-rule bg-band object-cover ${className}`}
        />
    );
}
