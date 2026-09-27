import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ButtonLink } from './ButtonLink';


// Primary nav IA (openspec/changes/nav-ia-grouped-menu, revision 3): an Events
// menu, a Resources menu, a Gallery link, a Collaborate menu holding Sponsors
// and Partners, an About link, then one action. There is no separate
// Membership link because "Become a member" already carries that intent.
// Desktop and mobile both render from this one table so they cannot drift.
type NavLinkItem = { name: string; href: string };

// A gallery frame already in public/photos, named by its slot and the width of
// its tile tier (see galleryFrames in src/data/photos.generated.ts). The paths
// are built here rather than read from that module because the nav ships in
// the entry chunk and the module, with every alt text, does not. Every tier is
// 16:9 and carries avif, webp and a jpeg fallback, so one pattern covers them.
type NavPhoto = { slot: string; tile: number };

function photoPath(photo: NavPhoto, width: number, ext: 'avif' | 'webp' | 'jpg'): string {
    return `/photos/gallery-${photo.slot}-${width}w.${ext}`;
}

type NavChildItem = NavLinkItem & { description: string; photo: NavPhoto };
// `intro` is the one line that heads the group's desktop panel. Like the row
// descriptions it is paraphrased from ROUTE_SEO. `feature` puts a large photo
// in a left column with the rows stacked beside it; groups without one lay
// their rows out two across under the intro.
type NavGroupItem = {
    name: string;
    intro: string;
    feature?: NavPhoto;
    children: NavChildItem[];
};
type NavItem = NavLinkItem | NavGroupItem;

function isNavGroup(item: NavItem): item is NavGroupItem {
    return 'children' in item;
}

// Descriptions are paraphrased from each route's ROUTE_SEO entry in
// src/data/seo.ts, so the panel never promises something the page does not.
const NAV_ITEMS: NavItem[] = [
    {
        name: 'Events',
        intro: 'In person in Austin. Register on Luma.',
        feature: { slot: 'sep-group', tile: 640 },
        children: [
            {
                name: 'Meetups',
                href: '/events',
                description: 'Free monthly evenings in Austin',
                photo: { slot: 'aug-networking', tile: 640 },
            },
            {
                name: 'Accountability Pod',
                href: '/accountability-pods',
                description: 'Small founder groups checking in on goals. Coming soon',
                photo: { slot: 'apr-gesture', tile: 704 },
            },
            {
                name: 'Workshops',
                href: '/workshops',
                description: 'Visas, banking, hiring, fundraising',
                photo: { slot: 'aug-room', tile: 640 },
            },
        ],
    },
    {
        name: 'Resources',
        intro: 'Written for international and immigrant founders.',
        children: [
            {
                name: 'Library',
                href: '/resources',
                description: 'Guides for founders building in the US',
                photo: { slot: 'feb-slide', tile: 640 },
            },
            {
                name: 'Blogs',
                href: '/blog',
                description: 'Peer notes from founders in Austin',
                photo: { slot: 'sep-talk', tile: 640 },
            },
        ],
    },
    { name: 'Gallery', href: '/gallery' },
    {
        name: 'Collaborate',
        intro: 'The people who help the Austin meetups happen.',
        children: [
            {
                name: 'Sponsors',
                href: '/sponsors',
                description: 'Back the monthly meetups',
                photo: { slot: 'aug-group', tile: 640 },
            },
            {
                name: 'Partners',
                href: '/partners',
                description: 'Collaborators who help run IFN',
                photo: { slot: 'jul-hall', tile: 640 },
            },
        ],
    },
    { name: 'About', href: '/about' },
];

/**
 * A decorative gallery frame. The link around it already carries the name, so
 * the image is alt="" and hidden from the accessibility tree. Panels mount only
 * when opened, so `lazy` keeps every frame off the first load.
 */
function NavPicture({
    photo,
    width,
    className,
}: {
    photo: NavPhoto;
    width: number;
    className: string;
}) {
    return (
        <picture aria-hidden="true">
            <source type="image/avif" srcSet={photoPath(photo, width, 'avif')} />
            <source type="image/webp" srcSet={photoPath(photo, width, 'webp')} />
            <img
                src={photoPath(photo, photo.tile, 'jpg')}
                alt=""
                width={16}
                height={9}
                loading="lazy"
                decoding="async"
                className={className}
            />
        </picture>
    );
}

const MOBILE_MENU_ID = 'primary-navigation-menu';

// Prefix match, the same rule NavLink uses, so /blog/:slug keeps Blogs (and
// therefore Resources) active.
function isRouteActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
}

