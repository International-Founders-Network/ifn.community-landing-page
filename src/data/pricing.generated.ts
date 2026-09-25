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
 *
 * 2026-09-24 copy pack: public label is Membership (not Founding Member);
 * channel = private member channel; call = monthly members-only call.
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
        label: "Membership",
        /** Benefit cards, from the Stripe product's metadata when it carries any. */
        benefits: [
            {
                    "id": "community",
                    "title": "Private member channel",
                    "description": "Ask mid-week; get answers from other international founders. Share intros and names that actually helped. Remote OK. The platform launches after you join. We do not name a tool until it is live.",
                    "included": [
                            "Ask questions between meetups and get answers from other international founders",
                            "Share introductions, referrals and the names of people who actually helped you",
                            "Open from anywhere: you do not have to be in Austin that month"
                    ]
            },
            {
                    "id": "resources",
                    "title": "Guides as they publish",
                    "description": "Library is in progress. Members get first access when each guide ships. We do not claim a finished library today.",
                    "included": [
                            "First access to guides as they publish, starting with the questions founders raise most",
                            "Topics in progress: U.S. banking and forming a U.S. company as a non-citizen",
                            "Topics in progress: hiring and paying across borders as a small, new company"
                    ]
            },
            {
                    "id": "office-hours",
                    "title": "Monthly members-only call",
                    "description": "One online call per month for members. No fixed day, time, or named host on the site. Details land in the private member channel when the next call is set.",
                    "included": [
                            "One call every month, for members only",
                            "Details shared in the private member channel when scheduled",
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
