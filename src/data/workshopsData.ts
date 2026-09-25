/**
 * Workshops page copy — Venkat-approved pack 2026-09-24-workshops-v2.
 * Pillar headings and workshop TYPES are locked. Dates/prices live on Luma.
 */

export interface WorkshopType {
    label: string;
}

export interface WorkshopPillar {
    id: string;
    title: string;
    summary: string;
    types: WorkshopType[];
}

export const WORKSHOP_PILLARS: WorkshopPillar[] = [
    {
        id: 'immigration-visas',
        title: 'Immigration / visas & status',
        summary:
            'Stay legal while you build. Sessions for founders navigating status, dependents, and employer vs founder paths. Not a law firm intake.',
        types: [
            { label: 'Visa path map for founders (O-1, H-1B, E-2, and when to talk to counsel)' },
            { label: 'Status changes while raising or incorporating' },
            { label: 'Dependents, travel, and work authorization pitfalls' },
            { label: 'Employer sponsorship vs founder-led immigration strategy' },
        ],
    },
    {
        id: 'banking-finance',
        title: 'Banking & finance',
        summary: 'Open accounts, move money, and keep books clean enough for a raise or a loan.',
        types: [
            { label: 'US business banking for non-residents (what banks ask for)' },
            { label: 'Personal vs entity banking while you land' },
            { label: 'Founder bookkeeping that survives diligence' },
            { label: 'Credit, wire, and multi-currency basics for early teams' },
        ],
    },
    {
        id: 'housing-landing',
        title: 'Housing & landing in Austin',
        summary:
            'Get a roof, a neighborhood, and a first 90 days that do not wreck the company.',
        types: [
            { label: 'Lease vs temporary housing when your status is in motion' },
            { label: 'Neighborhoods and commute tradeoffs for founders' },
            { label: 'First 90 days in Austin checklist (docs, utilities, school if needed)' },
            { label: 'Building a local ops stack (mail, phone, coworking)' },
        ],
    },
    {
        id: 'hiring-ops',
        title: 'Hiring & ops',
        summary:
            'First hires, contractors, and the ops that keep a remote-or-hybrid team on track.',
        types: [
            { label: 'First US hire vs contractor (when each breaks)' },
            { label: 'Offer letters, equity basics, and payroll setup for small teams' },
            { label: 'Ops cadence for a 2–10 person company' },
            { label: 'Vendors and tools that matter in year one (and which to skip)' },
        ],
    },
    {
        id: 'fundraising',
        title: 'Fundraising',
        summary:
            'Raise with a story US investors understand, without pretending every path is VC.',
        types: [
            { label: 'Pitch narrative for immigrant founders (market, team, status risk)' },
            { label: 'Angels vs seed in Austin / US: what “ready” looks like' },
            { label: 'Data room hygiene before you ask for a meeting' },
            { label: 'Non-dilutive and alternative capital options worth knowing' },
        ],
    },
    {
        id: 'gtm-us-market',
        title: 'Go-to-market / US market entry',
        summary: 'Sell into the US without guessing the channel or the buyer.',
        types: [
            { label: 'First US customer playbook (ICP, outbound, and warm intros)' },
            { label: 'Pricing and packaging for a US buyer' },
            { label: 'Partners and channel vs direct: when each wins' },
            { label: 'Localization and trust signals that matter for international products' },
        ],
    },
    {
        id: 'entity-tax-formation',
        title: 'Entity, tax & formation',
        summary:
            'Pick a structure, stay compliant, and know when to call a CPA or attorney.',
        types: [
            { label: 'LLC vs C-corp for international founders (tradeoffs, not dogma)' },
            { label: 'EIN, state registration, and registered agent basics' },
            { label: 'Sales tax and nexus: what trips early teams up' },
            { label: 'Cap table and equity setup before the first hire or raise' },
        ],
    },
];
