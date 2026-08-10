import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Container } from './Container';
import { photos } from '../data/photos.generated';

/**
 * FOUNDER STORY. Phase 3 of REDESIGN-PLAN.md ("The Sign").
 *
 * Layout family, section 5 row 4: "Prose measure with a hanging gutter rail".
 * One 62ch measure of running prose on the left, a three fact `<dl>` hanging in
 * the gutter beside it under a single hairline, and one photograph stacked
 * underneath the prose in the same column. No cards, no icons, no badges, no
 * eyebrow.
 *
 * WHY THE GEOMETRY IS WHAT IT IS
 * ------------------------------
 * The grid is `[minmax(0,36rem) minmax(0,17rem)]` at `lg`. Both tracks have a
 * fixed maximum, so grid packs them to the start and every pixel the viewport
 * gains past about 1000px falls off the RIGHT edge as empty space rather than
 * widening the measure. That is the asymmetric offset DESIGN_VARIANCE 7 buys:
 * the section is deliberately narrower and quieter than its neighbours, and it
 * still starts on the same left spine as every other section because the
 * `Container` size is the page default.
 *
 * The rail sits 56px from the prose rather than at the page's right margin,
 * because a hanging rail is marginalia: it annotates the paragraph beside it,
 * and 300px of gutter would turn it into an unrelated second column. The void
 * goes on the outside of the rail, not between the rail and the thing it
 * qualifies.
 *
 * The rail is placed on grid ROW 2, beside the prose, not beside the headline.
 * The headline runs unopposed across the top with the gutter empty next to it.
 * That is the "hanging" in a hanging rail: the facts hang off the body copy,
 * which is the thing they qualify.
 *
 * 36rem is the track and `max-w-[62ch]` on the prose is the real constraint.
 * `ch` resolves against the element's own font size, so 62ch has to be declared
 * on the 17px prose (about 580px) and cannot be declared on the grid container,
 * which inherits 16px and would silently give a 546px measure instead.
 *
 * THE PHOTOGRAPH
 * --------------
 * Section 5 allocates no image to this section and this component previously
 * said so in as many words. The founder overrode that: photography goes into
 * the middle third of the page, which otherwise runs about 6000px from here to
 * the FAQ with no image, no colour field and no change of scale. The override
 * is recorded rather than absorbed, and two things about it are named here
 * rather than left for a reader to discover.
 *
 * First, the frame is `meetups/20260226_184622.jpg`, which plan section 7 lists
 * as **still excluded** on a composition judgment that never depended on
 * consent ("honest and self-defeating at the same time"). The photo pipeline
 * reselected it for this slot on the argument that this section is not a
 * marketing frame: it is headed "The meetups came first" and it says IFN began
 * as a room and everything else came afterwards, and this is the earliest dated
 * frame in the folder. That argument is reasonable and it is still a shipped
 * page disagreeing with a binding document, so the plan is what has to be
 * updated, not quietly this file.
 *
 * Second, the frame ships uncaptioned, like the hero band and the HowItWorks
 * stop, so a reader cannot know it is the February room. Against a first
 * paragraph that says "a room full of international founders", a sparse room
 * with rows of empty chairs can read as a thin turnout rather than as a
 * beginning. A `--muted` date line under the frame would fix that and would
 * stay inside the Plate Rule, but plan section 7 states that no caption on this
 * page prints a date, and a date here is markable under the accent licence,
 * which would put a second mark in this section. So it ships uncaptioned and
 * the tension is handed to whoever owns the frame.
 *
 * WHY IT IS STACKED IN THE PROSE COLUMN RATHER THAN SET BESIDE THE TEXT
 * --------------------------------------------------------------------
 * The image is grid ROW 3, starting in COLUMN 1: directly under the prose, on
 * the same left spine, and it does **not** sit beside the text. So the section
 * stays one column of type with one rail hanging off it, and it does not become
 * an image and text split. That matters mechanically rather than aesthetically:
 * skill 4.7 caps consecutive image-plus-text splits, HowItWorks already carries
 * the page's only one, and a split here would put a second one two sections
 * later. Spanning both tracks does not change that, because a frame under a
 * measure is a stack whatever its width is.
 *
 * WIDTH, WIDENED 2026-08-10 FROM 576 TO 904 CSS PX, AND WHY THE OLD ARGUMENT
 * FELL
 * ---------------------------------------------------------------------------
 * This comment used to argue 576px on the grounds that "the manifest's tier
 * ladder for this slot tops out at 1280, so 576 is the widest placement that
 * still has 2x device pixels behind it". A design pre-flight measured what that
 * bought: a 576x324 frame inside a section 1216px wide and 1154px tall, sitting
 * bottom left with about 640px of empty ground to its right, and called it
 * decoration in a gap rather than a change of rhythm. It was right, and the
 * reason the frame was that size was a build artifact setting a composition
 * decision.
 *
 * So the ladder moved instead of the composition. 904px is `36rem + 3.5rem
 * gutter + 17rem`, which is the section's own grid at `lg`, so the frame is now
 * the floor of the section rather than a thumbnail parked under one column of
 * it. 904 at 2x needs 1808; the source is 4000x2252 and the manifest's global
 * hard cap is 1920, so a 1920 tier is buildable with no new source and no cap
 * violation, and it gives 2.12x. That tier was added in the same edit, which is
 * why this is one decision rather than two.
 *
 * `max-w-[56.5rem]` rather than `max-w-none`, because the two tracks are
 * `minmax(0,36rem)` and `minmax(0,17rem)` and grid packs them to the start: a
 * column spanning element with no cap would stretch to the full 1216px
 * container at 1280 and up and overhang the rail's right edge by 312px, which
 * would put the frame's right edge on nothing. 56.5rem is exactly where the
 * rail ends.
 *
 * `sizes` is read from the manifest rather than written here, so the module
 * stays the single source of truth. With the `max-w-[36rem]` cap that still
 * applies below `lg`, the declared "(max-width: 1023px) 100vw" over-declares
 * between roughly 608px and 1023px of viewport. That direction is safe: it can
 * cost one tier up on a tablet at 1x and it can never produce a soft image. At
 * `lg` and above the 904px branch is exact, and a 1440 viewport at 1x selects
 * the 960 tier, which is the branch the landing page photography budget is
 * measured on.
 *
 * MOBILE COLLAPSE, DECLARED HERE RATHER THAN ASSUMED
 * --------------------------------------------------
 * Below `lg` (1024px) the grid is a single column: headline, prose, then the
 * rail full width beneath it with its hairline running the full column, then
 * the photograph. The rail keeps a `max-w-[34rem]` cap below `lg` so its 15px
 * detail lines never stretch to the full 975px column at 1023px, and drops the
 * cap at `lg` where the 17rem track is the narrower constraint. The photograph
 * keeps its `max-w-[36rem]` cap at every width, so it never outgrows the
 * measure the rest of the section is set to and the left spine holds from 360px
 * up. There is no intermediate two column state on purpose: a 62ch measure plus
 * a 17rem rail plus a gutter does not fit inside 768px, so a `md` split would
 * produce a squeezed measure rather than a layout. Everything below 1024px is
 * one column, `px-4` at the container.
 *
 * DOM order is headline, prose, rail, photograph, which is the visual order at
 * every width including `lg`, where the rail sits to the right of the prose it
 * follows and the photograph sits below both. Nothing here is focusable, so the
 * only reading order that exists is the DOM one and it matches.
 *
 * THE MARK
 * --------
 * Section 2 licenses the accent to a phrase "checkable against a named artifact
 * on this page". Exactly one phrase in this section takes it: the `<dt>`
 * "Hosted by our venue partner", and it is checkable twice over without leaving
 * the page. `PartnersStrip` names which partner is the venue in its running
 * prose, and `EventsPreview` prints the featured meetup's `location_name`
 * straight from the feed, which is the street address. It is accent type plus a
 * 3px accent rule, which is both halves of the mark rather than colour alone,
 * so the 2.547 light and 3.256 dark reading of accent against surrounding ink
 * body copy (WCAG 1.4.1, technique G183) is never the mechanism carrying
 * meaning.
 *
 * **Standing condition on this mark, and it is a deletion instruction rather
 * than a relicensing one.** The bundled events snapshot's last row is dated
 * 2026-12-25. `EventsPreview` filters to upcoming dates only, so once that date
 * passes and no newer rows arrive the section renders its empty state and stops
 * printing an address. The `PartnersStrip` half of the licence would survive
 * that, but the half that makes the phrase concrete would not. The correct fix
 * at that point is to DELETE the mark, not to hunt for a third artifact: the
 * accent licence is a cap and not a quota, a section with zero marks is
 * compliant, and a section with an unevidenced mark is exactly the defect plan
 * section 4.2 was rewritten to stop.
 *
 * Two phrases were considered and rejected, recorded so the licence stays
 * countable rather than felt:
 *   - "more than six months of monthly meetups" is NOT marked. Section 7 states
 *     that recurrence is carried by copy alone: the events index is upcoming
 *     only and no photograph on this page prints a date. Marking a claim this
 *     page cannot evidence is exactly what the licence forbids, and it is not
 *     changed by the photograph arriving, since the frame carries no date.
 *   - The Yani Partners shared founders disclosure is NOT marked here even
 *     though a standing disclosure is markable, for two reasons. Section 5
 *     assigns that mark to PartnersStrip, where the disclosure is reproduced
 *     verbatim, and one claim takes one marked phrase. And the clause sits mid
 *     paragraph in a 62ch measure, where a 3px rule under a phrase that can
 *     break across lines is either unreliable (an absolutely positioned rule
 *     inside a fragmented inline box) or wrecks the rag (`inline-block`, which
 *     cannot break at all). A `<dt>` is a block box, so its rule is exact at
 *     every width. Section 4.4 deletes uncomputable contrast cases rather than
 *     mitigating them; this is the same move applied to geometry.
 *
 * WHY NO PARTNER IS NAMED IN THIS SECTION
 * ---------------------------------------
 * The venue partner and the format partner used to be named here six times
 * over, in copy and in this comment. The founder has ruled that those two names
 * appear only on the partner surfaces: the home `PartnersStrip`, `/partners`,
 * and `partnersData.ts`. Every fact survives the change and only the names go:
 * more than six months of monthly meetups, the dates published on Luma and
 * Meetup, the venue relationship, and the one-to-one format are all still
 * asserted here. The venue's actual address is still on the home page, printed
 * by `EventsPreview` from the events feed, which is where a factual event
 * address belongs and is the reason the mark above still has something to point
 * at.
 *
 * Only claims PRODUCT.md lists as citable appear here: six plus months of
 * monthly Austin meetups, a venue partner hosting them, a format partner
 * running the one-to-one networking, and Yani Partners with the shared founders
 * disclosure attached, which is a condition of naming them at all.
 */

