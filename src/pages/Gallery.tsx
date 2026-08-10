import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../components/Container';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { galleryNights, type GalleryNight } from '../data/photos.generated';

/**
 * THE GALLERY ROUTE. `/gallery`.
 *
 * WHY THE SLUG IS `/gallery`
 * --------------------------
 * It is the word the founder used, it is one guessable noun, and it collides
 * with nothing: the existing routes are `/events` (dates, a feed), `/about`,
 * `/partners`, `/resources`, `/membership` and the six coming-soon paths.
 * `/photos` was the other candidate and loses on one point: this page is not a
 * dump of every photograph IFN owns, it is a curated, dated selection, and
 * "gallery" carries that where "photos" implies the folder. Nothing existing
 * moves. This route is ADDED, which the brief permits; no slug, anchor id or
 * form field name anywhere else is touched.
 *
 * WHAT THE PAGE CLAIMS, AND WHAT IT REFUSES TO CLAIM
 * --------------------------------------------------
 * Three evenings were photographed. That is the whole claim. The page does not
 * say it is complete, does not imply every meetup is pictured, and prints no
 * caption for any frame beyond the hand written description already in
 * `photos.generated.ts`, which describes what is in the room and names no
 * individual and no venue. The only other text attached to a photograph is the
 * date of the evening it was taken on, which is a fact carried by the file.
 *
 * The counts are computed from the data rather than typed, so no sentence on
 * this page can drift away from what actually ships.
 *
 * THE LAYOUT FAMILY, AND WHY IT IS NOT ONE OF THE NINE
 * ----------------------------------------------------
 * REDESIGN-PLAN.md section 5 spends nine families on the home page: poster
 * stack over a photographic band, staircased statements, single-rule sequence,
 * prose measure with a gutter rail, featured object plus compact index, logo
 * baseline with running prose, horizontal snap rail, disclosure register, and
 * the full-bleed accent field. This page is a tenth: a CHRONOLOGICAL REGISTER
 * OF DATED SHEETS. Each evening opens on a full-measure hairline carrying its
 * date and its frame count on one baseline, and beneath it that evening's
 * frames lie as equal tiles on a three track grid that stops where the
 * evening's photographs stop, leaving a ragged right edge.
 *
 * That raggedness is the argument, and it is why this is not the equal grid the
 * brief warned against. The tiles are one size everywhere, so the SIZE OF EACH
 * EVENING'S BLOCK IS ITS FRAME COUNT, drawn to scale: February is two frames
 * wide, April runs to two full rows, July is two again. A reader sees the
 * unequal weight of the three nights before reading a single number, and the
 * grouping is doing real work rather than decorating a date onto a grid. Three
 * separately dated evenings is the only evidence of recurrence this site owns
 * that is not a sentence of copy (plan section 5 says so in as many words), and
 * it only reads as evidence while the frames stay attached to their date.
 *
 * A combined undifferentiated grid was the alternative and it loses exactly
 * that: ten photographs in one wall of tiles is ten photographs of one thing.
 * Per-evening sections cost three headings and buy the only argument the
 * photographs can make on their own.
 *
 * WHY EVERY TILE IS THE SAME, THUMBNAIL, SIZE. THIS IS ARITHMETIC, NOT TASTE.
 * ---------------------------------------------------------------------------
 * `photos.generated.ts` ships two tiers per gallery frame: a 640px `tile` and a
 * 1280px `view`, and it states in its own header that the grid renders `tile`
 * ONLY, because a srcset offering the large tier fetches it on any 2x display
 * and that is the whole gallery at roughly four times the weight it needs.
 *
 * Measured, not estimated. Every avif tile in this grid at once is 158,781
 * bytes against the 262,144 the manifest budgets. Promoting the three obvious
 * lead frames to the 1280 tier to run a mixed-size mosaic costs 148,631 bytes
 * and saves the 48,759 their tiles would have cost: 258,653 of 262,144, which
 * is 98.7 percent of the budget and is not headroom. So the source dictates the
 * scale of the sheet. A 640px tile is 1.6x device pixel coverage at this page's
 * widest tile of about 390 CSS px, and the lightbox is where a frame gets to be
 * large. The composition was designed around that constraint rather than
 * against it.
 *
 * MOBILE COLLAPSE, DECLARED HERE RATHER THAN ASSUMED
 * ---------------------------------------------------
 *   below 640px   one tile per row, full container width
 *   640 to 1023   two tiles per row
 *   1024 and up   three tiles per row
 * The tracks are equal fractions of the row with a 1.5rem gap, so a tile is
 * about 390 CSS px at the widest and about 358 on a 390px phone. The evening
 * headers and their hairlines are full width in every case and never collapse
 * into the tiles.
 *
 * MEASURED CONTRAST, recomputed with the WCAG relative luminance formula rather
 * than copied from the plan, light then dark. Every colour on this page is a
 * token from plan section 4.1 and no hex is written in this file.
 *
 *   --ink h1, evening headings, counter on --paper   17.965  17.965
 *   --muted lead and per-evening count on --paper     6.601   7.496
 *   1px --rule hairline above each evening           4.063   4.005
 *   1px --rule tile frame vs --paper                 4.063   4.005
 *   2px --edge tile frame on hover vs --paper        4.960   4.804
 *   focus ring outer --ink vs --paper                17.965  17.965
 *   focus ring layer against layer                   17.965  17.965
 *
 * All seven clear their floor in both modes: 4.5 for text, 3.0 for the
 * hairlines and the ring. The hairlines are full-opacity 1px and are never
 * expressed with `opacity` or an alpha colour, per plan section 4.2, which
 * measures a rule at 75 percent antialiased coverage at 2.665 and 2.764, below
 * the floor. No hairline on this page terminates on a photograph or on the
 * accent plate, and there is no accent plate here.
 *
 * TYPE. Two rungs, both already on the page's clamp ladder, so this route runs
 * the same type scale as the redesigned sections rather than opening a new one:
 * the h1 takes FinalCTA's `clamp(2.25rem, 4.6vw, 4rem)` and the evening
 * headings take ValueProps' `clamp(1.375rem, 3.2vw, 2rem)`.
 *
 * EYEBROWS: zero. Skill 4.7 budgets `ceil(sections / 3)`; this page spends none
 * of it. The h1 says what the page is and the dates say what each block is.
 *
 * MOTION, one behaviour, justified: the frames of an evening rise and fade in
 * on scroll in reading order, which says "these belong to one night" as the
 * reader arrives at it. It is plan section 6 behaviour 3 verbatim, 16px of y
 * plus opacity, 60ms stagger, `once`, `amount: 0.25`, and it is reused rather
 * than reinvented. Reduced motion renders everything at rest through
 * `MotionConfig reducedMotion="user"` in `App.tsx`, and the explicit
 * `useReducedMotion` guard below drops the `initial` state as well so nothing
 * ever starts displaced.
 *
 * THE LCP GUARD, plan section 6, applied by structure rather than by argument:
 * the page header AND the first evening render completely at rest, with no
 * `whileInView` and no opacity animation anywhere on their ancestor chain. The
 * reveal starts at the SECOND evening, which can never be the LCP element
 * because LCP only considers elements inside the initial viewport. That removes
 * the question rather than answering it, which is what the plan asks for after
 * an audit found the home hero at effective opacity 0 with zero animations
 * queued.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Every tile is a control, so it carries the two layer ring. Spelled out in
 *  full rather than composed from a constant: Tailwind scans source text for
 *  whole candidates and a template literal generates nothing. */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

