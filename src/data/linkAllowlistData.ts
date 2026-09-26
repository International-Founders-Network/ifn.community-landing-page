/**
 * Aggregated outbound-link rows for Admin Links tab and future blog gate.
 * Partners with a website default to verified + allowOutboundLink.
 * Sponsors / potentials use their own status and allowOutboundLink flags.
 */

import { PARTNERS } from './partnersData';
import { SPONSORS, type LinkEntityStatus } from './sponsorsData';
import { POTENTIALS } from './potentialsData';

export type OutboundLinkKind = 'partner' | 'sponsor' | 'potential';

export interface OutboundLinkRow {
    id: string;
    name: string;
    kind: OutboundLinkKind;
    website?: string;
    status: LinkEntityStatus;
    notes?: string;
    allowOutboundLink: boolean;
}

export function getOutboundLinkRows(): OutboundLinkRow[] {
    const partners: OutboundLinkRow[] = PARTNERS.map((p) => ({
        id: `partner-${p.id}`,
        name: p.name,
        kind: 'partner' as const,
        website: p.website,
        status: (p.website ? 'verified' : 'draft') as LinkEntityStatus,
        notes: p.website
            ? `From partnersData (${p.category}).`
            : 'No website in partnersData — do not invent a URL.',
        allowOutboundLink: Boolean(p.website),
    }));

    const sponsors: OutboundLinkRow[] = SPONSORS.map((s) => ({
        id: `sponsor-${s.id}`,
        name: s.name,
        kind: 'sponsor' as const,
        website: s.website,
        status: s.status,
        notes: s.notes,
        allowOutboundLink: s.allowOutboundLink && s.status === 'verified' && Boolean(s.website),
    }));

    const potentials: OutboundLinkRow[] = POTENTIALS.map((p) => ({
        id: `potential-${p.id}`,
        name: p.name,
        kind: 'potential' as const,
        website: p.website,
        status: p.status,
        notes: p.notes,
        allowOutboundLink: p.allowOutboundLink && p.status === 'verified' && Boolean(p.website),
    }));

    return [...partners, ...sponsors, ...potentials];
}

/** Hostnames Content may use today (partners with websites). Potentials are NOT included until verified. */
export function allowedPartnerOutboundHosts(): string[] {
    return getOutboundLinkRows()
        .filter((r) => r.kind === 'partner' && r.allowOutboundLink && r.website)
        .map((r) => {
            try {
                return new URL(r.website!).hostname.replace(/^www\./, '');
            } catch {
                return '';
            }
        })
        .filter(Boolean);
}
