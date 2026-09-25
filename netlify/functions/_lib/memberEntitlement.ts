import { neon } from '@neondatabase/serverless';

/**
 * ENTITLEMENT: has this person paid? Separate from the session check in
 * `./memberSession.ts` on purpose, so a valid session belonging to a lapsed
 * member returns false rather than a PDF.
 *
 * THE SOURCE IS THE `memberships` TABLE, NOT A LIVE STRIPE CALL.
 * `netlify/functions/stripe-webhook.ts` already writes subscription lifecycle
 * events into that table (schema: `db/migrations/03_memberships.sql`), so the
 * row is normally current within seconds of a change in Stripe.
 *
 *   SELECT status, current_period_end
 *     FROM memberships
 *    WHERE lower(email) = lower($1)
 *
 * THE DRIFT THIS ACCEPTS, stated plainly: if a webhook delivery is missed or
 * the endpoint is down, this table is wrong until the next event for that
 * subscription arrives, and nothing here notices. A cancelled member keeps
 * access; a renewed member whose renewal event was dropped keeps access too,
 * because status is read as authoritative and `current_period_end` is reported
 * but not enforced. Enforcing it would trade one failure for a worse one:
 * locking out a paying member whose renewal webhook was dropped. Closing the
 * gap properly needs a reconciliation job that re-reads Stripe on a schedule
 * (open question 2 in MEMBER-CENTER-IA.md). What this must NOT become is a
 * Stripe API call per page view: that puts a third-party outage between a
 * member and a file they already bought.
 *
 * `isAllowedEmail` from `./auth.ts` is NOT this check and is deliberately not
 * imported. It answers "is this person an IFN operator", which is a different
 * and almost disjoint set of people.
 */

/**
 * The statuses that mean "entitled right now", in Stripe's own vocabulary.
 *
 * `past_due` is DELIBERATELY EXCLUDED for thin v1. Stripe sets it when a
 * renewal charge fails and retries are still scheduled, so the member may well
 * come back. Including it would be a defensible grace period, but a grace
 * period needs an expiry and a dunning email to be honest, and IFN has neither
 * wired. Excluding it is the conservative half of that pair and is trivially
 * reversible once dunning exists. `canceled`, `unpaid`, `incomplete` and
 * `incomplete_expired` are not entitlements under any reading.
 */
const ENTITLING_STATUSES = new Set(['active', 'trialing']);

export interface MemberEntitlement {
    entitled: boolean;
    /** The Stripe status the decision was made on, when a row was found. */
    status?: string;
    /** ISO 8601, or null when Stripe sent no period end. Reported, not enforced. */
    currentPeriodEnd?: string | null;
    /**
     * Machine-readable cause when `entitled` is false. Safe to return to the
     * browser: it names a configuration or subscription state, never a secret.
     */
    reason?: string;
}

interface MembershipRow {
    status: string | null;
    current_period_end: string | Date | null;
}

function toIso(value: string | Date | null): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Answers whether `email` currently has a paid membership.
 *
 * Never throws and never leaks a connection string or a Stripe id: every
 * failure path returns `{ entitled: false, reason }` so a caller can only ever
 * fail closed.
 */
export async function isMemberEntitled(email: string): Promise<MemberEntitlement> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
        return { entitled: false, reason: 'no_email' };
    }

    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    if (!databaseUrl) {
        // Honest answer rather than an invented one. A deploy preview without a
        // database says "not configured", it does not pretend anybody is a member.
        return { entitled: false, reason: 'database_not_configured' };
    }

    try {
        const sql = neon(databaseUrl);

        // No CREATE TABLE IF NOT EXISTS here, unlike the write paths. A read that
        // silently creates an empty table would report every member as lapsed and
        // look like a working feature while doing so; a missing table should
        // surface as an error instead.
        const rows = (await sql`
            SELECT status, current_period_end
            FROM memberships
            WHERE lower(email) = ${normalized}
        `) as MembershipRow[];

        if (rows.length === 0) {
            return { entitled: false, reason: 'no_membership_record' };
        }

        // One email can own several subscription rows: an earlier cancelled year
        // plus the current one. Any entitling row entitles the person, and the
        // one with the furthest period end is the one worth reporting.
        const entitling = rows
            .filter((row) => row.status !== null && ENTITLING_STATUSES.has(row.status))
            .sort((a, b) => {
                const left = toIso(a.current_period_end) ?? '';
                const right = toIso(b.current_period_end) ?? '';
                return right.localeCompare(left);
            });

        if (entitling.length > 0) {
            const best = entitling[0];
            return {
                entitled: true,
                status: best.status ?? undefined,
                currentPeriodEnd: toIso(best.current_period_end),
            };
        }

        const latest = rows[0];
        return {
            entitled: false,
            status: latest.status ?? undefined,
            currentPeriodEnd: toIso(latest.current_period_end),
            reason: 'membership_not_active',
        };
    } catch (error) {
        // No email and no connection details in the log, matching contact.ts.
        console.error('Membership lookup failed:', error instanceof Error ? error.message : 'unknown error');
        return { entitled: false, reason: 'lookup_failed' };
    }
}