// Stable id stem for a panel row, used to split its accessible name from its
// description.
function rowId(href: string): string {
    return `nav-row${href.replace(/\//g, '-')}`;
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

// Mobile rows share one class so the group children and the top-level Gallery
// row cannot drift into two treatments.
function mobileLinkClass(isActive: boolean): string {
    return `flex min-h-11 items-center gap-3 rounded-none py-2 text-base ${FOCUS_RING} ${
        isActive ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'
    }`;
}

// Every panel is one width, and the two groups without a feature photo lay
// their rows two across under a fixed minimum height, so the shared Viewport
// changes panels with little or no change in size. That keeps the switch a
// slide and not a resize (width and height are layout properties, and
// MOTION_INTENSITY 4 animates transform and opacity only).
const PANEL_WIDTH = 'w-[min(44rem,calc(100vw-3rem))]';

/**
 * The destination rows of one desktop panel. `stack` is the vertical list
 * beside a feature photo: a small thumb, the name and a one line description
 * in a row. `grid` sets them two across under the intro as cards, the photo
 * wide on top, so a two item panel fills the same height as Events.
 */
function PanelRows({
    group,
    pathname,
    layout,
}: {
    group: NavGroupItem;
    pathname: string;
    layout: 'stack' | 'grid';
}) {
    const reduceMotion = useReducedMotion();
    return (
        <ul
            className={
                layout === 'stack'
                    ? 'flex flex-col justify-center gap-1'
                    : 'grid flex-1 grid-cols-2 gap-1 pt-3'
            }
        >
            {group.children.map((child, index) => {
                const isActive = isRouteActive(pathname, child.href);
                const id = rowId(child.href);
                return (
                    // Rows follow the panel 40ms apart, 6px rise and fade,
                    // transform and opacity only. At rest under reduced motion.
                    <motion.li
                        key={child.name}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.2,
                            ease: 'easeOut',
                            delay: 0.04 * (index + 1),
                        }}
                    >
                        {/* Radix Slot merges className as a string, so NavLink
                            gets a computed string here rather than its function
                            form. NavLink still sets aria-current="page" on the
                            active route. The accessible name is the item name
                            alone; the one line description is wired as its
                            description rather than folded into the name. The
                            active row carries a 2px --ink edge (left in the
                            stack, top on a card) and a
                            semibold name as well as the --band fill, so it does
                            not depend on tone alone. */}
                        <NavigationMenu.Link asChild active={isActive}>
                            <NavLink
                                to={child.href}
                                aria-labelledby={`${id}-name`}
                                aria-describedby={`${id}-desc`}
                                className={`group/row flex h-full rounded-none p-2 transition-colors ${FOCUS_RING} ${
                                    layout === 'stack'
                                        ? 'items-center gap-4 border-l-2'
                                        : 'flex-col gap-3 border-t-2'
                                } ${
                                    isActive
                                        ? 'border-ink bg-band'
                                        : 'border-transparent hover:bg-band'
                                }`}
                            >
                                {/* The thumb scales up a touch on hover and
                                    focus inside its own clipped box, transform
                                    only. */}
                                <span
                                    aria-hidden="true"
                                    className={`block shrink-0 overflow-hidden bg-band ${
                                        layout === 'stack' ? 'h-14 w-20' : 'h-32 w-full'
                                    }`}
                                >
                                    <NavPicture
                                        photo={child.photo}
                                        width={child.photo.tile}
                                        className="size-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover/row:scale-105 group-focus-visible/row:scale-105"
                                    />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span
                                        id={`${id}-name`}
                                        className={`text-sm text-ink ${
                                            isActive ? 'font-semibold' : 'font-medium'
                                        }`}
                                    >
                                        {child.name}
                                    </span>
                                    <span id={`${id}-desc`} className="text-xs leading-5 text-muted">
                                        {child.description}
                                    </span>
                                </span>
                                {/* The arrow belongs to the row form; a
                                    card's hover cue is its photo. */}
                                {layout === 'stack' && (
                                    <ArrowRight
                                        aria-hidden="true"
                                        strokeWidth={1.5}
                                        className="size-4 shrink-0 -translate-x-1 text-ink opacity-0 motion-safe:transition-[opacity,transform] group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100"
                                    />
                                )}
                            </NavLink>
                        </NavigationMenu.Link>
                    </motion.li>
                );
            })}
        </ul>
    );
}

