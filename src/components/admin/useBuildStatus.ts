import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBuildStatus, UnauthorizedError } from './adminBlogApi';
import {
    deriveBuildPhase,
    POLL_INTERVAL_MS,
    POLL_LIMIT_MS,
    shouldKeepPolling,
    type BuildPhase,
    type BuildStatusResponse,
} from './buildPhase';

/**
 * Follows the production deploy a blog action started. track() is called when
 * admin-blog answers build: 'triggered'; this then polls admin-build-status
 * every 15 s for up to 10 minutes. The start time is kept in sessionStorage, so
 * moving between the queue and a review page keeps following the same build.
 */
const STORAGE_KEY = 'ifn-admin-build-triggered-at';

function storedTriggeredAt(): number | null {
    try {
        const value = Number(window.sessionStorage.getItem(STORAGE_KEY));
        return value && Date.now() - value < POLL_LIMIT_MS ? value : null;
    } catch {
        return null;
    }
}

function store(value: number | null) {
    try {
        if (value === null) window.sessionStorage.removeItem(STORAGE_KEY);
        else window.sessionStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        // Private mode or storage disabled: tracking still works on this page.
    }
}

export function useBuildStatus({ onUnauthorized, onLive }: { onUnauthorized: () => void; onLive?: () => void }) {
    const [triggeredAt, setTriggeredAt] = useState<number | null>(storedTriggeredAt);
    const [response, setResponse] = useState<BuildStatusResponse | undefined>(undefined);
    const [now, setNow] = useState(() => Date.now());
    const callbacks = useRef({ onUnauthorized, onLive });
    useEffect(() => {
        callbacks.current = { onUnauthorized, onLive };
    });

    const track = useCallback(() => {
        const at = Date.now();
        store(at);
        setResponse(undefined);
        setNow(at);
        setTriggeredAt(at);
    }, []);

    useEffect(() => {
        if (triggeredAt === null) return;
        let cancelled = false;
        let timer: number | undefined;

        const tick = async () => {
            let result: BuildStatusResponse;
            try {
                result = await fetchBuildStatus();
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    callbacks.current.onUnauthorized();
                    return;
                }
                result = { available: true, error: 'unreachable' };
            }
            if (cancelled) return;
            const at = Date.now();
            setResponse(result);
            setNow(at);
            const phase = deriveBuildPhase(result, triggeredAt, at);
            if (shouldKeepPolling(phase)) {
                timer = window.setTimeout(tick, POLL_INTERVAL_MS);
                return;
            }
            store(null);
            if (phase === 'live') callbacks.current.onLive?.();
        };

        tick();
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [triggeredAt]);

    const phase: BuildPhase | null = triggeredAt === null ? null : deriveBuildPhase(response, triggeredAt, now);
    return { phase, track };
}
