import { Handler, HandlerEvent } from '@netlify/functions';
import { createMemberSessionCookie } from './_lib/memberSession';

/**
 * POST /api/member-auth-stub — mint a member session for any email, on previews.
 *
 * THIS IS A PLACEHOLDER FOR A SIGN-IN MECHANISM THAT DOES NOT EXIST YET, and it
 * has an expiry date. Open question 1 in MEMBER-CENTER-IA.md (Google sign-in,
 * emailed magic link, or the Stripe customer portal) is unanswered; until it is
 * answered there is no way to put a real member in front of the entitled layout
 * to check that it renders. This endpoint is that way, and it is the
 * server-side complement to `?stubMember=1` on the page.
 *
 * IT MUST BE DELETED IN THE SAME COMMIT THAT LANDS REAL SIGN-IN. Not
 * deprecated, not left behind a flag that defaults off: deleted, along with
 * `ALLOW_MEMBER_STUB_AUTH`, `?stubMember=1` and `STUB_MEMBER_DEFAULT`. An
 * endpoint that mints a session for an arbitrary email is a complete
 * authentication bypass the day someone sets the flag on production to debug
 * something and forgets.
 *
 * TWO THINGS KEEP IT FROM BEING ONE TODAY:
 *
 *   1. It refuses to run in the production context unless
 *      ALLOW_MEMBER_STUB_AUTH is explicitly "true". Netlify sets CONTEXT to
 *      `production` for the live site and to `deploy-preview` / `branch-deploy`
 *      / `dev` everywhere else, so the default is off exactly where it matters.
 *
 *   2. The session it mints is marked `stub: true`, and every gated endpoint
 *      refuses stub sessions outright. So even on a preview that shares the
 *      production database, posting a real member's address here gets you the
 *      entitled LAYOUT and never a file. That is the whole point: the preview
 *      affordance cannot leak a PDF even if the entitlement check says yes.
 */

function isStubAuthAllowed(): boolean {
    if (process.env.ALLOW_MEMBER_STUB_AUTH === 'true') return true;

    const context = process.env.CONTEXT;
    return context === 'dev' || context === 'deploy-preview' || context === 'branch-deploy';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!isStubAuthAllowed()) {
        // 404, not 403: on production this endpoint should look like it is not
        // there, because as far as anyone outside IFN is concerned it is not.
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'not_found' }),
        };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        const email = typeof data.email === 'string' ? data.email.trim() : '';

        if (!EMAIL_PATTERN.test(email)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'invalid_email' }),
            };
        }

        const cookie = await createMemberSessionCookie(email, { stub: true });

        /** No email address in the log. See the note in contact.ts. */
        console.log('Minted a STUB member session (preview only)');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
            body: JSON.stringify({ email, stub: true }),
        };
    } catch (error) {
        console.error('Stub member auth failed:', error instanceof Error ? error.message : 'unknown error');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'stub_auth_failed' }),
        };
    }
};
