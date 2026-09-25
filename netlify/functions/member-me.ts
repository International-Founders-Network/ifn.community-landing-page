import { Handler, HandlerEvent } from '@netlify/functions';
import { getMemberSession, type MemberSession } from './_lib/memberSession';
import { isMemberEntitled } from './_lib/memberEntitlement';

/**
 * GET /api/member-me — who is signed in, and are they entitled.
 *
 * 401 MEANS "NO SESSION", NOT "GO AWAY". `/members` treats a 401 as a soft
 * non-member: it renders the public call to action, with no error and no
 * sign-in demand. The status code is for the client, which needs to tell "no
 * session" apart from "session, no membership" so it can word the page
 * correctly. Do not turn this into a redirect or a hard wall.
 *
 * Entitlement is computed here, per request, rather than baked into the session
 * at sign-in, so a membership that lapses is reflected on the next page load.
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let session: MemberSession | null;
    try {
        session = await getMemberSession(event);
    } catch (error) {
        // getMemberSession throws only when MEMBER_SESSION_SECRET is unset. That
        // is an ops problem, not a visitor problem, and it must not render as a
        // broken page: report "no session" and log the cause.
        console.error('Member session check failed:', error instanceof Error ? error.message : 'unknown error');
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'not_authenticated' }),
        };
    }

    if (!session) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'not_authenticated' }),
        };
    }

    const entitlement = await isMemberEntitled(session.email);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            // Per-visitor and time-sensitive. A cached copy would tell the next
            // visitor they are signed in as someone else.
            'Cache-Control': 'private, no-store',
        },
        body: JSON.stringify({
            email: session.email,
            stub: session.stub,
            entitled: entitlement.entitled,
            status: entitlement.status,
            currentPeriodEnd: entitlement.currentPeriodEnd,
            reason: entitlement.reason,
        }),
    };
};
