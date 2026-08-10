export interface MembershipBenefit {
    id: string;
    title: string;
    description: string;
    /** Concrete, checkable specifics: what a paying member actually receives. */
    included: string[];
}

export interface MembershipTier {
    id: string;
    price: string;
    name: string;
    who: string;
}

/**
 * Confirmed annual pricing: the single source of truth for every surface.
 * $149/year is the public price; $99/year is the price for people already on
 * the IFN attendee list. Both are billed once a year. Do not present any other
 * figure, and do not imply monthly billing.
 */
export const MEMBERSHIP_PRICE_STANDARD = '$149';
export const MEMBERSHIP_PRICE_ATTENDEE = '$99';

export const MEMBERSHIP_TIERS: MembershipTier[] = [
    {
        id: 'founding',
        price: MEMBERSHIP_PRICE_STANDARD,
        name: 'Founding Member',
        who: 'For founders joining IFN for the first time.',
    },
    {
        id: 'attendee',
        price: MEMBERSHIP_PRICE_ATTENDEE,
        name: 'Already on the IFN list',
        who: 'If you have been to an IFN meetup, or you are on the attendee list, this is your price.',
    },
];

/**
 * NOT IN USE. DO NOT WIRE THIS TO A BUTTON.
 *
 * This link resolves to a different product ("IFN Pro", $79 per month) than the
 * $149 / $99 annual membership this site advertises, so anyone completing
 * checkout would be charged the wrong amount on the wrong billing period.
 *
 * It is kept here so that swapping in the correct Stripe Payment Link is a
 * one-line change. Until that link arrives, `/membership` routes to `/contact`
 * and a person from the IFN team sends the payment link by hand.
 */
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJedR80XZ5UL6p89EL6oo00';

export const MEMBERSHIP_BENEFITS: MembershipBenefit[] = [
    {
        id: 'community',
        title: 'Private member channel',
        description:
            'A members-only channel on Slack or Discord. Ask your question on a Tuesday instead of holding it until the next meetup, and get an answer from someone who has already been through the same step.',
        included: [
            'Ask questions between meetups and get answers from other international founders',
            'Share introductions, referrals and the names of people who actually helped you',
            'Open from anywhere: you do not have to be in Austin that month',
        ],
    },
    {
        id: 'resources',
        title: 'Resource library',
        description:
            'Written notes, templates and checklists built from six months of IFN meetups in Austin: the questions founders brought to the room, and the answers that turned out to work.',
        included: [
            'Visa and immigration questions founders raised, and how they were handled',
            'Opening a U.S. bank account and setting up a U.S. company as a non-citizen',
            'Hiring and paying people across borders as a small, new company',
        ],
    },
    {
        id: 'office-hours',
        title: 'Monthly office hours',
        description:
            'One members-only call every month. Bring whatever you are working through and get a direct answer on your own situation.',
        included: [
            'One call every month, for members only',
            'Held by the people who run IFN',
            'Join from anywhere: the call is online',
        ],
    },
];
