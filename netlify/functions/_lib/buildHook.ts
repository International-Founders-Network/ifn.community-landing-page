export type BuildHookResult = 'triggered' | 'not-configured' | 'failed';

/**
 * POST the Netlify build hook so the next deploy re-runs compile-blog with the
 * current Neon overlays (blog_editorial, link_allowlist). Same pattern as
 * stripe-webhook: a missing hook is logged, not thrown, because the overlay
 * write that preceded it already succeeded.
 */
export async function triggerBuildHook(reason: string): Promise<BuildHookResult> {
    const hook = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hook) {
        console.warn(`${reason}: NETLIFY_BUILD_HOOK_URL is not set; not rebuilding.`);
        return 'not-configured';
    }
    try {
        const response = await fetch(hook, { method: 'POST' });
        if (!response.ok) {
            console.error(`${reason}: build hook returned ${response.status}.`);
            return 'failed';
        }
        console.log(`${reason}: triggered a Netlify rebuild.`);
        return 'triggered';
    } catch (error) {
        console.error(`${reason}: build hook request failed:`, error);
        return 'failed';
    }
}
