import { useRef, useState } from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Container } from '../components/Container';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { galleryFrames, type GalleryFrame } from '../data/photos.generated';

/**
 * THE GALLERY ROUTE. `/gallery`. REBUILT 2026-08-10 to the founder's ruling.
 *
 * WHAT CHANGED AND WHY, STATED FIRST BECAUSE THE PREVIOUS VERSION OF THIS FILE
 * ARGUED AT LENGTH FOR THE OPPOSITE OF ALL FOUR
 * ----------------------------------------------------------------------------
 * 1. NO DATES AND NO EVENT GROUPING. The page previously opened each evening on
 *    a dated hairline and drew each evening's block to the scale of its frame
 *    count. That composition made the page's strongest visual claim "there have
 *    been three nights", which is false and is the founder's stated objection.
 *    There is now no date, no evening heading, no per night section and no
 *    sr-only date string anywhere on this route or in the enlarged view. The
 *    frames are interleaved so that no reader can reconstruct a grouping from
 *    the order either.
 * 2. EVERY FRAME SHIPS. The composition below has one cell per photograph and
 *    no empty cells. The five frames the previous rounds held out are in, on
 *    the founder's call, and this file does not re-litigate any of them.
 * 3. NO VISIBLE CAPTION OR DESCRIPTION on any photograph, here or in the
 *    enlarged view.
 * 4. THE FRAMES RUN AT SIX DIFFERENT SIZES in an authored composition rather
 *    than as one wall of equal tiles, AND THAT IS TRUE ON A PHONE TOO. A
 *    design pre-flight measured the first version of this file at an effective
 *    390px and found every one of the fifteen cells at 358px: six size classes
 *    collapsing to one, which is the uniform grid the founder rejected, at the
 *    width most visitors use. Three phone size classes now carry the ladder,
 *    and the paragraph that argued against narrowing anything is REPLACED
 *    rather than left standing beside its own reversal. See MOBILE COLLAPSE.
 *
 * ALT IS NOT A CAPTION, AND THE DISTINCTION IS THE REASON ONE GOES AND THE
 * OTHER STAYS. A caption is text the page prints beside a frame and every
 * reader sees it. An `alt` attribute is never rendered to a sighted reader; it
 * is the only route by which a screen reader user perceives that a photograph
 * exists or what is in it. Deleting alt would leave fifteen images announcing
 * nothing, which is precisely the accessibility regression REDESIGN-PLAN.md
 * section 8 forbids. So: every visible caption and description is gone, and
 * every `alt` is kept, on the grid and in the enlarged view.
 *
 * WHAT THE PAGE CLAIMS
 * --------------------
 * That these are photographs from IFN meetups in Austin, and that they are a
 * selection rather than a record of every meetup. It prints no date, no count
 * of evenings, no count of meetups, and it calls itself neither an archive nor
 * complete. Nothing on it can be read as a claim about how many meetups there
 * have been.
 *
 * THE LAYOUT FAMILY, AND WHY IT IS NOT ONE OF THE ELEVEN ON THE HOME PAGE
 * -----------------------------------------------------------------------
 * AN AUTHORED HANG. Nine unequal rows on one twelve column measure: six rows
 * of two frames at different scales, three rows of a single frame with a placed
 * void, all on one left spine, with two rows hung from a bottom rail instead of
 * a top one. The home page's nearest neighbour is `GalleryPreview`, which is a
 * single unequal two column set in ONE row; this is a nine row composition with
 * a six step size ladder and three solo statements, and nothing else on the
 * site is a multi row asymmetric image composition.
 *
 * The only honest axis of variation is SCALE, not shape. All fifteen sources
 * are 4000x2252 landscape and there is no portrait or square frame in the
 * folder; a portrait crop of a circle of fifteen people cuts people out of it,
 * which is the opposite of the instruction to favour people and faces. So the
 * ladder moves area, and cell size follows SUBJECT scale: a frame carrying
 * fifteen people at distance needs area before it reads at all, while a frame
 * whose subject is one bright object is fully legible at 389px and gains
 * nothing at 906.
 *
 * THE SIZE LADDER, arithmetic rather than assertion. `Container` is
 * `max-w-7xl` with `px-4 sm:px-6 lg:px-8`, so the content measure is 1216 at
 * 1280 and above, 960 at 1024, 720 at 768 and 328 at 360. With twelve tracks
 * and a 24px gap a cell of `span` columns is
 *   span * (measure - 264) / 12 + (span - 1) * 24
 * which at 1216 gives 906, 803, 699, 596, 493 and 389 for spans 9 to 4, and at
 * 960 gives 714 down to 304. Largest to smallest is 2.33x and no cell is ever a
 * thumbnail.
 *
 * WHY THE VOIDS ARE THE COMPOSITION. Row 1 leaves three columns of air on the
 * right and row 5 answers it with five columns of air on the left. Row 4 is the
 * only row that steps off the left spine entirely, and it is the quietest row
 * in the set, two small frames, so the indent reads as a pause. Rows 3 and 6
 * hang from a bottom rail while the rest sit on a top rail, so the air appears
 * above and below alternately, which is how a real hang works and is the one
 * thing a uniform grid cannot do. Skill 4.7's bento rule is about empty CELLS;
 * unoccupied grid area is the opposite of a blank tile, and there are exactly
 * as many cells as there are photographs.
 *
 * MOBILE COLLAPSE, DECLARED HERE RATHER THAN ASSUMED
 * ---------------------------------------------------
 *   below 640px    one column, THREE size classes, DOM order preserved.
 *
 *                    bleed   `-mx-3`, the three frames at spans 9 and 8.
 *                            352px at 360, 382px at 390. The negative margin
 *                            eats 12 of the container's 16px of side padding,
 *                            so the frame all but touches the screen edge.
 *                    measure the five frames at spans 7 and 6, at the full
 *                            container width, 328px at 360 and 358px at 390.
 *                    inset   the seven frames at spans 5 and 4, at 85 percent
 *                            of the measure, 279px at 360 and 304px at 390,
 *                            hung alternately against the left and the right
 *                            edge of the column.
 *
 *                  Ratio largest to smallest 1.26x, three classes, and the
 *                  alternation is doing at least as much of the work as the
 *                  width: the inset frames step left, right, left, right down
 *                  the scroll while the bleed frames run past both edges, so
 *                  the phone reads as a hang rather than as a stack. 16px
 *                  between the two frames of a pair, 40px between rows,
 *                  unchanged.
 *
 *                  THE PARAGRAPH THIS REPLACES ARGUED THAT NO FRAME SHOULD BE
 *                  NARROWED AT ALL, on the grounds that a 78 percent cell is
 *                  256px wide and 144px tall and stops being a photograph.
 *                  That arithmetic is right and its conclusion was too wide.
 *                  It is narrowed rather than voided: the rule now applies to
 *                  the frames whose subject NEEDS area, which is the same
 *                  editorial mapping the desktop ladder uses. Every frame in
 *                  the inset class is one this file already judges "fully
 *                  legible at 389px", a lit screen or a room with no legible
 *                  group in it, and 85 percent rather than 78 puts the worst
 *                  case at 279 x 157 at 360 rather than 256 x 144. No frame
 *                  carrying a readable group of people is ever narrowed: those
 *                  are the bleed and measure classes, and on a phone they run
 *                  WIDER than the single width the previous version shipped.
 *
 *                  WHY THE BLEED STOPS 4px SHORT OF THE SCREEN EDGE RATHER
 *                  THAN AT IT. Every cell is a button and its focus ring is
 *                  drawn OUTSIDE it, 2px `--paper` then 2px `--ink`. A cell at
 *                  exactly 100vw pushes the ring's left and right legs off the
 *                  viewport, which degrades the keyboard affordance on exactly
 *                  the three largest frames and is invisible to every gate in
 *                  this repository. `-mx-3` rather than `-mx-4` leaves a 4px
 *                  gutter on each side, which is the ring's exact width, so
 *                  the ring renders whole and the frame still reads as running
 *                  off the edge.
 *   640 to 1023    the twelve column grid is kept and the spans compress to a
 *                  four value map, so the pair rows do not all collapse to one
 *                  shape. Four distinct pair shapes plus two solo shapes. The
 *                  three phone classes all reset at `sm`, each one explicitly,
 *                  because a missing reset would silently change the hang.
 *   1024 and up    the full map. The composition does not change shape between
 *                  1024 and 1440, only size.
 *
 * THREE GAPS, NOT ONE, AND THE ASYMMETRY IS THE POINT. Within a row the gap is
 * the grid's own 24px, which is what the column arithmetic above is computed
 * against. BETWEEN rows it is 40px at every width. A uniform 24px in both
 * directions makes the nine rows read as one continuous field, which is exactly
 * the texture this composition exists to avoid: the rows have to separate for
 * the alternating top and bottom rails to be legible as a rhythm rather than as
 * misalignment. Below 640 the pair gap drops to 16px while the row gap stays at
 * 40, so the phone scroll keeps the same grouping with no size cue available.
 *
 * COMPUTED PAGE HEIGHTS, from the ladder above rather than from a screenshot.
 * The hang alone, nine rows plus eight 40px gaps, is 3,803px at 1440, 3,058 at
 * 1024, 2,814 at 768 and 3,030 at 360. The tallest row is row 1 at 510px and
 * the shortest is row 4 at 277. The 360 figure moved from 3,184 when the three
 * phone classes landed: the seven inset frames each give back about 28px of
 * height and the three bleed frames each take about 13px back, which nets 154px
 * shorter. Re-measured on the built page rather than left as arithmetic.
 *
 * LOADING AND THE REAL BYTE COST, MEASURED OFF THE BUILT FILES
 * -------------------------------------------------------------
 * The photo pipeline now builds ONE tile per gallery frame, sized to the cell
 * that frame occupies in this composition rather than to a single grid width:
 * 960w for the span 9 cell, 832w for the two span 8 cells, 704w for the two
 * span 7 cells and 640w for the ten cells at spans 6, 5 and 4. That is the
 * right shape for an unequal hang and it removes the whole negotiation: every
 * cell here renders exactly one url per format, with NO `srcset` and NO
 * `sizes`, so there is no sizes string that can be wrong and no device pixel
 * ratio that can pull a large tier into a 389px cell. The page costs the same
 * bytes at 1x and at 2x.
 *
 * Coverage at 1x, cell width against tile width: 906/960, 803/832, 699/704,
 * 596/640, 493/640, 389/640. Every cell is at or above 1.0x and the smallest
 * cells reach 1.64x, which is the coverage the previous equal grid shipped at
 * its widest tile.
 *
 * THE THREE PHONE CLASSES ADD NO TIER AND NO BYTE. The widest phone cell is the
 * bleed class at 382px at a 390 viewport, and the smallest tile this pipeline
 * builds is 640px, so every phone cell is already covered above 1.6x by the
 * tile it was going to fetch anyway. A pre-flight suggested "one extra tile
 * tier" alongside the bleed; there is nothing for it to do, and adding one
 * would re-open the 272,765 against 286,720 budget line for no rendered
 * difference.
 *
 * Measured on the built avif tiles rather than estimated, by summing the files
 * on disk, and cross checked against the pipeline's own `galleryTileBytesAvif`
 * export on 2026-08-10, which agrees to the byte. The figures below are a
 * COMMENT and nothing imports them, so they can go stale exactly as freely as
 * every other number this repository has had to correct: re-read them, do not
 * trust them, any time the manifest changes.
 *
 *   full scroll, all fifteen avif tiles, any viewport, any ratio   272,765
 *   ARRIVAL cost, the one eager tile in the initial viewport        36,105
 *
 * Only the first row's frame is `eager`. It is the only image that can be in
 * the initial viewport at any width, and the fourteen below it are `lazy`,
 * which is the precondition the generated file states for that arrival figure.
 *
 * The 1280px `view` tier is never fetched by this page. It is fetched only when
 * a reader opens a frame, and its 695,440 bytes across fifteen frames are the
 * reason it must never appear in a grid srcset.
 *
 * RECONCILED WITH THE MANIFEST 2026-08-10, and the previous version of this
 * paragraph is replaced rather than left standing, because it described a state
 * of the repository that no longer exists. It said the manifest budgeted
 * `galleryTilesAvifBytes` at 262,144, that fifteen frames at six sizes cost
 * 272,765, that this was 10,621 over, and that the overrun was reported in the
 * handover because the manifest was not this file's to edit. The manifest has
 * since taken that edit: the cap is restated at 286,720 in
 * `scripts/photos.manifest.json`, with the raise recorded there as a raise
 * rather than dressed up as a pass, and the pipeline's own budget check now
 * reports 272,765 against 286,720 and PASSES. There is no overrun outstanding
 * and nothing left in anyone's handover on this line.
 *
 * ONE HAIRLINE ON THE PAGE, and the reading that produces it is stated rather
 * than taken silently. The composition specifies a single full measure 1px
 * `--rule` under the header as the picture rail. The tiles previously each
 * carried a resting 1px `--rule` ring, which would put fifteen more rules on a
 * page that is meant to have one. That ring is dropped at REST and kept as a
 * transient: hover promotes a 2px `--edge` frame outside the image, exactly the
 * mechanism plan section 4.4 prescribes for full width interactive rows, and
 * `GalleryPreview` already ships photographs with no resting border, so there
 * is precedent for both halves. The two layer focus ring is untouched and is
 * NOT a compositional rule: it is mandatory, identical in both modes, and never
 * reversed.
 *
 * MEASURED CONTRAST, recomputed with the WCAG relative luminance formula in
 * python rather than copied, light then dark. Every colour is a token from plan
 * section 4.1 and no hex is written in this file.
 *
 *   --ink h1 and rail-adjacent type on --paper       17.965  17.965
 *   --muted lead paragraph on --paper                 6.601   7.496
 *   1px --rule picture rail vs --paper                4.063   4.005
 *   2px --edge hover frame vs --paper                 4.960   4.804
 *   focus ring outer --ink vs --paper                17.965  17.965
 *   focus ring inner --paper vs outer --ink          17.965  17.965
 *
 * All six clear their floor in both modes: 4.5 for text, 3.0 for the rail, the
 * hover frame and the ring. The rail is a full opacity 1px `--rule` and is
 * never expressed with `opacity` or an alpha colour, per plan section 4.2,
 * which measures a rule at 75 percent antialiased coverage at 2.665 and 2.764,
 * below the floor. The rail terminates on the container edges and never on a
 * photograph. No type sits on any photograph anywhere on this route.
 *
 * TYPE. Two rungs, both already on the page's clamp ladder. EYEBROWS: zero.
 *
 * MOTION, one behaviour, reused rather than invented: plan section 6 behaviour
 * 3, `whileInView` 16px of y plus opacity, 60ms stagger across the frames of a
 * row, `once`, `amount: 0.25`. It says "these two were hung together" as the
 * reader arrives at a row. Reduced motion renders everything at rest through
 * `MotionConfig reducedMotion="user"` in `App.tsx`, and the explicit
 * `useReducedMotion` guard drops the `initial` state as well so nothing ever
 * starts displaced.
 *
 * THE LCP GUARD, plan section 6, applied by structure rather than by argument:
 * the header AND the first row render completely at rest, with no `whileInView`
 * and no opacity animation anywhere on their ancestor chain. The reveal starts
 * at the second row, which can never be the LCP element because LCP only
 * considers elements inside the initial viewport.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Plan section 6 behaviour 3. Same shape as `GalleryPreview`'s helper. */
