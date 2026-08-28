import { GENERATED_PLANS, GENERATED_DEFAULT_PLAN } from './pricing.generated';

export interface MembershipBenefit {
    id: string;
    title: string;
    description: string;
    /** Concrete, checkable specifics: what a paying member actually receives. */
    included: string[];
}

/**
 * THE PRICE COMES FROM STRIPE. `scripts/sync-pricing.mjs` runs before every
 * build, reads the allowlist in `plans.json`, and writes
 * `pricing.generated.ts`. Change the price in Stripe; nothing here needs
 * editing, and the two can no longer disagree.
 *
 * THE PRIVATE PRICE, RECORDED HERE ON PURPOSE SO NOBODY "RESTORES" IT.
 * A second annual price of $99 exists. It is a warm-lead price the founder
 * sends by email to roughly forty selected people, and it is deliberately not
 * public: it is not a constant here, it is not a tier, it is not rendered on
 * any page, and it must not be reintroduced as any of those. There used to be
 * a `MEMBERSHIP_PRICE_ATTENDEE` export and a two-entry `MEMBERSHIP_TIERS`
 * array feeding a two-card price grid on `/membership`; both were removed for
 * this reason. A page that publishes a second, lower price is also a page that
 * invites every reader to ask for it. Pulling from Stripe does not weaken this:
 * the sync only ever reads the lookup keys listed in `plans.json`, so a price
 * absent from that list can be neither printed nor bought. This comment is the
 * only place in `src/` that carries the figure, and comments are stripped by
 * the production minifier, so it does not ship.
 */
const DEFAULT = GENERATED_PLANS[GENERATED_DEFAULT_PLAN];

/** The published annual price as displayed, e.g. "$149". From Stripe. */
export const MEMBERSHIP_PRICE_STANDARD = DEFAULT.display;

/** Minor units and currency, for anything that must compute rather than print. */
export const MEMBERSHIP_PRICE_MINOR = DEFAULT.amountMinor;
export const MEMBERSHIP_PRICE_CURRENCY = DEFAULT.currency.toUpperCase();

/**
 * The public tier name. Deliberately NOT taken from Stripe: the Stripe product
 * is called "IFN Membership", which is a billing label, while this is the
 * marketing name the site has committed to. Syncing it would silently rename
 * the offer on the page the next time someone tidied the Stripe catalogue.
 */
export const MEMBERSHIP_TIER_NAME = DEFAULT.label;

/**
 * The benefit cards. Read from the Stripe product's metadata when it carries
 * any, falling back to `benefits.json` when it does not — so an unseeded Stripe
 * account still renders real copy rather than an empty section.
 *
 * Seed Stripe from the fallback with `node scripts/push-offer-to-stripe.mjs`.
 */
export const MEMBERSHIP_BENEFITS: MembershipBenefit[] = DEFAULT.benefits;
