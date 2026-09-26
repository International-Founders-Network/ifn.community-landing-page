/**
 * Potentials: editorial outbound candidates that are NOT partners/sponsors.
 * A Potential is permission to link after Venkat verifies — never an endorsement.
 * Week 1 Content scrubbed Cooley / Mercury / OtoCo from posts; they sit here as
 * draft for Venkat review (allowOutboundLink false until verified).
 */

import type { LinkEntityStatus } from './sponsorsData';

export interface Potential {
    id: string;
    name: string;
    website?: string;
    status: LinkEntityStatus;
    notes?: string;
    allowOutboundLink: boolean;
}

export const POTENTIALS: Potential[] = [
    {
        id: 'cooley-foreign-founders-visas-corporate-2025',
        name: 'Cooley — foreign founders visas & corporate structure (2025 note)',
        website:
            'https://www.cooley.com/news/insight/2025/2025-06-03-what-foreign-founders-need-to-know-about-us-visas-and-corporate-structure',
        status: 'draft',
        allowOutboundLink: false,
        notes:
            'Scrubbed from Week 1 forming + visa drafts. Orientation-only if ever verified; not IFN counsel. Requires Venkat review + editorial disclosure before allowOutboundLink.',
    },
    {
        id: 'mercury-open-us-bank-account',
        name: 'Mercury — open US bank account remotely',
        website: 'https://mercury.com/blog/open-us-bank-account',
        status: 'draft',
        allowOutboundLink: false,
        notes:
            'Scrubbed from Week 1 banking draft. Product writeup — not endorsement. Do not verify without disclosure language.',
    },
    {
        id: 'otoco-foreign-owned-llc-banking-2026',
        name: 'OtoCo — foreign-owned LLC banking guide (2026)',
        website: 'https://blog.otoco.io/how-to-open-us-bank-account-foreign-owned-llc-2026/',
        status: 'draft',
        allowOutboundLink: false,
        notes:
            'Scrubbed from Week 1 banking draft. Formation-service guide — not endorsement. Do not verify without disclosure language.',
    },
];
