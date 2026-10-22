import { Handler, HandlerEvent } from '@netlify/functions';
import { getSessionEmail } from './_lib/auth';
import { buildStatusConfig, fetchLatestProductionDeploy } from './_lib/netlifyDeploys';

/**
 * Admin: state of the latest production deploy, polled after a blog action
 * fires the build hook. Allowlisted session required, like every admin-*
 * function. Without an API token and site id it answers { available: false }
 * and Admin falls back to the build hook result alone.
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

    const email = await getSessionEmail(event);
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
    if (!email) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated' }) };

    const config = buildStatusConfig();
    const body = config ? await fetchLatestProductionDeploy(config) : { available: false };
    return { statusCode: 200, headers, body: JSON.stringify(body) };
};