function reveal(active: boolean, delay: number): MotionProps {
    if (!active) return {};
    return {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.6, delay, ease: EASE },
    };
}

/** Every cell is a control, so it carries the two layer ring. Spelled out in
 *  full rather than composed from a constant: Tailwind scans source text for
 *  whole candidates and a template literal generates nothing. */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

interface Cell {
    /**
     * Preference list of slot names, most specific first. Resolved against the
     * frames the photo pipeline actually ships, in order, skipping any slot
     * already taken by an earlier cell.
     *
     * TYPED AS `string`, NOT AS THE `PhotoSlot` UNION, AND THE DEPARTURE FROM
     * HOUSE STYLE IS DELIBERATE. `GalleryPreview` names its slots as
     * `PhotoSlot` precisely so a frame leaving the manifest is a compile error
     * rather than a blank box, and that is the right trade when the manifest is
     * stable. It is the wrong trade this round: the photo pipeline is being
     * rebuilt in the same working tree, five of these slot names do not exist
     * yet, and one of them (`founder-story`) is expected to be repointed at a
     * different source. A typed union there does not protect this page, it
     * blocks everybody's build. String keys plus a runtime skip is the safe
     * form while the two sides land, and the fill pass below means no
     * photograph the pipeline ships is ever silently dropped.
     */
    slots: string[];
    /**
     * Literal, complete Tailwind candidates. NEVER interpolated from the span
     * numbers: Tailwind v4 scans source text for whole class names and a
     * template literal generates nothing, so an interpolated `lg:col-span-9`
     * would silently fall back to auto placement and the entire composition
     * would evaporate with no error anywhere.
     */
    place: string;
    /**
     * The phone size class, below 640px, where the twelve column grid is not
     * running and `place` therefore does nothing. One of the three constants
     * below. Every one of them resets itself at `sm` so the hang above is
     * untouched from 640 up.
     */
    phone: string;
}

