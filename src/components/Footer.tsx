import { Linkedin, Calendar, Instagram, Mail, Heart, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ThemeToggle } from './ThemeToggle';
import { SOCIAL_LINKS, LUMA_CALENDAR_URL } from '../data/socialLinks';

/**
 * Icons for the outbound channel row, keyed by `SocialLink.id`.
 * Luma is an events calendar, so it takes the calendar glyph rather than a
 * brand mark it does not have in Lucide.
 */
const SOCIAL_ICONS: Record<string, LucideIcon> = {
    linkedin: Linkedin,
    luma: Calendar,
    instagram: Instagram,
    email: Mail,
};

interface FooterLink {
    name: string;
    href: string;
    external?: boolean;
}

const FOOTER_LINKS: { id: string; heading: string; links: FooterLink[] }[] = [
    {
        id: 'community',
        heading: 'Community',
        links: [
            { name: 'Monthly Meetups', href: '/events' },
            { name: 'Membership', href: '/membership' },
            { name: 'Code of Conduct', href: '/code-of-conduct' },
        ],
    },
    {
        id: 'resources',
        heading: 'Resources',
        links: [
            { name: 'Founder Resources', href: '/resources' },
            { name: 'Events on Luma', href: LUMA_CALENDAR_URL, external: true },
        ],
    },
    {
        id: 'company',
        heading: 'Company',
        links: [
            { name: 'About Us', href: '/about' },
            { name: 'Partners', href: '/partners' },
            { name: 'Contact', href: '/contact' },
        ],
    },
    {
        id: 'legal',
        heading: 'Legal',
        links: [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-and-conditions' },
        ],
    },
];

/**
 * The two layer focus ring from REDESIGN-PLAN.md section 4.2: 2px `--paper`
 * inner, 2px `--ink` outer, identical in both modes, and NOT reversed for dark
 * (the two tokens already swap, so reversing on top of the swap inverts it
 * twice and collapses the ring to a single line at 1.000 on its own ground).
 *
 * Written as a box shadow pair rather than as `ring-2` + `ring-offset-2`
 * because the plan retires the `ring-offset` construction: a ring offset
 * assumes a known solid ground, and this ring must survive any ground. The two
 * layers contrast with each other at 17.965, so the indicator reads as a shape
 * rather than as a colour, and the better of the two layers never drops below
 * 4.264 across all 256 greys.
 *
 * ARBITRARY PROPERTY, NOT THE `shadow-[...]` UTILITY, and that is load bearing.
 * Compiled with this project's own Tailwind, the utility form emits
 * `--tw-shadow: 0 0 0 2px var(--tw-shadow-color, var(--paper)), 0 0 0 4px
 * var(--tw-shadow-color, var(--ink))`. Any `shadow-<colour>` utility reaching
 * the same element sets `--tw-shadow-color`, which then wins the fallback in
 * BOTH layers and repaints the entire ring in one colour. `buttonStyles.ts`
 * documents the identical trap and takes the identical escape. The arbitrary
 * property form emits both layers verbatim and cannot be reached by
 * `--tw-shadow-color`. Verified in compiled CSS, not inferred.
 *
 * `outline-hidden` rather than the v3 spelling of the same idea, for the reason
 * `buttonStyles.ts` gives: only `outline-hidden` keeps
 * `outline: 2px solid transparent` under `forced-colors: active`. A forced
 * colours UA drops `box-shadow` entirely, so the retired spelling would leave
 * every footer link with no focus indicator at all in Windows High Contrast
 * Mode. That spelling is not written out even here, so a grep based pass
 * condition on it returns zero for this file.
 *
 * The geometry is identical to `ring-2 ring-ink ring-offset-2
 * ring-offset-paper`, which is how `Navbar` and `FAQ` still spell it. Those two
 * pin both ring colours through named tokens, so neither is reachable by
 * `--tw-shadow-color` and neither carries the defect fixed here. What must not
 * happen is two different ring geometries.
 */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

/**
 * Footer links are navigation, not secondary metadata, so they carry `--ink`
 * at 17.965 on `--paper` and the group labels above them carry `--muted` at
 * 6.601. Hover is an underline rather than a colour change: the accent is
 * licensed to three roles only (the mark, the primary action fill, the
 * wordmark period) and a link hover is none of them.
 *
 * Radius 0. Plan section 4.4 reserves the full pill for discrete controls and
 * keeps nav links square, carrying their pressability through the focus ring.
 * `min-h-11` holds the 44px touch floor.
 */
