import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Container } from './Container';

/**
 * FOUNDER STORY. Phase 3 of REDESIGN-PLAN.md ("The Sign").
 *
 * Layout family, section 5 row 4: "Prose measure with a hanging gutter rail".
 * One 62ch measure of running prose on the left, a three fact `<dl>` hanging in
 * the gutter beside it under a single hairline, and nothing else. No
 * photograph (section 5 allocates none here, and skill 4.7 caps consecutive
 * image and text splits), no cards, no icons, no badges, no eyebrow.
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
 * MOBILE COLLAPSE, DECLARED HERE RATHER THAN ASSUMED
 * --------------------------------------------------
 * Below `lg` (1024px) the grid is a single column: headline, prose, then the
 * rail full width beneath it with its hairline running the full column. The
 * rail keeps a `max-w-[34rem]` cap below `lg` so its 15px detail lines never
 * stretch to the full 975px column at 1023px, and drops the cap at `lg` where the
 * 17rem track is the narrower constraint. There is no intermediate two column
 * state on purpose: a 62ch measure plus a 17rem rail plus a gutter does not fit
 * inside 768px, so a `md` split would produce a squeezed measure rather than a
 * layout. Everything below 1024px is one column, `px-4` at the container.
 *
 * THE MARK
 * --------
 * Section 2 licenses the accent to a phrase "checkable against a named artifact
 * on this page". Exactly one phrase in this section takes it: the `<dt>`
 * "Hosted at Station Austin", because Station Austin is a named partner and the
 * venue is checkable twice over without leaving the page. This section's own
 * second paragraph says "Station Austin hosts the meetups", and every row of
 * `src/data/events.json` carries the venue that EventsPreview prints. Neither
 * of those depends on PartnersStrip, which is the one section the plan still
 * blocks on vendored artwork and whose stated fallback is to drop a partner
 * from the row rather than set a text wordmark. It is accent type plus a 3px
 * accent rule, which is both halves of the mark rather than colour alone, so
 * the 2.547 light and 3.256 dark reading of accent against surrounding ink body
 * copy (WCAG 1.4.1, technique G183) is never the mechanism carrying meaning.
 *
 * Two phrases were considered and rejected, recorded so the licence stays
 * countable rather than felt:
 *   - "more than six months of monthly meetups" is NOT marked. Section 7 states
 *     that recurrence is carried by copy alone: the events index is upcoming
 *     only and neither day one photograph prints a date. Marking a claim this
 *     page cannot evidence is exactly what the licence forbids.
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
 * Only claims PRODUCT.md lists as citable appear here: six plus months of
 * monthly Austin meetups, Station Austin as venue, Reuneo running the speed
 * networking format, and Yani Partners with the shared founders disclosure
 * attached, which is a condition of naming them at all. Every string below is
 * the shipped string, unedited.
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
        title: 'Hosted at Station Austin',
        detail: 'Our venue partner gives the meetup a fixed home in the middle of the Austin startup community.',
        marked: true,
    },
    {
        title: 'Structured by Reuneo',
        detail: 'Their format pairs founders into short one-to-one conversations, so nobody spends the meetup standing alone.',
    },
];

/**
 * Plan section 6 behaviour 3. Transform and opacity only, `once: true`, a 60ms
 * stagger expressed as an explicit per block delay rather than as parent and
 * child variants, because the three blocks sit in different grid cells and a
 * variant tree would have to wrap them in a container that the grid then has to
 * work around.
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
                            than describe a plan. Station Austin hosts the meetups. Reuneo runs the speed-networking
                            format. Yani Partners, our fractional Chief Technology Officer partner, was founded by the
                            same team behind IFN. We say that plainly, because you should be able to tell an outside
                            endorsement from our own work.
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
                </div>
            </Container>
        </section>
    );
}