/**
 * THE THREE PHONE SIZE CLASSES. Literal, complete Tailwind candidates for the
 * same reason `place` is: v4 scans source text for whole class names.
 *
 * `BLEED` eats 12 of the container's 16px of side padding, leaving a 4px gutter
 * that is exactly the width of the focus ring drawn outside the button. `INSET`
 * runs at 85 percent of the measure and hangs against one edge of the column;
 * the two variants alternate down the page in reading order. `MEASURE` is the
 * full container width and needs no class at all, and is spelled out as an
 * empty string so every cell below declares its class rather than omitting it.
 */
const BLEED = '-mx-3 sm:mx-0';
const MEASURE = '';
const INSET_LEFT = 'w-[85%] mr-auto sm:mr-0 sm:w-auto';
const INSET_RIGHT = 'w-[85%] ml-auto sm:ml-0 sm:w-auto';

interface Row {
    /** Rows 3 and 6 hang from a bottom rail. */
    align: 'start' | 'end';
    cells: Cell[];
}

/**
 * THE HANG. Nine rows, fifteen cells, read top to bottom.
 *
 * Weight alternates: solo, pair, pair, quiet pair, solo, pair, pair, pair,
 * solo, with the large frame falling right, left, right, then left, right,
 * left. The sequence is edited rather than dumped: the three wide circle frames
 * land in rows 1, 6 and 8, the two lit screen frames in rows 3 and 6, and
 * daylight and night alternate rather than clustering. The page opens on the
 * strongest room frame and closes on the group portrait, which is the most
 * faces and the most energy in the folder and the right last note for a
 * community wall.
 *
 * THE PHONE CLASS PER CELL IS THE SAME EDITORIAL MAPPING AS THE DESKTOP SPAN,
 * not a second decision: spans 9 and 8 take `BLEED`, spans 7 and 6 take
 * `MEASURE`, spans 5 and 4 take an `INSET`. Three bleed, five measure, seven
 * inset. The inset variants alternate right, left, right, left, right, left,
 * right in rendered reading order, which is the phone's version of the left and
 * right beat the desktop hang gets from its voids.
 */
