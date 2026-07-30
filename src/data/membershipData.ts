export interface MembershipBenefit {
    id: string;
    title: string;
    description: string;
}

export const MEMBERSHIP_PRICE_RANGE = '$99–$149/year';

export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJedR80XZ5UL6p89EL6oo00';

export const MEMBERSHIP_BENEFITS: MembershipBenefit[] = [
    {
        id: 'community',
        title: 'Private member community',
        description: 'A dedicated Slack/Discord channel to ask questions, share leads, and get help from other international founders between meetups.',
    },
    {
        id: 'resources',
        title: 'Resource library',
        description: 'Templates and notes on immigration, U.S. banking, and hiring, drawn from six months of running IFN meetups — practical, not theoretical.',
    },
    {
        id: 'office-hours',
        title: 'Monthly office hours',
        description: 'A recurring members-only call to get direct answers on whatever you\'re navigating that month.',
    },
];
