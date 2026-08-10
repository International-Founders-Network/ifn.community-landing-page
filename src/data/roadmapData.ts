export interface RoadmapTier {
    tier: string;
    stage: string;
    includes: string;
}

export const ROADMAP_TIERS: RoadmapTier[] = [
    {
        tier: 'Free / open',
        stage: 'v2 (now)',
        includes: 'Monthly meetup, public resource hub content',
    },
    {
        tier: 'Paid Membership',
        stage: 'v2 (now)',
        includes: 'Private Slack/Discord, informal resource library, monthly office hours. $99-$149/yr',
    },
    {
        tier: 'IFN Pro',
        stage: 'v3 (Month 13-36)',
        includes: 'Searchable investor database, Delaware flip toolkit, comp benchmarks. Built out once subscribers cross 150-650',
    },
    {
        tier: 'Verified Vendor directory',
        stage: 'v3 (Month 13-36)',
        includes: 'Real vendor directory with Calendly booking, replacing the v2 partners page logo list',
    },
    {
        tier: 'Platform migration',
        stage: 'v3 (Month 13-36)',
        includes: 'Slack/Discord → Circle.so once subscribers cross ~150-200',
    },
];