const HANG: Row[] = [
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-apr-room'],
                place: 'sm:col-start-1 sm:col-span-12 lg:col-start-1 lg:col-span-9',
                phone: BLEED,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-jul-hall'],
                place: 'sm:col-start-1 sm:col-span-5 lg:col-start-1 lg:col-span-4',
                phone: INSET_RIGHT,
            },
            {
                slots: ['gallery-apr-gesture'],
                place: 'sm:col-start-6 sm:col-span-7 lg:col-start-6 lg:col-span-7',
                phone: MEASURE,
            },
        ],
    },
    {
        align: 'end',
        cells: [
            {
                slots: ['gallery-apr-listening'],
                place: 'sm:col-start-1 sm:col-span-7 lg:col-start-1 lg:col-span-6',
                phone: MEASURE,
            },
            {
                slots: ['gallery-feb-sign'],
                place: 'sm:col-start-8 sm:col-span-5 lg:col-start-8 lg:col-span-5',
                phone: INSET_LEFT,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-jul-screen'],
                place: 'sm:col-start-2 sm:col-span-5 lg:col-start-3 lg:col-span-4',
                phone: INSET_RIGHT,
            },
            {
                // `founder-story` is the LANDING slot that currently carries
                // this frame, and it is listed second rather than first because
                // the photography round is expected to repoint it at a
                // different source. If a dedicated gallery slot arrives it wins;
                // if neither resolves, the fill pass below still places whatever
                // the pipeline shipped instead.
                slots: ['gallery-feb-hall', 'founder-story'],
                place: 'sm:col-start-8 sm:col-span-5 lg:col-start-8 lg:col-span-5',
                phone: INSET_LEFT,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-jul-standing'],
                place: 'sm:col-start-3 sm:col-span-10 lg:col-start-6 lg:col-span-7',
                phone: MEASURE,
            },
        ],
    },
    {
        align: 'end',
        cells: [
            {
                slots: ['gallery-apr-seated'],
                place: 'sm:col-start-1 sm:col-span-8 lg:col-start-1 lg:col-span-8',
                phone: BLEED,
            },
            {
                slots: ['gallery-feb-slide'],
                place: 'sm:col-start-9 sm:col-span-4 lg:col-start-9 lg:col-span-4',
                phone: INSET_RIGHT,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-apr-profile'],
                place: 'sm:col-start-1 sm:col-span-5 lg:col-start-1 lg:col-span-5',
                phone: INSET_LEFT,
            },
            {
                slots: ['gallery-apr-floor'],
                place: 'sm:col-start-6 sm:col-span-7 lg:col-start-7 lg:col-span-6',
                phone: MEASURE,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-apr-circle'],
                place: 'sm:col-start-1 sm:col-span-7 lg:col-start-1 lg:col-span-6',
                phone: MEASURE,
            },
            {
                slots: ['gallery-feb-room'],
                place: 'sm:col-start-8 sm:col-span-5 lg:col-start-9 lg:col-span-4',
                phone: INSET_RIGHT,
            },
        ],
    },
    {
        align: 'start',
        cells: [
            {
                slots: ['gallery-apr-group'],
                place: 'sm:col-start-1 sm:col-span-12 lg:col-start-1 lg:col-span-8',
                phone: BLEED,
            },
        ],
    },
];