interface Fact {
    title: string;
    detail: string;
    /**
     * True on the one `<dt>` that carries the accent mark. See the note above
     * for why this fact and not the other two.
     */
    marked?: boolean;
}

const record: Fact[] = [
    {
        title: 'Every month, in person',
        detail: 'More than six months of monthly meetups in Austin, with every date published on Luma and Meetup.',
    },
    {
        title: 'Hosted by our venue partner',
        detail: 'A fixed home for the meetup in the middle of the Austin startup community.',
        marked: true,
    },
    {
        title: 'Structured one-to-one networking',
        detail: 'Our format partner pairs founders into short conversations, so nobody spends the meetup standing alone.',
    },
];

/** The manifest slot the photo pipeline generated for this section. */
const photo = photos['founder-story'];

/**
 * Plan section 6 behaviour 3. Transform and opacity only, `once: true`, a 60ms
 * stagger expressed as an explicit per block delay rather than as parent and
 * child variants, because the blocks sit in different grid cells and a variant
 * tree would have to wrap them in a container that the grid then has to work
 * around.
 *
 * Under reduced motion this returns no motion props at all, so the element
 * renders at its resting position with no initial state to recover from. That
 * is stricter than relying on `<MotionConfig reducedMotion="user">`, which
 * disables transform animation but still fades opacity.
 */
