/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by `scripts/sync-pricing.mjs`, which runs before every build.
 * Stripe is the source of truth for what membership costs; edit the price
 * there, not here. Editing this file is overwritten on the next build.
 *
 * Source of this snapshot: Stripe test mode
 *
 * It is committed so that a build without Stripe credentials, or during a
 * Stripe outage, still produces a site with a real price rather than a blank.
 */

export interface GeneratedBenefit {
    id: string;
    title: string;
    description: string;
    included: string[];
}

export interface GeneratedPlan {
    lookupKey: string;
    label: string;
    benefits: GeneratedBenefit[];
    display: string;
    amountMinor: number;
    currency: string;
    interval: string;
    intervalCount: number;
}

export const GENERATED_PLANS: Record<string, GeneratedPlan> = {
    'founding-member': {
        lookupKey: 'founding_member_annual',
        label: "Founding Member",
        /** Benefit cards, from the Stripe product's metadata when it carries any. */
        benefits: [
            {
                    "id": "community",
                    "title": "Private member channel",
                    "description": "A members-only channel on Slack or Discord. Ask your question on a Tuesday instead of holding it until the next meetup, and get an answer from someone who has already been through the same step.",
                    "included": [
                            "Ask questions between meetups and get answers from other international founders",
                            "Share introductions, referrals and the names of people who actually helped you",
                            "Open from anywhere: you do not have to be in Austin that month"
                    ]
            },
            {
                    "id": "resources",
                    "title": "Resource library",
                    "description": "Written notes, templates and checklists built from six months of IFN meetups in Austin: the questions founders brought to the room, and the answers that turned out to work.",
                    "included": [
                            "Visa and immigration questions founders raised, and how they were handled",
                            "Opening a U.S. bank account and setting up a U.S. company as a non-citizen",
                            "Hiring and paying people across borders as a small, new company"
                    ]
            },
            {
                    "id": "office-hours",
                    "title": "Monthly office hours",
                    "description": "One members-only call every month. Bring whatever you are working through and get a direct answer on your own situation.",
                    "included": [
                            "One call every month, for members only",
                            "Held by the people who run IFN",
                            "Join from anywhere: the call is online"
                    ]
            }
    ],
        /** Display string, e.g. "$149". Formatted from Stripe's minor units. */
        display: "$149",
        /** Minor units exactly as Stripe holds them, for anything that must compute. */
        amountMinor: 14900,
        currency: 'usd',
        interval: 'year',
        intervalCount: 1,
    },
};

export const GENERATED_DEFAULT_PLAN = 'founding-member';