/** Placement for any frame the pipeline ships that the hang does not name. It
 *  is a full measure row rather than a guessed size, because an unrecognised
 *  frame has no audited subject scale and inventing one would be inventing a
 *  composition. Alternating start so the appended run is not a stack. */
const OVERFLOW_PLACE = [
    'sm:col-start-1 sm:col-span-12 lg:col-start-1 lg:col-span-8',
    'sm:col-start-1 sm:col-span-12 lg:col-start-5 lg:col-span-8',
];

interface PlacedCell {
    cell: Cell;
    frame: GalleryFrame;
    /** Position in the rendered reading order. The enlarged view counts and
     *  navigates against this, so previous and next follow the composition
     *  rather than the manifest. */
    order: number;
}

interface PlacedRow {
    align: 'start' | 'end';
    cells: PlacedCell[];
    /** Row 0 renders at rest under the LCP guard. */
    animate: boolean;
}

/**
 * TWO PASS ALLOCATION, and both passes exist for a stated reason.
 *
 * Pass one resolves each cell against its own preference list, so a photograph
 * lands in the cell whose SIZE its subject was judged at. A slot that does not
 * resolve leaves that cell EMPTY rather than shifting the other fourteen: the
 * voids are the composition, and a shifted grid is a bug rather than a smaller
 * version of the design.
 *
 * Pass two puts every frame the pipeline shipped that no cell claimed into the
 * first empty cell, in manifest order, and appends anything still left over on
 * its own row. That is the safety net for a round in which the photo pipeline
 * is being rebuilt in the same working tree: a renamed slot costs a frame its
 * intended size, and it never costs the frame its place on the page.
 */
