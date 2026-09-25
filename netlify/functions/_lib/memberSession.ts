/**
 * MEMBER SESSION NAMING. Scaffold only: no sign, no verify, no handler reads
 * this yet. It exists so that the first function to gate a member download
 * cannot reach for `SESSION_COOKIE_NAME` out of convenience.
 *
 * WHY A SECOND COOKIE RATHER THAN REUSING ifn_admin_session:
 *
 *   1. The admin cookie's verification path is `getSessionEmail` in
 *      `./auth.ts`, and that function ends with `isAllowedEmail(email)`. Any
 *      member session carried in that cookie either fails that check or forces
 *      the check to be loosened, and loosening it would grant dashboard access
 *      to every paying member. The two cookies keep the two questions apart:
 *      "is this an IFN operator" and "has this person paid".
 *
 *   2. Revoking one should not revoke the other. Rotating the admin secret
 *      after a laptop is lost should not sign out 40 members mid-download.
 *
 *   3. The lifetimes differ. An operator session can be short; a member session
 *      wants to last about as long as the subscription.
 *
 * The plumbing in `./auth.ts` (HS256 sign, jwtVerify, httpOnly + secure +
 * sameSite cookie, Google id-token verification against Google's JWKS) is the
 * right model to copy. The ALLOWLIST is not; see MEMBER-CENTER-IA.md.
 */

/** The member session cookie. Deliberately not `ifn_admin_session`. */
export const MEMBER_SESSION_COOKIE_NAME = 'ifn_member_session';

/**
 * TODO(member-session): once the sign-in mechanism is chosen (see the open
 * question in MEMBER-CENTER-IA.md), add here:
 *
 *   - createMemberSessionCookie(email) / clearMemberSessionCookie()
 *   - getMemberSessionEmail(event): signature check ONLY, no entitlement
 *   - a separate MEMBER_SESSION_SECRET env var, not ADMIN_SESSION_SECRET
 *
 * Entitlement stays a separate call against Stripe subscription state, so that
 * a valid session for a lapsed member returns false rather than a PDF.
 */
