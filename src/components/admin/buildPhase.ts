/**
 * Admin's build status line after a blog action fires the build hook. Pure:
 * maps the admin-build-status response and the time of the action to one
 * phase. Polling lives in useBuildStatus.
 */

export interface DeploySummary {
    state: string;
    createdAt: string | null;
    publishedAt: string | null;
    deployId: string;
    context: string | null;
}

export type BuildStatusResponse =
    | { available: false }
    | { available: true; deploy: DeploySummary | null }
    | { available: true; error: string };

export type BuildPhase = 'checking' | 'waiting' | 'building' | 'live' | 'failed' | 'timeout' | 'unavailable';

/** Poll every 15 s for up to 10 minutes. */
export const POLL_INTERVAL_MS = 15_000;
export const POLL_LIMIT_MS = 10 * 60_000;

/**
 * A deploy created this long before the hook fired is still taken as ours:
 * Netlify's clock and the browser's are not the same clock.
 */
const CLOCK_SKEW_MS = 60_000;

/** Netlify deploy state to the three outcomes Admin cares about. */
export function deployPhase(state: string): 'building' | 'live' | 'failed' {
    if (state === 'ready') return 'live';
    if (state === 'error' || state === 'rejected') return 'failed';
    return 'building';
}

export function deriveBuildPhase(
    response: BuildStatusResponse | undefined,
    triggeredAtMs: number,
    nowMs: number
): BuildPhase {
    if (!response) return 'checking';
    if (!response.available || 'error' in response) return 'unavailable';

    const elapsed = nowMs - triggeredAtMs;
    const deploy = response.deploy;
    const created = deploy?.createdAt ? Date.parse(deploy.createdAt) : NaN;
    const ours = deploy !== null && !Number.isNaN(created) && created >= triggeredAtMs - CLOCK_SKEW_MS;

    // The latest deploy is still the one from before the action.
    if (!ours) return elapsed > POLL_LIMIT_MS ? 'timeout' : 'waiting';

    const phase = deployPhase(deploy.state);
    if (phase === 'building' && elapsed > POLL_LIMIT_MS) return 'timeout';
    return phase;
}

export function shouldKeepPolling(phase: BuildPhase): boolean {
    return phase === 'checking' || phase === 'waiting' || phase === 'building';
}

export const BUILD_PHASE_LABEL: Record<BuildPhase, string> = {
    checking: 'Checking the rebuild',
    waiting: 'Rebuild queued',
    building: 'Building',
    live: 'Live: the rebuild finished',
    failed: 'Build failed. The site still shows the previous version; check the deploy in Netlify.',
    timeout: 'Still not finished after 10 minutes. Check the deploy in Netlify.',
    unavailable: '',
};
