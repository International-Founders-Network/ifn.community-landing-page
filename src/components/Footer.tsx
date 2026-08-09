import { Linkedin, Calendar, Instagram, Mail, Heart, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
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

const LINK_CLASSES =
    'inline-flex min-h-11 items-center rounded-lg text-sm text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                    {/* Brand & positioning */}
                    <div className="lg:col-span-5 space-y-4">
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                        >
                            <span className="font-['MuseoModerno'] font-black text-3xl tracking-tighter text-primary">
                                IFN<span className="text-accent">.</span>
                            </span>
                            <span className="sr-only">International Founders Network home page</span>
                        </Link>
                        <p className="text-slate-600 max-w-sm">
                            A community for founders who moved to Austin, Texas from another
                            country. We meet in person every month to work through the practical
                            parts: visas, U.S. banking, unfamiliar funding rules, and building a
                            network from zero.
                        </p>
                        <p className="text-sm text-slate-500 max-w-sm">
                            Six-plus months of monthly meetups, hosted at Station Austin.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <nav aria-label="Footer" className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {FOOTER_LINKS.map((group) => (
                            <div key={group.id}>
                                <h2
                                    id={`footer-${group.id}-heading`}
                                    className="font-bold text-slate-900 mb-2"
                                >
                                    {group.heading}
                                </h2>
                                <ul aria-labelledby={`footer-${group.id}-heading`} className="space-y-0.5">
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

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {currentYear} IFN Global LLC. All rights reserved.
                    </p>

                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <span>Built with</span>
                        <Heart size={14} aria-hidden="true" className="text-accent fill-accent" />
                        <span className="sr-only">love</span>
                        <span>from Austin</span>
                    </p>

                    {/*
                     * Channel row. Every entry, its URL and its accessible name live in
                     * src/data/socialLinks.ts — entries flagged `verified: false` there are
                     * unconfirmed guesses at IFN's handle and should be confirmed or removed
                     * from that file before launch rather than edited here.
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
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                                    >
                                        <Icon size={20} aria-hidden="true" />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Container>
        </footer>
    );
}