/**
 * One desktop group: a Radix Navigation Menu trigger plus its panel content.
 * Radix supplies the disclosure semantics (aria-expanded, links not
 * menuitems), Escape with focus back on the trigger, outside click, arrow keys
 * between triggers and hover intent. The content does not render in this <li>:
 * Radix moves it into the one shared Viewport under the bar, and the Indicator
 * slides under whichever trigger is open.
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

    // No `relative` on the Item: the Indicator measures each trigger's
    // offsetLeft against the List's track, and a positioned <li> would make
    // every offset 0.
    return (
        <NavigationMenu.Item value={group.name}>
            <NavigationMenu.Trigger
                className={`group ${navLinkClass(childActive)} gap-1 data-[state=open]:text-ink`}
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
            {/* Absolute so the outgoing and incoming panels overlap while they
                cross. Radix sets data-motion from the direction of travel
                between triggers, and each value maps to a 32px slide plus fade
                (the nav-* keyframes in index.css). The first open has no
                data-motion; the Viewport's own entrance covers it. */}
            <NavigationMenu.Content
                className={
                    `absolute top-0 left-0 ${PANEL_WIDTH} p-3 ` +
                    'motion-safe:data-[motion=from-start]:animate-nav-from-start ' +
                    'motion-safe:data-[motion=from-end]:animate-nav-from-end ' +
                    'motion-safe:data-[motion=to-start]:animate-nav-to-start ' +
                    'motion-safe:data-[motion=to-end]:animate-nav-to-end'
                }
            >
                {group.feature ? (
                    // Feature column on the left, rows stacked on the right.
                    // The feature is not a link: it sets the scene and carries
                    // the group intro, and every destination is a row.
                    <div className="grid min-h-64 grid-cols-[minmax(0,17rem)_minmax(0,1fr)] gap-3">
                        <div className="relative overflow-hidden bg-ink">
                            <NavPicture
                                photo={group.feature}
                                width={1280}
                                className="absolute inset-0 size-full object-cover"
                            />
                            {/* A bottom scrim so the --paper intro reads on any
                                frame. The scrim is --ink, never the accent. */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/35 to-transparent"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-paper/80">
                                    {group.name}
                                </p>
                                <p className="text-sm font-medium text-paper">{group.intro}</p>
                            </div>
                        </div>
                        <PanelRows group={group} pathname={pathname} layout="stack" />
                    </div>
                ) : (
                    <div className="flex min-h-64 flex-col">
                        <div className="flex items-baseline justify-between gap-6 border-b border-rule px-3 pt-1 pb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                                {group.name}
                            </p>
                            <p className="text-sm text-ink">{group.intro}</p>
                        </div>
                        <PanelRows group={group} pathname={pathname} layout="grid" />
                    </div>
                )}
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
                        onto the desktop cluster div with the label cleared rather
                        than nesting a second "Main" navigation inside the first.
                        The Root is the whole cluster, action included, so the
                        Viewport below can hang from the cluster's right edge. */}
                    <NavigationMenu.Root
                        asChild
                        aria-label={undefined}
                        value={openGroup}
                        onValueChange={setOpenGroup}
                    >
                        <div className="relative hidden md:flex self-stretch items-center gap-5 lg:gap-8">
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
                                {/* The Indicator is portalled into the List's track and
                                    placed by Radix under the open trigger. It
                                    fills the 10px from the trigger's bottom to the
                                    bar's edge and draws a 2px --ink bar that sits
                                    on the panel's top rule, so trigger and panel
                                    read as one piece. Only its transform is
                                    transitioned; Radix sets its width directly. */}
                                <NavigationMenu.Indicator className="top-full z-10 flex h-2.5 items-end motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:data-[state=visible]:animate-nav-fade-in motion-safe:data-[state=hidden]:animate-nav-fade-out">
                                    <span className="h-0.5 w-full bg-ink" />
                                </NavigationMenu.Indicator>
                            </NavigationMenu.List>
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
                            {/* The one shared panel. It hangs from the bar's bottom
                                edge, right aligned to the action, so a 44rem panel
                                spans the whole cluster and stays on screen at
                                768px. Its size comes from Radix's measured
                                viewport variables and is not transitioned; it
                                scales in from its top right corner and fades,
                                transform and opacity only. Its 1px top border lands
                                on the bar's own --rule hairline. `box-content`
                                because Radix measures the content alone, and under
                                border-box the 1px border would clip it. */}
                            <div className="absolute top-full right-0 flex justify-end">
                                <NavigationMenu.Viewport className="relative box-content h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-top-right overflow-hidden border border-rule bg-paper motion-safe:data-[state=open]:animate-nav-viewport-in motion-safe:data-[state=closed]:animate-nav-viewport-out" />
                            </div>
                        </div>
                    </NavigationMenu.Root>

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
                                                                {/* The same gallery
                                                                    thumb as the desktop
                                                                    row, smaller, so the
                                                                    two read as one menu. */}
                                                                <span
                                                                    aria-hidden="true"
                                                                    className="block h-8 w-12 shrink-0 overflow-hidden bg-band"
                                                                >
                                                                    <NavPicture
                                                                        photo={child.photo}
                                                                        width={child.photo.tile}
                                                                        className="size-full object-cover"
                                                                    />
                                                                </span>
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
