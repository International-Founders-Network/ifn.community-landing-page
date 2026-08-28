/**
 * Outbound channels rendered in the footer.
 *
 * `verified: true`, confirmed to exist and belong to IFN. Safe to ship.
 * `verified: false`, PLACEHOLDER. The URL is a guess at IFN's handle and has
 *   NOT been checked. Confirm the account before launch, or set `href` to null
 *   to hide the icon.
 *
 * This is the single place to change any of them.
 */
export interface SocialLink {
    id: string;
    /** Accessible name. Icon-only links are unusable without this. */
    label: string;
    href: string;
    verified: boolean;
    external: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
    {
        id: 'linkedin',
        label: 'IFN on LinkedIn',
        href: 'https://www.linkedin.com/company/international-founders-network/',
        verified: false,
        external: true,
    },
    {
        id: 'luma',
        label: 'IFN events on Luma',
        href: 'https://lu.ma/IFN_ATX',
        verified: true,
        external: true,
    },
    {
        id: 'instagram',
        label: 'IFN on Instagram',
        href: 'https://www.instagram.com/ifn.community/',
        verified: false,
        external: true,
    },
    {
        id: 'email',
        label: 'Email IFN at hello@ifn.community',
        href: 'mailto:hello@ifn.community',
        verified: true,
        external: false,
    },
];

/**
 * The public IFN meetup calendar. Every "see the next meetup" / "register on
 * Luma" destination on the site resolves through here, so changing the handle
 * in SOCIAL_LINKS above moves all of them at once. Nine files previously each
 * held their own copy of this string.
 */
export const LUMA_CALENDAR_URL =
    SOCIAL_LINKS.find((link) => link.id === 'luma')?.href ?? 'https://lu.ma/IFN_ATX';
