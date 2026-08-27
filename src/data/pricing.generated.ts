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

export interface GeneratedPlan {
    lookupKey: string;
    label: string;
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
