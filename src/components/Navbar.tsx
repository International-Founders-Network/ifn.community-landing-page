import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface NavbarProps {
    onJoinClick: () => void;
}

// The navigation exposes the five surfaces a visitor actually needs to judge
// IFN: the meetups, the paid membership, the library, who we work with, and who
// runs it. Partners sits beside About because both answer "is this real?" rather
// than "what do I get". Everything else stays in the footer, and one action
// lives at the right edge.
const NAV_LINKS = [
    { name: 'Events', href: '/events' },
    { name: 'Membership', href: '/membership' },
    { name: 'Resources', href: '/resources' },
    { name: 'Partners', href: '/partners' },
    { name: 'About', href: '/about' },
];

const MOBILE_MENU_ID = 'primary-navigation-menu';

export function Navbar({ onJoinClick }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        // Run once so a deep-linked or scroll-restored load does not paint a
        // transparent bar over content until the first scroll event.
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close the mobile panel whenever the route changes, so a link tap never
    // leaves the menu covering the page it just navigated to. Adjusted during
    // render (React's documented pattern) rather than in an effect, so the
    // panel never paints for a frame over the new route.
    const [renderedPathname, setRenderedPathname] = useState(pathname);
    if (pathname !== renderedPathname) {
        setRenderedPathname(pathname);
        setIsMobileMenuOpen(false);
    }

    // Escape closes the panel and hands focus back to the control that opened
    // it, rather than dropping focus on <body>.
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
                toggleRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobileMenuOpen]);

    // The open panel is white, so the bar above it has to be solid too.
    const isBarSolid = isScrolled || isMobileMenuOpen;

    return (
        <nav
            aria-label="Main"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isBarSolid ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                        {/* The amber period stays Welcome Amber (#f97316) rather than
                            taking the light-ground amber the headline emphasis word
                            now uses. It is part of the wordmark, which WCAG 1.4.3
                            exempts from contrast, its meaning is carried by the
                            sr-only accessible name below, and DESIGN.md names this
                            exact glyph as a Welcome Amber moment. */}
                        <span className="font-['MuseoModerno'] font-black text-3xl tracking-tighter text-primary">
                            IFN<span className="text-accent">.</span>
                        </span>
                        <span className="sr-only">International Founders Network, home</span>
                    </Link>

                    {/* Desktop Nav */}
                    {/* Five links plus the action is tight at exactly 768px, so the
                        gaps step up rather than a link being dropped: 16/20px at md,
                        the original 24/32px from lg. whitespace-nowrap keeps a label
                        from breaking onto two lines in the squeeze. */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-8">
                        <ul className="flex items-center gap-4 lg:gap-6">
                            {NAV_LINKS.map((link) => (
                                <li key={link.name}>
                                    {/* py-3 lifts the 20px text to a 44px hit area without
                                        growing the bar — the Join button is already 44px.
                                        NavLink sets aria-current="page" on the active route. */}
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) =>
                                            `block py-3 text-sm whitespace-nowrap transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${isActive
                                                ? 'font-semibold text-primary'
                                                : 'font-medium text-slate-600 hover:text-primary'
                                            }`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <Button size="sm" className="whitespace-nowrap" onClick={onJoinClick}>Join Network</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        ref={toggleRef}
                        type="button"
                        className="md:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls={MOBILE_MENU_ID}
                        onClick={() => setIsMobileMenuOpen((open) => !open)}
                    >
                        {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu — the wrapper is always mounted so aria-controls
                always resolves to a real element. */}
            <div id={MOBILE_MENU_ID} className="md:hidden">
                <AnimatePresence initial={false}>
                    {isMobileMenuOpen && (
                        /* -mb-4 cancels the nav's own py-4 beneath the panel, so the
                           panel's hairline lands on the bar's bottom edge instead of
                           floating 16px above it. The menu can only be open while the
                           bar is solid, so that padding is always py-4. */
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border-b border-slate-200 overflow-hidden -mb-4"
                        >
                            <div className="px-4 py-4">
                                <ul className="flex flex-col">
                                    {NAV_LINKS.map((link) => (
                                        <li key={link.name}>
                                            <NavLink
                                                to={link.href}
                                                className={({ isActive }) =>
                                                    `block py-3 text-base rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${isActive
                                                        ? 'font-semibold text-primary'
                                                        : 'font-medium text-slate-600 hover:text-primary'
                                                    }`
                                                }
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-4">
                                    <Button
                                        fullWidth
                                        onClick={() => { setIsMobileMenuOpen(false); onJoinClick(); }}
                                    >
                                        Join Network
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