function allocate(frames: GalleryFrame[]): PlacedRow[] {
    const bySlot = new Map<string, GalleryFrame>();
    for (const frame of frames) bySlot.set(frame.slot as string, frame);

    const cells = HANG.flatMap((row) => row.cells);
    const taken = new Set<string>();
    const resolved: (GalleryFrame | null)[] = cells.map((cell) => {
        const hit = cell.slots.find((slot) => bySlot.has(slot) && !taken.has(slot));
        if (!hit) return null;
        taken.add(hit);
        return bySlot.get(hit) ?? null;
    });

    const spare = frames.filter((frame) => !taken.has(frame.slot as string));
    let next = 0;
    for (let i = 0; i < resolved.length && next < spare.length; i += 1) {
        if (!resolved[i]) {
            resolved[i] = spare[next];
            next += 1;
        }
    }

    let order = 0;
    let cursor = 0;
    const rows: PlacedRow[] = [];
    for (const row of HANG) {
        const placed: PlacedCell[] = [];
        for (const cell of row.cells) {
            const frame = resolved[cursor];
            cursor += 1;
            if (!frame) continue;
            placed.push({ cell, frame, order });
            order += 1;
        }
        if (placed.length > 0) {
            rows.push({ align: row.align, cells: placed, animate: rows.length > 0 });
        }
    }

    for (const frame of spare.slice(next)) {
        rows.push({
            align: 'start',
            animate: true,
            cells: [
                {
                    cell: {
                        slots: [],
                        place: OVERFLOW_PLACE[rows.length % 2],
                        phone: MEASURE,
                    },
                    frame,
                    order,
                },
            ],
        });
        order += 1;
    }

    return rows;
}

