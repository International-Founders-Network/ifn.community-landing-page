import { Handler, HandlerEvent } from '@netlify/functions';
import { getMemberSession, type MemberSession } from './_lib/memberSession';
import { isMemberEntitled } from './_lib/memberEntitlement';
import { isMemberDownloadId } from '../../src/data/memberDownloads';

/**
 * GET /api/member-download?id=<guide> — the only door to a member PDF.
 *
 * THE FILES DO NOT EXIST YET, so this endpoint currently ends in 503 for
 * everyone, including a genuinely entitled member. That is deliberate and it is
 * the honest answer: open question 3 in MEMBER-CENTER-IA.md (where the PDFs
 * live) is unanswered, and a 200 with a placeholder body would be a lie the
 * page would happily render as a working download.
 *
 * WHAT IS ALREADY REAL is the order of the checks, because that order is the
 * part that is expensive to get wrong later:
 *
 *   1. session  — 401. Signature only, `_lib/memberSession.ts`.
 *   2. stub     — 403. A preview session can never produce a file.
 *   3. entitled — 403. Re-checked per request, `_lib/memberEntitlement.ts`.
 *   4. storage  — 503. Configured? Implemented? Neither yet.
 *
 * Session and entitlement are two steps, not one, so that a lapsed member with
 * a perfectly valid cookie gets 403 rather than a guide.
 *
 * WHAT MUST NEVER HAPPEN HERE: serving from a public path. Nothing under
 * `dist/` or `public/` may hold these files. A gated PDF at
 * `/assets/visa-pathways.pdf` is one shared link away from being a public
 * download, and no check in this file would be involved.
 */

/**
 * Where the gated PDFs live, once they live anywhere. Names, not values: IFN
 * has no object store wired for this yet and inventing credentials would make
 * the gap invisible.
 *
 *   MEMBER_PDF_BUCKET         the bucket or Netlify Blobs store holding the files
 *   MEMBER_PDF_SIGNING_SECRET the key used to mint short-lived download URLs
 *
 * Both are documented in `.env.example` and in MEMBER-CENTER-IA.md.
 */
function isPdfStorageConfigured(): boolean {
    return Boolean(process.env.MEMBER_PDF_BUCKET && process.env.MEMBER_PDF_SIGNING_SECRET);
}

function json(statusCode: number, payload: Record<string, unknown>) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
        body: JSON.stringify(payload),
    };
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let session: MemberSession | null;
    try {
        session = await getMemberSession(event);
    } catch (error) {
        console.error('Member session check failed:', error instanceof Error ? error.message : 'unknown error');
        return json(401, { error: 'not_authenticated' });
    }

    if (!session) {
        return json(401, { error: 'not_authenticated' });
    }

    if (session.stub) {
        // The preview door stops here. See member-auth-stub.ts.
        return json(403, { error: 'stub_session_cannot_download' });
    }

    const id = event.queryStringParameters?.id || '';
    if (!isMemberDownloadId(id)) {
        // Checked after authentication so an anonymous request cannot use this
        // endpoint to enumerate which guide ids exist.
        return json(400, { error: 'unknown_download' });
    }

    const entitlement = await isMemberEntitled(session.email);
    if (!entitlement.entitled) {
        return json(403, { error: 'not_entitled', reason: entitlement.reason });
    }

    if (!isPdfStorageConfigured()) {
        return json(503, { error: 'pdf_not_deployed', id, reason: 'storage_not_configured' });
    }

    /**
     * TODO(member-pdf): mint a short-lived signed URL for `id` from
     * MEMBER_PDF_BUCKET using MEMBER_PDF_SIGNING_SECRET and return
     * `{ url, expiresAt }`, or 302 to it.
     *
     * Two decisions belong to open question 3 and are not being made here by
     * accident: how long the URL lives, and whether it is bound to the member
     * (so a leaked link is traceable to whoever shared it). Both change the
     * shape of what this returns.
     */
    return json(503, { error: 'pdf_not_deployed', id, reason: 'delivery_not_implemented' });
};
