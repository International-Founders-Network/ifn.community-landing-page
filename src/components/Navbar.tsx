import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ButtonLink } from './ButtonLink';


// Primary nav IA (openspec/changes/nav-ia-grouped-menu): two groups, one link,
// one action. DESIGN.md caps the bar at about five entries plus the action, so
// the public pages sit under Discover and the sponsor/partner pages under
// Collaborate. There is no separate Membership link because "Become a member"
// already carries that intent. Desktop and mobile both render from this one
// table so they cannot drift.
type NavLinkItem = { name: string; href: string };
type NavGroupItem = { name: string; children: NavLinkItem[] };
type NavItem = NavLinkItem | NavGroupItem;

function isNavGroup(item: NavItem): item is NavGroupItem {
    return 'children' in item;
}

const NAV_ITEMS: NavItem[] = [
    {
        name: 'Discover',
        children: [
            { name: 'Events', href: '/events' },
            { name: 'Workshops', href: '/workshops' },
            { name: 'Gallery', href: '/gallery' },
            { name: 'Blog', href: '/blog' },
            { name: 'Resources', href: '/resources' },
        ],
    },
    {
        name: 'Collaborate',
        children: [
            { name: 'Sponsors', href: '/sponsors' },
            { name: 'Partners', href: '/partners' },
        ],
    },
    { name: 'About', href: '/about' },
];

const MOBILE_MENU_ID = 'primary-navigation-menu';

// Prefix match, the same rule NavLink uses, so /blog/:slug keeps Blog (and
// therefore Discover) active.
function isRouteActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
}

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
// `outline-hidden` rather than the v3 spelling of the same idea, which is what
// this file used to carry. Only `outline-hidden` keeps
// `outline: 2px solid transparent` under `forced-colors: active`, and a forced
// colours UA drops box-shadow, which is what a Tailwind ring compiles to. Under
// the old spelling every control in this bar had no focus indicator at all in
// Windows High Contrast Mode. The retired spelling is not written out even
// here, so a grep based pass condition on it returns zero for this file.
const FOCUS_RING =
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

const NAV_LINK_BASE =
    `flex min-h-11 items-center rounded-none py-3 text-sm whitespace-nowrap transition-colors ${FOCUS_RING}`;

function navLinkClass(isActive: boolean): string {
    return `${NAV_LINK_BASE} ${
        isActive ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'
    }`;
}

// Mobile rows share one class so the group children and the top-level About
// row cannot drift into two treatments.
function mobileLinkClass(isActive: boolean): string {
    return `block rounded-none py-3 text-base ${FOCUS_RING} ${
        isActive ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'
    }`;
}

/**
 * One desktop group: a Radix Navigation Menu trigger plus its panel. Radix
 * supplies the disclosure semantics (aria-expanded, links not menuitems),
 * Escape with focus back on the trigger, outside click, arrow keys between
 * triggers and hover intent. The panel renders inline in its <li> (there is no
 * Radix Viewport) and is positioned under the trigger.
 */