function reveal(reduce: boolean | null, delay: number): MotionProps {
    if (reduce) return {};
    return {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
    };
}

/**
 * The rail's reveal, written as VARIANTS rather than as target objects so the
 * mark draw below can be a variant child of it.
 *
 * Why that matters, and it is a real defect rather than a preference: the mark
 * draw was originally given its own `whileInView` and its own viewport
 * threshold. The rule sits about 88px below the top of the `<dl>`, so on any
 * scroll faster than 88px per half second, which is roughly one wheel notch,
 * both observers fire on the same frame and the draw plays out while its own
 * parent is still fading up from opacity 0. The page's one animation that
 * carries meaning would then be invisible on most desktop scrolls. Driving the
 * child from the parent's variant label gives one trigger and a deterministic
 * order: the parent settles, then the mark is drawn. framer-motion propagates
 * variant labels through React context, so the plain `div`, `dt` and `span`
 * between the `<dl>` and the rule do not interrupt it.
 */
const railVariants = {
    hidden: { opacity: 0, y: 16 },
    shown: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] },
    },
} as const;

/**
 * Delay 0.5 is measured against the parent above rather than guessed. The
 * parent starts at 0.12 and runs 0.5 on `cubic-bezier(0.16, 1, 0.3, 1)`, which
 * is heavily front loaded: it passes 0.85 opacity by about t=0.30 and is
 * visually settled well before t=0.5. So the rule is drawn onto a fact the
 * reader is already looking at, which is the whole point of the gesture.
 */