function FrameImage({ frame, eager }: { frame: GalleryFrame; eager: boolean }) {
    const { tile } = frame;
    return (
        /* `block` on the <picture> as well as on the <img>: a default inline
           <picture> leaves a line box descender gap under the image.

           ONE url per format, no `srcset` and no `sizes`. The pipeline builds
           this frame's tile at the width of the cell it occupies, so there is
           nothing left to negotiate and nothing a device pixel ratio can get
           wrong. The 1280 `view` tier is never named here; it belongs to the
           enlarged view and putting it in a grid srcset is the failure the
           generated file's own header warns about.

           Explicit width and height, so every box is reserved before the bytes
           land and this page contributes zero CLS. */
        <picture className="block">
            <source type="image/avif" srcSet={tile.avif} />
            <source type="image/webp" srcSet={tile.webp} />
            <img
                src={tile.src}
                width={tile.width}
                height={tile.height}
                alt={frame.alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-auto w-full"
            />
        </picture>
    );
}

export function Gallery() {
    /** Index into the rendered reading order, or null when nothing is open. */
    const [openAt, setOpenAt] = useState<number | null>(null);

    // Slot to cell button. The map exists so focus can be restored to the cell
    // of the frame the reader was LAST looking at rather than to the one they
    // opened: escaping out of photograph six and landing back on photograph one
    // loses their place on the wall. `GalleryLightbox` deliberately does not do
    // its own restore; the contract is stated in both files.
    const cellRefs = useRef(new Map<string, HTMLButtonElement>());
    const registerCell = (slot: string, el: HTMLButtonElement | null) => {
        if (el) cellRefs.current.set(slot, el);
        else cellRefs.current.delete(slot);
    };

    const reduce = useReducedMotion();

    // The route renders whatever the photo pipeline ships. `galleryFrames` is a
    // FLAT array in composition order and carries no date and no grouping of
    // any kind, which is the shape this page needs and the shape the pipeline
    // now emits.
    const rows = allocate(galleryFrames);
    const rendered = rows.flatMap((row) => row.cells.map((cell) => cell.frame));

    const closeView = () => {
        const at = openAt;
        setOpenAt(null);
        const slot = at === null ? undefined : rendered[at]?.slot;
        if (!slot) return;
        // After the flush, so the cell is settled before it takes focus.
        window.requestAnimationFrame(() => {
            const el = cellRefs.current.get(slot);
            if (el && document.contains(el)) el.focus();
        });
    };

    // No <main> here. App.tsx already provides the single main landmark, and
    // this page carries exactly one <h1>.
    return (
        <div className="bg-paper pb-20 pt-14 md:pb-28 md:pt-20">
            <Container>
                {/* The header renders at rest. No entrance animation of any kind
                    on the h1's ancestor chain: it is the LCP element on this
                    route at most widths.

                    NO NUMERAL AND NO DATE IN THE PROSE. The second sentence is
                    the one that stops this page reading as a complete record,
                    and it is the reason the page can show fifteen frames without
                    implying anything at all about how many meetups there have
                    been. */}
                <header className="max-w-[62ch]">
                    <h1 className="text-[clamp(2.25rem,4.6vw,4rem)] font-medium leading-[1.02] tracking-[-0.025em] text-ink">
                        Photographs from the meetups
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                        Frames from IFN meetups in Austin. Meetups have run without a camera in the
                        room, so this is a selection rather than a record of every one.
                    </p>
                </header>

                {rendered.length === 0 ? (
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
                        {/* THE PICTURE RAIL. The one hairline on this page. It
                            terminates on the container edges and never on a
                            photograph. Full opacity 1px `--rule`, never an
                            alpha and never a fractional offset. */}
                        <div className="mt-10 border-t border-rule md:mt-12" />

                        <div className="mt-10 flex flex-col gap-10 sm:mt-12">
                            {rows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={
                                        'grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6 ' +
                                        (row.align === 'end' ? 'sm:items-end' : 'sm:items-start')
                                    }
                                >
                                    {row.cells.map(({ cell, frame, order }, cellIndex) => (
                                        <motion.div
                                            key={frame.slot}
                                            {...reveal(row.animate && !reduce, cellIndex * 0.06)}
                                            className={
                                                cell.phone === ''
                                                    ? cell.place
                                                    : cell.phone + ' ' + cell.place
                                            }
                                        >
                                            <button
                                                type="button"
                                                ref={(el) => registerCell(frame.slot, el)}
                                                onClick={() => setOpenAt(order)}
                                                className={
                                                    'group block w-full text-left ' +
                                                    'transition-[translate,scale] duration-150 ease-out ' +
                                                    'active:translate-y-px active:scale-[0.985] ' +
                                                    FOCUS_RING
                                                }
                                            >
                                                {/* The ACTION reads first in the
                                                    accessible name and the alt
                                                    follows it, because a reader
                                                    tabbing a wall wants to know
                                                    what the control does before
                                                    hearing a sentence about a
                                                    room. This is sr-only, so it
                                                    is not a visible caption. */}
                                                <span className="sr-only">
                                                    Enlarge this photograph.{' '}
                                                </span>

                                                {/* NO RESTING BORDER. Hover
                                                    promotes a 2px `--edge` frame
                                                    drawn OUTSIDE the image, so it
                                                    sits on `--paper` where it
                                                    measures 4.960 and 4.804
                                                    rather than on a photograph
                                                    where no ratio can be
                                                    computed. Suppressed while the
                                                    button is focused so the two
                                                    layer ring is not sitting
                                                    inside a third line.

                                                    Written as an arbitrary
                                                    property rather than a
                                                    `shadow-*` utility for the
                                                    reason `buttonStyles.ts`
                                                    records: the utility form
                                                    emits a `--tw-shadow-color`
                                                    fallback that any passing
                                                    shadow colour utility can
                                                    repaint. */}
                                                <span
                                                    className={
                                                        'block ' +
                                                        'transition-[box-shadow] duration-150 ease-out ' +
                                                        'group-hover:[box-shadow:0_0_0_2px_var(--edge)] ' +
                                                        'group-focus-visible:[box-shadow:none]'
                                                    }
                                                >
                                                    <FrameImage
                                                        frame={frame}
                                                        eager={rowIndex === 0}
                                                    />
                                                </span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Container>

            <GalleryLightbox
                frames={rendered}
                index={openAt}
                onClose={closeView}
                onNavigate={setOpenAt}
            />
        </div>
    );
}