function DesktopGroup({
    group,
    pathname,
    open,
}: {
    group: NavGroupItem;
    pathname: string;
    open: boolean;
}) {
    const reduceMotion = useReducedMotion();
    const pointerTypeRef = useRef<string>('');
    const childActive = group.children.some((child) => isRouteActive(pathname, child.href));

    // Radix toggles on every click, so a mouse user who hovers the panel open
    // and then clicks the trigger would shut it again. For a real mouse click
    // (detail > 0) on an already open trigger, preventDefault skips Radix's
    // toggle; the panel still closes on pointer leave, outside click and
    // Escape. Keyboard activation (detail 0) and touch keep the plain toggle.
    const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (open && event.detail > 0 && pointerTypeRef.current === 'mouse') {
            event.preventDefault();
        }
    };

    return (
        <NavigationMenu.Item value={group.name} className="relative">
            <NavigationMenu.Trigger
                className={`group ${navLinkClass(childActive)} gap-1`}
                onPointerDown={(event) => {
                    pointerTypeRef.current = event.pointerType;
                }}
                onClick={onTriggerClick}
            >
                {group.name}
                <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-3.5 shrink-0 motion-safe:transition-transform group-data-[state=open]:rotate-180"
                />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content asChild>
                {/* Enter only: a 4px drop and fade over 150ms, transform and
                    opacity, in the installed framer-motion. Under reduced
                    motion the panel renders at rest. */}
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 top-full z-50 min-w-[11rem] border border-rule bg-paper py-1"
                >
                    <ul>
                        {group.children.map((child) => {
                            const isActive = isRouteActive(pathname, child.href);
                            return (
                                <li key={child.name}>
                                    {/* Radix Slot merges className as a string, so
                                        NavLink gets a computed string here rather
                                        than its function form. NavLink still sets
                                        aria-current="page" on the active route. */}
                                    <NavigationMenu.Link asChild active={isActive}>
                                        <NavLink
                                            to={child.href}
                                            className={`flex min-h-11 items-center px-4 py-2 text-sm whitespace-nowrap ${FOCUS_RING} ${
                                                isActive
                                                    ? 'font-semibold text-ink'
                                                    : 'font-medium text-muted hover:text-ink'
                                            }`}
                                        >
                                            {child.name}
                                        </NavLink>
                                    </NavigationMenu.Link>
                                </li>
                            );
                        })}
                    </ul>
                </motion.div>
            </NavigationMenu.Content>
        </NavigationMenu.Item>
    );
}

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Which desktop group is open ('' for none). Controlled so a route change
    // can close it below.
    const [openGroup, setOpenGroup] = useState('');
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { pathname } = useLocation();
    const reduceMotion = useReducedMotion();

    // There is deliberately no scroll listener here. The bar is flat, solid and
    // a fixed 64px in every state, so there is no scroll driven state to track.
    // A window scroll listener is a hard ban (skill 5.D, plan section 6) and the
    // one that used to live here was deleted outright rather than swapped for a
    // Motion hook, which would only replace an unused listener with an unused
    // hook. The literal call is not written even in this comment, so a grep
    // based pass condition on it returns zero for this file.

    // Close the mobile panel and any desktop group whenever the route changes,
    // so a link tap never leaves a menu covering the page it just navigated to.
    // Adjusted during render (React's documented pattern) rather than in an
    // effect, so a panel never paints for a frame over the new route.
    const [renderedPathname, setRenderedPathname] = useState(pathname);
    if (pathname !== renderedPathname) {
        setRenderedPathname(pathname);
        setIsMobileMenuOpen(false);
        setOpenGroup('');
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
                    {/* Radix Root renders <nav aria-label="Main"> by default. This
                        element is already that landmark, so the Root is rendered
                        as a plain div with the label cleared rather than nesting
                        a second "Main" navigation inside the first. */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-8">
                        <NavigationMenu.Root
                            asChild
                            aria-label={undefined}
                            value={openGroup}
                            onValueChange={setOpenGroup}
                        >
                            <div>
                                <NavigationMenu.List className="flex items-center gap-4 lg:gap-6">
                                    {NAV_ITEMS.map((item) =>
                                        isNavGroup(item) ? (
                                            <DesktopGroup
                                                key={item.name}
                                                group={item}
                                                pathname={pathname}
                                                open={openGroup === item.name}
                                            />
                                        ) : (
                                            <NavigationMenu.Item key={item.name}>
                                                {/* py-3 lifts the 20px text line to a 44px hit
                                                    area inside the 64px bar, and `min-h-11`
                                                    holds that floor independently of the type
                                                    ramp, so a later line-height change on
                                                    text-sm cannot silently fail WCAG 2.5.5.
                                                    `flex` rather than `inline-flex`: an inline
                                                    level box inside this `li` would let the
                                                    strut's descender grow the row past 44px and
                                                    drop the label off the bar's centreline.
                                                    The active state is carried by weight as
                                                    well as by tone so it does not depend on
                                                    colour alone. --ink on --paper 17.965,
                                                    --muted 6.601. */}
                                                <NavigationMenu.Link
                                                    asChild
                                                    active={isRouteActive(pathname, item.href)}
                                                >
                                                    <NavLink
                                                        to={item.href}
                                                        className={navLinkClass(
                                                            isRouteActive(pathname, item.href),
                                                        )}
                                                    >
                                                        {item.name}
                                                    </NavLink>
                                                </NavigationMenu.Link>
                                            </NavigationMenu.Item>
                                        ),
                                    )}
                                </NavigationMenu.List>
                            </div>
                        </NavigationMenu.Root>
                        {/* One label per intent across nav, hero, HowItWorks and
                            FinalCTA (plan section 11). rounded-full is the plan's
                            discrete control shape; buttonStyles.ts still ships
                            rounded-lg in BASE, and cn() is tailwind-merge, so this
                            wins cleanly and becomes redundant when that file lands
                            the pill globally. */}
                        <ButtonLink
                            to="/membership"
                            size="sm"
                            className="whitespace-nowrap rounded-full"
                        >
                            Become a member
                        </ButtonLink>
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
                           inside. Under reduced motion it opens and closes at once. */
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={reduceMotion ? { duration: 0 } : undefined}
                            className="overflow-hidden bg-paper"
                        >
                            <div className="px-4 py-4">
                                <ul className="flex flex-col">
                                    {NAV_ITEMS.map((item) =>
                                        isNavGroup(item) ? (
                                            <li key={item.name} className="pt-2 first:pt-0">
                                                {/* Flat hierarchy under a
                                                    non-interactive group label, so
                                                    the panel never nests a second
                                                    disclosure inside the menu
                                                    disclosure. */}
                                                <p className="py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                                                    {item.name}
                                                </p>
                                                <ul className="border-l border-rule pl-3">
                                                    {item.children.map((child) => (
                                                        <li key={child.name}>
                                                            <NavLink
                                                                to={child.href}
                                                                className={({ isActive }) =>
                                                                    mobileLinkClass(isActive)
                                                                }
                                                                onClick={() =>
                                                                    setIsMobileMenuOpen(false)
                                                                }
                                                            >
                                                                {child.name}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ) : (
                                            <li key={item.name} className="pt-2">
                                                <NavLink
                                                    to={item.href}
                                                    className={({ isActive }) =>
                                                        mobileLinkClass(isActive)
                                                    }
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </NavLink>
                                            </li>
                                        ),
                                    )}
                                </ul>
                                <div className="pt-4">
                                    <ButtonLink
                                        to="/membership"
                                        fullWidth
                                        className="rounded-full"
                                    >
                                        Become a member
                                    </ButtonLink>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
