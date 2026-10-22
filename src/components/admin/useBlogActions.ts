import { useState } from 'react';
import { patchAction, UnauthorizedError } from './adminBlogApi';
import { prepareAction, type BlogAction, type EditorialPost } from './blogQueue';
import { blogActionNotice, type Notice } from './buildNote';
import { useBuildStatus } from './useBuildStatus';

/**
 * One editorial action on one post, shared by the queue and the review page:
 * confirm, PATCH /api/admin-blog (the existing endpoint and actions, nothing
 * new server-side), then say what happened and follow the rebuild it started.
 */
export function useBlogActions({
    onUnauthorized,
    onUpdated,
    onBuildLive,
}: {
    onUnauthorized: () => void;
    onUpdated: (post: EditorialPost) => void;
    onBuildLive?: () => void;
}) {
    const [busySlug, setBusySlug] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [error, setError] = useState<string | null>(null);
    const build = useBuildStatus({ onUnauthorized, onLive: onBuildLive });

    const act = async (post: EditorialPost, action: BlogAction, wallTime: string) => {
        setError(null);
        setNotice(null);
        const prepared = prepareAction(post, action, wallTime, (message) => window.confirm(message));
        if (prepared.kind === 'cancelled') return;
        if (prepared.kind === 'error') {
            setError(prepared.message);
            return;
        }

        setBusySlug(post.slug);
        try {
            const result = await patchAction(post.slug, action, prepared.publishAt);
            onUpdated(result.post);
            setNotice(blogActionNotice(result.post, action, result.build));
            if (result.build === 'triggered') build.track();
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                onUnauthorized();
                return;
            }
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusySlug(null);
        }
    };

    return { act, busySlug, notice, error, setError, buildPhase: build.phase };
}