interface NightSheetProps {
    night: GalleryNight;
    /** Position of this evening in the register. The first one never animates. */
    order: number;
    onOpen: (frameIndex: number) => void;
    registerTile: (slot: string, el: HTMLButtonElement | null) => void;
}

function NightSheet({ night, order, onOpen, registerTile }: NightSheetProps) {
    const headingId = useId();
    const reduce = useReducedMotion();
    const animate = order > 0 && !reduce;

    const rise = (index: number) =>
        animate
            ? {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.25 },
                transition: { duration: 0.6, delay: index * 0.06, ease: EASE },
            }
            : {};

    // Spacing between evenings is the parent's `gap`, not a margin with a
    // `first:` reset. A `first:mt-0` would be overridden by the `md:` margin in
    // the same class list once the breakpoint fired, which is the kind of
    // variant-ordering bug that only shows up at one width.
    return (
        <section aria-labelledby={headingId}>
            {/* The evening opens on a hairline. Date left, count right, one
                baseline. The count is a fact read off the data, set in tabular
                figures so the three headers line up down the page. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule pt-5">
                <h2
                    id={headingId}
                    className="text-[clamp(1.375rem,3.2vw,2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink"
                >
                    {night.label}
                </h2>
                <p className="text-sm font-medium text-muted tabular-nums">
                    {night.frames.length} {night.frames.length === 1 ? 'photograph' : 'photographs'}
                </p>
            </div>

            {/* The sheet. Equal tracks, and the evening's frames stop where they
                stop, so the block is exactly as wide and as tall as the evening
                has photographs. No empty cell is ever RENDERED to square a row
                off: a two frame evening leaves the third track unoccupied, and
                that ragged edge is the composition rather than a gap in it.

                A GRID rather than flex-wrap with computed widths, and the reason
                is a rounding hazard rather than a preference. Three items at
                `calc((100% - 3rem) / 3)` with a 1.5rem gap sum to exactly the
                line, and each one rounded to the nearest 1/64px can put the row
                a hundredth of a pixel over, which flexbox answers by wrapping
                the third tile onto its own line on some engines at some
                container widths. Equal grid tracks cannot overflow their own
                container. */}
            <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {night.frames.map((frame, index) => (
                    <motion.li key={frame.slot} {...rise(index)}>
                        <button
                            type="button"
                            ref={(el) => registerTile(frame.slot, el)}
                            onClick={() => onOpen(index)}
                            className={
                                'group block w-full text-left ' +
                                'transition-[translate,scale] duration-150 ease-out ' +
                                'active:translate-y-px active:scale-[0.985] ' +
                                FOCUS_RING
                            }
                        >
                            {/* The action reads FIRST in the accessible name, then
                                the description, because a reader tabbing a grid
                                wants to know what the control does before hearing
                                a sentence about a room. */}
                            <span className="sr-only">Enlarge this photograph. </span>

                            {/* THE FRAME. A full-opacity 1px `--rule` ring drawn
                                OUTSIDE the image, so it sits on `--paper` where it
                                measures 4.063 and 4.005 rather than on a
                                photograph where no ratio can be computed. On hover
                                it promotes to a 2px `--edge`, which is exactly the
                                mechanism plan section 4.4 prescribes for
                                full-width interactive rows and is reused here
                                rather than invented: a photographic frame is
                                radius 0 under the shape lock, so shape cannot
                                carry pressability and the hairline has to.
                                Suppressed while the button is focused so the two
                                layer ring is not sitting inside a third line.

                                Written as an arbitrary property rather than a
                                `shadow-*` utility for the reason `buttonStyles.ts`
                                records: the utility form emits a
                                `--tw-shadow-color` fallback that any passing
                                shadow-colour utility can repaint. */}
                            <span
                                className={
                                    'block [box-shadow:0_0_0_1px_var(--rule)] ' +
                                    'transition-[box-shadow] duration-150 ease-out ' +
                                    'group-hover:[box-shadow:0_0_0_2px_var(--edge)] ' +
                                    'group-focus-visible:[box-shadow:none]'
                                }
                            >
                                {/* One tier, no srcset and no sizes: see the byte
                                    arithmetic in the file header. Explicit width
                                    and height, so every box is reserved before the
                                    bytes land and this page contributes zero CLS.

                                    The first evening's two tiles load eagerly and
                                    everything below is lazy. That is a measured
                                    split rather than a habit: those two avif tiles
                                    are 25,491 bytes together and they are the only
                                    images that can be in the initial viewport, so
                                    they are the LCP candidates; the remaining eight
                                    are 133,290 bytes and none of them is visible
                                    on arrival. */}
                                {/* `block` on the <picture> as well as on the
                                    <img>: a default inline <picture> leaves a
                                    line-box descender gap under the image, which
                                    would show as a sliver of ground inside the
                                    1px frame. */}
                                <picture className="block">
                                    <source type="image/avif" srcSet={frame.tile.avif} />
                                    <source type="image/webp" srcSet={frame.tile.webp} />
                                    <img
                                        src={frame.tile.src}
                                        width={frame.tile.width}
                                        height={frame.tile.height}
                                        alt={frame.alt}
                                        loading={order === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        className="block h-auto w-full"
                                    />
                                </picture>
                            </span>
                        </button>
                    </motion.li>
                ))}
            </ul>
        </section>
    );
}

