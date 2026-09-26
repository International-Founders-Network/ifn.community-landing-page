/**
 * Sponsors for outbound-link gating (Admin Links tab).
 * Public Sponsors marketing surfaces are separate; this list is operator-facing.
 * Only rows with status 'verified' (or allowOutboundLink true) may be linked from blog.
 */

export type LinkEntityStatus = 'draft' | 'verified' | 'blocked';

export interface Sponsor {
    id: string;
    name: string;
    website?: string;
    status: LinkEntityStatus;
    notes?: string;
    /** When true AND website set AND status verified, Content may outbound-link. */
    allowOutboundLink: boolean;
}

/** Empty until Venkat seeds verified sponsors. */
export const SPONSORS: Sponsor[] = [];