const LINK_CLASSES =
    'inline-flex min-h-11 items-center rounded-none text-sm text-ink ' +
    'decoration-1 underline-offset-4 hover:underline ' +
    FOCUS_RING;

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        /*
         * Ground is `--paper`, separated from the page above by a single full
         * opacity 1px `--rule` hairline at 4.063. Not a partial opacity border:
         * plan section 4.2 measures a rule at 75% coverage at 2.665 in light and
         * 2.764 in dark, both under the 3:1 non text floor.
         *
         * PHASE 3 HANDOFF: on `/` this hairline meets FinalCTA. Once FinalCTA
         * becomes the section 9 accent field, `--rule` against `--accent-plate`
         * measures 1.736 light and 1.573 dark and the plan bans any hairline
         * terminating on that field. Whoever builds the plate owns this edge.
         * On the other sixteen routes the hairline is the mechanism, because
         * ground tone alone between the two surfaces is only 1.103.
         */
        <footer className="border-t border-rule bg-paper">
            <Container>
                <div className="grid grid-cols-1 gap-12 pt-20 pb-16 lg:grid-cols-12 lg:gap-16 lg:pt-24">
                    {/* Brand and positioning */}
                    <div className="space-y-5 lg:col-span-5">
                        <Link
                            to="/"
                            className={`inline-flex items-center rounded-none ${FOCUS_RING}`}
                        >
                            <span className="font-['MuseoModerno'] text-3xl font-black tracking-tighter text-ink">
                                IFN<span className="text-accent">.</span>
                            </span>
                            <span className="sr-only">International Founders Network home page</span>
                        </Link>
                        <p className="max-w-sm leading-relaxed text-ink">
                            A community for founders who moved to Austin, Texas from another
                            country. We meet in person every month to work through the practical
                            parts: visas, U.S. banking, unfamiliar funding rules, and building a
                            network from zero.
                        </p>
                        <p className="max-w-sm text-sm text-muted">
                            Six-plus months of monthly meetups, hosted at Station Austin.
                        </p>
                    </div>

                    {/*
                     * Links grid. Each group is opened by a 1px `--rule` hairline
                     * rather than boxed in a card, so grouping is carried by rule
                     * and space, which is the only device that works on both
                     * grounds in both modes.
                     */}
                    <nav
                        aria-label="Footer"
                        className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:col-span-7"
                    >
                        {FOOTER_LINKS.map((group) => (
                            <div key={group.id} className="border-t border-rule pt-4">
                                <h2
                                    id={`footer-${group.id}-heading`}
                                    className="text-xs font-semibold uppercase tracking-[0.08em] text-muted"
                                >
                                    {group.heading}
                                </h2>
                                <ul
                                    aria-labelledby={`footer-${group.id}-heading`}
                                    className="mt-1"
                                >
                                    {group.links.map((link) => (
                                        <li key={link.name}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={LINK_CLASSES}
                                                >
                                                    {link.name}
                                                    <span className="sr-only"> (opens in a new tab)</span>
                                                </a>
                                            ) : (
                                                <Link to={link.href} className={LINK_CLASSES}>
                                                    {link.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                {/*
                 * Bottom bar. The side-by-side split moved from `md` to `lg` when
                 * the theme control landed here, and the reason is arithmetic
                 * rather than taste. The controls group has a hard min-content
                 * width: 197px of theme control (three 44px chips that cannot
                 * shrink, plus the label) and 188px of channel row, plus the 32px
                 * `sm:gap-8`, so roughly 417px that will not compress. Against the
                 * ~720px the container gives at 768px, the copyright block is left
                 * about 149px short of its natural width and wraps to two lines
                 * across the whole 768 to 920px band, on all seventeen routes. It
                 * never overflows (its own min-content is ~142px), so this is
                 * crowding rather than a break, and holding the split until `lg`
                 * gives the metadata its own row until there is genuinely room for
                 * two.
                 */}
                <div className="flex flex-col items-center gap-6 border-t border-rule py-8 lg:flex-row lg:justify-between">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted sm:flex-row sm:gap-4">
                        <p>© {currentYear} IFN Global LLC. All rights reserved.</p>

                        {/*
                         * The heart is deliberately NOT accent coloured any more.
                         * The accent is licensed to the mark, the primary action
                         * fill and the wordmark period, and the mark may only
                         * attach to a phrase a reader can check against a named
                         * artifact. "Built with love from Austin" is not one, so
                         * the glyph inherits `--muted` at 6.601 on `--paper`.
                         */}
                        <p className="flex items-center gap-1.5 sm:border-l sm:border-rule sm:pl-4">
                            <span>Built with</span>
                            <Heart
                                size={14}
                                strokeWidth={1.5}
                                aria-hidden="true"
                                className="fill-current"
                            />
                            <span className="sr-only">love</span>
                            <span>from Austin</span>
                        </p>
                    </div>

                    {/*
                     * The controls end of the bottom bar. The theme control and the
                     * channel row are wrapped in ONE group so the bar keeps its two
                     * part composition: metadata left, controls right. Mounting the
                     * toggle as a third direct child would have turned
                     * `md:justify-between` into a three way spread and pushed the
                     * channel row off the right edge of the reading rhythm.
                     *
                     * They stack at the narrowest widths and sit on one line from
                     * `sm` up. That is this block's sub 768px collapse, declared in
                     * the same component as the asymmetry per plan section 11.
                     */}
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                        {/*
                         * Theme control. Three states, `system` by default, persisted in
                         * localStorage and applied as `data-theme` on the document
                         * element. The no-flash bootstrap for it is the inline script in
                         * index.html, which stamps the same attribute from the same
                         * storage key during head parsing, before first paint.
                         */}
                        <ThemeToggle />

                        {/*
                         * Channel row. Every entry, its URL and its accessible name live in
                         * src/data/socialLinks.ts. Entries flagged `verified: false` there are
                         * unconfirmed guesses at IFN's handle and should be confirmed or removed
                         * from that file before launch rather than filtered out here: this
                         * component renders the list as given, on purpose.
                         *
                         * These are discrete controls, so they take the full pill under plan
                         * section 4.4 while the text links above stay square.
                         */}
                        <ul className="flex items-center gap-1">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = SOCIAL_ICONS[social.id];
                                if (!Icon) return null;

                                return (
                                    <li key={social.id}>
                                        <a
                                            href={social.href}
                                            aria-label={
                                                social.external
                                                    ? `${social.label} (opens in a new tab)`
                                                    : social.label
                                            }
                                            {...(social.external
                                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                                : {})}
                                            className={
                                                'inline-flex h-11 w-11 items-center justify-center rounded-full ' +
                                                'text-muted transition-colors hover:text-ink ' +
                                                FOCUS_RING
                                            }
                                        >
                                            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
