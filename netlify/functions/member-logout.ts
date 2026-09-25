import { Handler, HandlerEvent } from '@netlify/functions';
import { clearMemberSessionCookie } from './_lib/memberSession';

/**
 * POST /api/member-logout — clears `ifn_member_session`.
 *
 * Touches the member cookie only. An operator signed into /admin in the same
 * browser stays signed in, which is the point of the two cookies being separate
 * (see `_lib/memberSession.ts`).
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': clearMemberSessionCookie(),
        },
        body: JSON.stringify({ ok: true }),
    };
};