export function Gallery() {
    // `{ night, frame }` or null. Index is scoped to the evening, which is what
    // the lightbox counts against and announces.
    const [view, setView] = useState<{ night: number; frame: number } | null>(null);

    // Slot to tile button. The map exists so focus can be restored to the tile
    // of the frame the reader was LAST looking at rather than to the one they
    // opened: escaping out of photograph six and landing back on photograph one
    // loses their place in the sheet. `GalleryLightbox` deliberately does not do
    // its own restore; the contract is stated in both files.
    const tileRefs = useRef(new Map<string, HTMLButtonElement>());
    const registerTile = (slot: string, el: HTMLButtonElement | null) => {
        if (el) tileRefs.current.set(slot, el);
        else tileRefs.current.delete(slot);
    };

    const nights = galleryNights.filter((night) => night.frames.length > 0);
    const totalFrames = nights.reduce((total, night) => total + night.frames.length, 0);

    const openView = (nightIndex: number, frameIndex: number) =>
        setView({ night: nightIndex, frame: frameIndex });

    const closeView = () => {
        const current = view;
        setView(null);
        if (!current) return;
        const slot = nights[current.night]?.frames[current.frame]?.slot;
        if (!slot) return;
        // After the flush, so the tile is settled before it takes focus.
        window.requestAnimationFrame(() => {
            const el = tileRefs.current.get(slot);
            if (el && document.contains(el)) el.focus();
        });
    };

    const navigateView = (nextFrame: number) =>
        setView((current) => (current ? { ...current, frame: nextFrame } : current));

    // No <main> here. App.tsx already provides the single main landmark, and
    // this page carries exactly one <h1>.
    return (
        <div className="bg-paper pb-20 pt-14 md:pb-28 md:pt-20">
            <Container>
                {/* The header renders at rest. No entrance animation of any kind
                    on the h1's ancestor chain: it is the LCP element on this
                    route at most widths.

                    TIGHTENED 2026-08-10, and the finding it answers is accepted
                    in part and rejected in part.

                    Accepted: a design pre-flight measured about 600px of type
                    before the first photograph on a page about photographs, and
                    the arrival of the frames is the whole point of this route.
                    Four edits, none of which drops a fact: the top padding
                    comes down a step, the two lead paragraphs become one
                    shorter paragraph saying the same two things, that paragraph
                    loses a clause, and the gap to the first evening tightens.
                    MEASURED after the fact rather than claimed: the first tile
                    now lands at **509px at 1366 and 470px at 390**, against
                    about 600 before. The saving is 90px, not the 260 an earlier
                    draft of this comment asserted, and the real number is
                    printed here because an unverified improvement in a comment
                    is worse than no comment.

                    Rejected: the page does not "open with no photograph". At
                    1366x768 roughly 648px is visible after browser chrome and
                    the first sheet starts at 509, so the February frames are in
                    the initial viewport, and at 390 they start at 470. They
                    were, at 600, as well.

                    What is NOT cut is the second sentence. It is the sentence
                    that stops this page reading as a complete record, and it is
                    the reason the page can print three dates without implying
                    twelve. */}
                <header className="max-w-[62ch]">
                    <h1 className="text-[clamp(2.25rem,4.6vw,4rem)] font-medium leading-[1.02] tracking-[-0.025em] text-ink">
                        Photographs from the meetups
                    </h1>
                    {/* NO NUMERAL IN THE PROSE, deliberately. The count below is
                        computed from the data and the headings carry the dates, so
                        a hardcoded "three" here is the one sentence on this page
                        that could drift away from what actually ships the moment a
                        frame or an evening leaves the manifest. */}
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                        The IFN evenings in Austin that were photographed, grouped by evening.
                        Meetups have run without a camera in the room, so this is a record of the
                        nights that were photographed rather than of every night.
                    </p>
                </header>

                {totalFrames === 0 ? (
                    /* EMPTY STATE. Composed rather than blank, and honest about
                       which of the two possible reasons it is showing: there is
                       nothing published, not something failed to load. There is
                       no loading state and no error state on this route because
                       nothing is fetched; the frames are compiled in. */
                    <p className="mt-16 max-w-[52ch] text-lg leading-relaxed text-ink">
                        No photographs are published here yet. The meetups still run every month in
                        Austin, and the dates are on the events page.
                    </p>
                ) : (
                    <>
                        <p className="mt-8 text-sm font-medium text-muted tabular-nums">
                            {totalFrames} photographs across {nights.length} evenings.
                        </p>

                        <div className="mt-10 flex flex-col gap-16 md:mt-12 md:gap-24">
                            {nights.map((night, order) => (
                                <NightSheet
                                    key={night.date}
                                    night={night}
                                    order={order}
                                    onOpen={(frameIndex) => openView(order, frameIndex)}
                                    registerTile={registerTile}
                                />
                            ))}
                        </div>
                    </>
                )}
            </Container>

            <GalleryLightbox
                night={view ? (nights[view.night] ?? null) : null}
                index={view?.frame ?? 0}
                onClose={closeView}
                onNavigate={navigateView}
            />
        </div>
    );
}
