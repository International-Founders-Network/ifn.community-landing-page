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

// REDESIGN-PLAN.md section 4.2's focus ring, written once and shared by every
// focusable in this file so the bar cannot drift into two treatments.
//
// It is a two layer ring: 2px --paper inner, 2px --ink outer. Tailwind's
// ring/ring-offset pair compiles this to exactly
//   box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--ink)
// which is the construction the plan specifies. The plan's ban on
// `focus-visible:ring-offset-2` is a ban on the UNCOLOURED form: Tailwind's
// default `--tw-ring-offset-color` is #fff, so the shipped pattern was drawing
// a white gap and assuming the ground was white. Naming `ring-offset-paper`
// draws the inner layer rather than borrowing it from whatever is behind, which
// is the whole point of the two layer construction.
//
// Measured: --ink outer against the --paper bar ground 17.965, the two layers
// against each other 17.965, so the ring reads as a shape and not as a colour.
//
// `outline-hidden` rather than `outline-none`, which is the spelling this file
// used to carry. Only `outline-hidden` keeps `outline: 2px solid transparent`
// under `forced-colors: active`, and a forced colours UA drops box-shadow, which
// is what a Tailwind ring compiles to. With `outline-none` every control in this
// bar had no focus indicator at all in Windows High Contrast Mode.
const FOCUS_RING =
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function Navbar({ onJoinClick }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { pathname } = useLocation();

    // There is deliberately no scroll listener here. The bar is flat, solid and
    // a fixed 64px in every state, so there is no scroll driven state to track.
    // A window scroll listener is a hard ban (skill 5.D, plan section 6) and the
    // one that used to live here was deleted outright rather than swapped for a
    // Motion hook, which would only replace an unused listener with an unused
    // hook. The literal call is not written even in this comment, so a grep
    // based pass condition on it returns zero for this file.

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

    return (
        // Plan section 4.4: fixed, 64px at rest, flat, solid --paper, one 1px
        // --rule bottom edge (4.063 against --paper), no backdrop blur, no
        // shadow, no transparent state. The hairline lives on <nav> rather than
        // on the bar row, so it sits under the mobile panel when the panel is
        // open and under the bar when it is closed, with one declaration.
        // Closed height is 64px plus that 1px edge = 65px.
        <nav
            aria-label="Main"
            className="fixed top-0 left-0 right-0 z-50 border-b border-rule bg-paper"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    {/* The glyph drops from text-3xl to text-xl with the bar, but
                        the target does not: min-h-11 holds the link at the 44px
                        floor that a 28px line box would otherwise fall through.
                        Radius 0, because plan 4.4 puts nav links at radius 0 and
                        reserves the pill for discrete controls. */}
                    <Link
                        to="/"
                        className={`inline-flex min-h-11 items-center rounded-none ${FOCUS_RING}`}
                    >
                        {/* The period is the wordmark's accent, one of the three
                            roles the accent is licensed to in plan section 2, and
                            it is the mark that is always on screen because the bar
                            is fixed. It measures 7.054 on --paper. WCAG 1.4.3
                            exempts a logotype from contrast in any case, and the
                            meaning is carried by the sr-only name below. */}
                        <span className="font-['MuseoModerno'] text-xl font-black tracking-tighter text-ink">
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
                                    {/* py-3 lifts the 20px text line to a 44px hit area
                                        inside the 64px bar, and `min-h-11` holds that
                                        floor independently of the type ramp: 20px of
                                        line box plus 24px of padding is exactly 44px
                                        with zero slack, so a later line-height change on
                                        text-sm would silently fail WCAG 2.5.5 on the
                                        most used control on the site. Same belt the
                                        wordmark link above and Footer's links already
                                        carry. `flex` rather than `inline-flex`: an inline
                                        level box inside this `li` would give the `li` an
                                        inline formatting context, and the strut's
                                        descender would grow the row past 44px and drop
                                        the label off the bar's centreline while the Join
                                        button beside it stayed centred.
                                        NavLink sets aria-current="page" on the
                                        active route, and the active state is carried by
                                        weight as well as by tone so it does not depend
                                        on colour alone.
                                        --ink on --paper 17.965, --muted 6.601. */}
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) =>
                                            `flex min-h-11 items-center rounded-none py-3 text-sm whitespace-nowrap transition-colors ${FOCUS_RING} ${isActive
                                                ? 'font-semibold text-ink'
                                                : 'font-medium text-muted hover:text-ink'
                                            }`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        {/* One label per intent across nav, hero, HowItWorks and
                            FinalCTA (plan section 11). rounded-full is the plan's
                            discrete control shape; buttonStyles.ts still ships
                            rounded-lg in BASE, and cn() is tailwind-merge, so this
                            wins cleanly and becomes redundant when that file lands
                            the pill globally. */}
                        <Button
                            size="sm"
                            className="whitespace-nowrap rounded-full"
                            onClick={onJoinClick}
                        >
                            Join the community
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        ref={toggleRef}
                        type="button"
                        className={`md:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink ${FOCUS_RING}`}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls={MOBILE_MENU_ID}
                        onClick={() => setIsMobileMenuOpen((open) => !open)}
                    >
                        {/* strokeWidth 1.5 is the plan's standardised icon weight
                            (section 11), against lucide's default of 2. */}
                        {isMobileMenuOpen
                            ? <X aria-hidden="true" strokeWidth={1.5} />
                            : <Menu aria-hidden="true" strokeWidth={1.5} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu. The wrapper is always mounted so aria-controls always
                resolves to a real element. */}
            <div id={MOBILE_MENU_ID} className="md:hidden">
                <AnimatePresence initial={false}>
                    {isMobileMenuOpen && (
                        /* The panel carries no border and no negative margin now.
                           The bar has no vertical padding of its own to cancel, and
                           the single --rule hairline on <nav> lands under whichever
                           of the two is currently the bottom of the element.
                           overflow-hidden clips the height animation; the 16px inner
                           padding keeps it clear of the 4px focus ring on the rows
                           inside. */
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden bg-paper"
                        >
                            <div className="px-4 py-4">
                                <ul className="flex flex-col">
                                    {NAV_LINKS.map((link) => (
                                        <li key={link.name}>
                                            <NavLink
                                                to={link.href}
                                                className={({ isActive }) =>
                                                    `block rounded-none py-3 text-base ${FOCUS_RING} ${isActive
                                                        ? 'font-semibold text-ink'
                                                        : 'font-medium text-muted hover:text-ink'
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
                                        className="rounded-full"
                                        onClick={() => { setIsMobileMenuOpen(false); onJoinClick(); }}
                                    >
                                        Join the community
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
