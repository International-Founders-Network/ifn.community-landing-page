/**
 * Latest production deploy, for Admin's "is the rebuild done yet" line.
 * Reads the Netlify API with a personal access token when one is configured
 * (NETLIFY_API_TOKEN, else NETLIFY_AUTH_TOKEN). Only a whitelisted summary
 * leaves this module: never the token, never the raw deploy payload.
 */

export interface DeploySummary {
    /** Netlify's deploy state: new, enqueued, building, processing, ready, error, ... */
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

function str(value: unknown): string | null {
    return typeof value === 'string' && value ? value : null;
}

export function summarizeDeploy(raw: unknown): DeploySummary | null {
    if (!raw || typeof raw !== 'object') return null;
    const d = raw as Record<string, unknown>;
    const deployId = str(d.id);
    const state = str(d.state);
    if (!deployId || !state) return null;
    return {
        state,
        createdAt: str(d.created_at),
        publishedAt: str(d.published_at),
        deployId,
        context: str(d.context),
    };
}

export function buildStatusConfig(env: NodeJS.ProcessEnv = process.env): { token: string; siteId: string } | null {
    const token = env.NETLIFY_API_TOKEN || env.NETLIFY_AUTH_TOKEN;
    const siteId = env.SITE_ID || env.NETLIFY_SITE_ID;
    return token && siteId ? { token, siteId } : null;
}

export async function fetchLatestProductionDeploy(
    config: { token: string; siteId: string },
    fetchImpl: typeof fetch = fetch
): Promise<BuildStatusResponse> {
    const url =
        `https://api.netlify.com/api/v1/sites/${encodeURIComponent(config.siteId)}/deploys` +
        '?per_page=1&production=true';
    try {
        const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${config.token}` } });
        if (!res.ok) {
            console.error(`Netlify deploys API returned ${res.status}.`);
            return { available: true, error: 'Could not read the deploy status from Netlify.' };
        }
        const list = (await res.json()) as unknown;
        return { available: true, deploy: Array.isArray(list) ? summarizeDeploy(list[0]) : null };
    } catch (error) {
        console.error('Netlify deploys API request failed:', error);
        return { available: true, error: 'Could not reach Netlify for the deploy status.' };
    }
}