const markVariants = {
    hidden: { scaleX: 0 },
    shown: {
        scaleX: 1,
        transition: { duration: 0.26, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
} as const;

export function FounderStory() {
    const reduce = useReducedMotion();

    return (
        <section className="bg-paper py-28 md:py-36">
            <Container>
                <div className="grid gap-y-12 lg:grid-cols-[minmax(0,36rem)_minmax(0,17rem)] lg:gap-x-14 lg:gap-y-14">
                    {/* Row 1, column 1. The gutter beside the headline is left
                        deliberately empty. */}
                    <motion.h2
                        {...reveal(reduce, 0)}
                        className="max-w-[36rem] text-[2.125rem] font-medium leading-[1.02] tracking-tight text-ink md:text-[2.75rem] lg:col-start-1 lg:row-start-1"
                    >
                        {/* Emphasis is a weight step inside Archivo, section 4.3:
                            wght 800 against a 500 line, which is how the source
                            slide sets "Founders" against "International". Never a
                            second family, never italic, and never colour, because
                            colour here is reserved for the mark and "first" is not
                            a checkable phrase. */}
                        The meetups came <span className="font-extrabold">first</span>
                    </motion.h2>

                    {/* Row 2, column 1. The reading measure. */}
                    <motion.div
                        {...reveal(reduce, 0.06)}
                        className="max-w-[62ch] space-y-7 text-[1.0625rem] leading-[1.6] text-ink lg:col-start-1 lg:row-start-2"
                    >
                        <p>
                            IFN began as a room full of international founders in Austin, and it has met every month
                            for more than six months. The membership, the resource library and this website came
                            afterwards, built out of what people kept asking for in that room: how to handle a visa
                            while running a company, how to open a U.S. bank account, how to rebuild a professional
                            network from nothing.
                        </p>
                        <p>
                            We are a small, founder-run organization, so we would rather show you what already exists
                            than describe a plan. Our venue partner hosts the meetups in downtown Austin. Our format
                            partner runs the structured one-to-one networking format. Yani Partners, our fractional
                            Chief Technology Officer partner, was founded by the same team behind IFN. We say that plainly,
                            because you should be able to tell an outside endorsement from our own work.
                        </p>
                    </motion.div>

                    {/* Row 2, column 2. The hanging rail. One hairline over the
                        whole list and space between the facts, never a rule per
                        row: skill 9.F bans a hairline under every row of a list,
                        and section 4.2 measures this one at 4.063 light and 4.005
                        dark at full opacity 1px. It is a plain `border-t`, never
                        an alpha or an `opacity`, because at 75% pixel coverage the
                        same colour measures 2.665 and 2.764 and drops under the
                        3:1 floor. */}
                    <motion.dl
                        initial={reduce ? false : 'hidden'}
                        whileInView={reduce ? undefined : 'shown'}
                        viewport={{ once: true, amount: 0.25 }}
                        variants={reduce ? undefined : railVariants}
                        className="max-w-[34rem] space-y-8 border-t border-rule pt-8 lg:col-start-2 lg:row-start-2 lg:max-w-none"
                    >
                        {record.map((fact) => (
                            <div key={fact.title}>
                                <dt
                                    className={
                                        fact.marked
                                            ? 'text-base font-bold leading-[1.35] tracking-tight text-accent'
                                            : 'text-base font-bold leading-[1.35] tracking-tight text-ink'
                                    }
                                >
                                    {fact.marked ? (
                                        // `inline-block` shrink wraps the rule to
                                        // the phrase rather than to the column, so
                                        // the mark reads as a mark and not as a
                                        // divider. The rule is a real element
                                        // rather than a pseudo element because a
                                        // pseudo element cannot be driven by
                                        // framer-motion, and it is `aria-hidden`
                                        // because it carries no information the
                                        // words do not already carry.
                                        <span className="inline-block">
                                            {fact.title}
                                            <motion.span
                                                aria-hidden="true"
                                                className="mt-[0.3em] block h-[3px] bg-accent"
                                                style={{ transformOrigin: 'left' }}
                                                variants={reduce ? undefined : markVariants}
                                            />
                                        </span>
                                    ) : (
                                        fact.title
                                    )}
                                </dt>
                                <dd className="mt-2 text-[0.9375rem] leading-[1.6] text-muted">{fact.detail}</dd>
                            </div>
                        ))}
                    </motion.dl>

                    {/* Row 3, spanning BOTH tracks. The photograph, stacked under
                        the prose on the same left spine and running the full
                        width of the section's own grid. Not a caption, not a
                        frame, not a border:
                        section 4.4 makes photographs the only non-flat surface on
                        the page and radius 0 the only value for a non-interactive
                        surface, and the Plate Rule puts no type on any photograph
                        anywhere on this site. `width` and `height` are the
                        intrinsic dimensions of the fallback tier and every tier
                        shares one aspect ratio to within 0.5 percent, which the
                        build script enforces, so the box is reserved before the
                        bytes land and this section contributes zero CLS. Alt text
                        is the manifest's, hand written, naming no individual and
                        no venue.

                        The 0.18 delay is the fourth step of the section's 60ms
                        stagger (0, 0.06, 0.12, 0.18), so the photograph arrives
                        after the sentence it evidences rather than competing with
                        it. At 1920x1080 the whole section can be in view at once,
                        so this fade (0.18 to 0.68) overlaps the tail of the mark
                        draw (0.62 to 0.88) by about 60ms. The two are in different
                        grid cells and neither is an ancestor of the other, so the
                        overlap costs nothing and is recorded rather than tuned
                        away, because breaking the stagger to avoid it would be
                        undeclaring the plan's own interval. */}
                    <motion.div
                        {...reveal(reduce, 0.18)}
                        className="max-w-[36rem] lg:col-span-2 lg:col-start-1 lg:row-start-3 lg:max-w-[56.5rem]"
                    >
                        <picture>
                            <source type="image/avif" srcSet={photo.avif} sizes={photo.sizes} />
                            <source type="image/webp" srcSet={photo.webp} sizes={photo.sizes} />
                            <img
                                src={photo.src}
                                width={photo.width}
                                height={photo.height}
                                alt={photo.alt}
                                loading={photo.loading}
                                decoding="async"
                                className="block h-auto w-full"
                            />
                        </picture>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
