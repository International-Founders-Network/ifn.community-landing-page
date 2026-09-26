/**
 * Admin → Links: the outbound-link allowlist (openspec/changes/admin-ux-blog-links-review).
 *
 * Seed rows are getOutboundLinkRows() from src/data/linkAllowlistData.ts, the
 * same rows the Links tab has always shown. The Neon table `link_allowlist`
 * overrides status and allowOutboundLink per row id, written by an allowlisted
 * admin through admin-links. Only sponsors and potentials that have a website
 * can be overridden. A partner with a website is always verified and allowed,
 * and a row with no website has nothing to link to.
 *
 * Two readers, one merge: admin-links serves the merged rows, and
 * scripts/compile-blog.mjs loads this module through Vite's runnerImport to
 * decide which outbound anchors survive in compiled post HTML. Approving a row
 * therefore changes published pages only on the next build.
 */
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getOutboundLinkRows, type OutboundLinkRow } from '../../../src/data/linkAllowlistData';
import type { LinkEntityStatus } from '../../../src/data/sponsorsData';

export const LINK_STATUSES = ['draft', 'verified', 'blocked'] as const;

export const LINK_ACTIONS = ['approve', 'hold'] as const;
export type LinkAction = (typeof LINK_ACTIONS)[number];

export interface LinkOverlayRow {
    id: string;
    status: LinkEntityStatus;
    allowOutbound: boolean;
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface AdminLinkRow extends OutboundLinkRow {
    /** True for sponsors and potentials with a website: Approve / Hold apply. */
    actionable: boolean;
    /** 'overlay' when Neon holds a row for this id, else 'seed'. */
    source: 'overlay' | 'seed';
    updatedAt: string | null;
    updatedBy: string | null;
}

export function loadLinkSeed(): OutboundLinkRow[] {
    return getOutboundLinkRows();
}

export function isActionable(row: Pick<OutboundLinkRow, 'kind' | 'website'>): boolean {
    return (row.kind === 'sponsor' || row.kind === 'potential') && Boolean(row.website);
}

/**
 * Overlay wins for status and allowOutboundLink only. Outbound still needs all
 * three of allow + verified + website, exactly as getOutboundLinkRows computes
 * it for the seed, so a stray overlay row can never open a link on its own.
 */
export function mergeLinkOverlay(seed: OutboundLinkRow[], overlay: LinkOverlayRow[]): AdminLinkRow[] {
    const byId = new Map(overlay.map((row) => [row.id, row]));
    return seed.map((row) => {
        const actionable = isActionable(row);
        const override = actionable ? byId.get(row.id) : undefined;
        if (!override) return { ...row, actionable, source: 'seed', updatedAt: null, updatedBy: null };
        return {
            ...row,
            status: override.status,
            allowOutboundLink: override.allowOutbound && override.status === 'verified' && Boolean(row.website),
            actionable,
            source: 'overlay',
            updatedAt: override.updatedAt,
            updatedBy: override.updatedBy,
        };
    });
}

export type LinkTransition =
    | { ok: true; status: LinkEntityStatus; allowOutbound: boolean }
    | { ok: false; error: string };

/**
 * approve: verified + outbound allowed.
 * hold: outbound off, status back to draft. A blocked row stays blocked; hold
 * never softens a block.
 */
export function applyLinkAction(
    row: Pick<OutboundLinkRow, 'kind' | 'website' | 'status'>,
    action: LinkAction
): LinkTransition {
    if (row.kind === 'partner') {
        return { ok: false, error: 'Partners are managed in src/data/partnersData.ts, not from Admin.' };
    }
    if (!row.website) {
        return { ok: false, error: 'This row has no website, so there is nothing to allow. Add one in the data file first.' };
    }
    switch (action) {
        case 'approve':
            return { ok: true, status: 'verified', allowOutbound: true };
        case 'hold':
            return { ok: true, status: row.status === 'blocked' ? 'blocked' : 'draft', allowOutbound: false };
        default:
            return { ok: false, error: 'Unknown action.' };
    }
}

type Sql = NeonQueryFunction<false, false>;

export async function ensureLinkTable(sql: Sql): Promise<void> {
    // Mirrors db/migrations/05_link_allowlist.sql; keep the two in step.
    await sql`
        CREATE TABLE IF NOT EXISTS link_allowlist (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL CHECK (status IN ('draft','verified','blocked')),
            allow_outbound BOOLEAN NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_by TEXT NULL
        )
    `;
}

function toIso(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function loadLinkOverlay(sql: Sql): Promise<LinkOverlayRow[]> {
    const rows = (await sql`SELECT id, status, allow_outbound, updated_at, updated_by FROM link_allowlist`) as Record<
        string,
        unknown
    >[];
    return rows
        .filter((row) => LINK_STATUSES.includes(row.status as LinkEntityStatus))
        .map((row) => ({
            id: String(row.id),
            status: row.status as LinkEntityStatus,
            allowOutbound: row.allow_outbound === true,
            updatedAt: toIso(row.updated_at),
            updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
        }));
}

export async function upsertLinkOverlay(
    sql: Sql,
    id: string,
    status: LinkEntityStatus,
    allowOutbound: boolean,
    updatedBy: string
): Promise<void> {
    await sql`
        INSERT INTO link_allowlist (id, status, allow_outbound, updated_at, updated_by)
        VALUES (${id}, ${status}, ${allowOutbound}, now(), ${updatedBy})
        ON CONFLICT (id) DO UPDATE
        SET status = EXCLUDED.status,
            allow_outbound = EXCLUDED.allow_outbound,
            updated_at = now(),
            updated_by = EXCLUDED.updated_by
    `;
}
