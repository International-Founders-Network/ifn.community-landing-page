import { useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';
import { RESOURCES_DATA } from '../data/resourcesData';
import { cn } from '../lib/cn';

/**
 * SECTION 7 of the home page, rebuilt for REDESIGN-PLAN.md ("The Sign").
 *
 * LAYOUT FAMILY: horizontal scroll-snap rail (plan section 5, row 7). It is the
 * page's only rail. The three things it replaces are all named as cuts in the
 * plan's ResourcesPreview bullet: the animated stage timeline with its two
 * connector bars and its per-node dots, the counted stat strip, and the example
 * card grid.
 *
 * WHY A RAIL IS THE RIGHT COMPONENT HERE rather than a longer list: this
 * library is 111 visible entries across 25 stages and 5 paths. Skill section
 * 4.9 names horizontal scroll-snap as the alternative to a long list, and the
 * rail is the only shape that lets a reader see the SEQUENCE of a path (the
 * stages are ordered) without printing 25 rows on the home page.
 *
 * KEYBOARD CONTRACT, which is the thing a scroll rail regresses. An earlier
 * audit in this repo flagged a keyboard-unreachable rail as a defect, so this
 * is written down rather than assumed. Tab order through this section, in DOM
 * order and with nothing removed from the tab ring:
 *
 *   1..5  the five path chips (real <button>, aria-pressed, 44px floor)
 *   6     the rail itself (role="group", aria-label, tabIndex 0, described by
 *         a visually hidden hint). Focusing it makes the arrow keys, Home, End,
 *         Page Up and Page Down scroll it, which is native browser behaviour on
 *         a focusable overflow container in all three engines. No key handler
 *         is hand-rolled here, because a hand-rolled one would have to
 *         re-implement all of that and would get it wrong.
 *   7..N  one link per panel, in DOM order, including the terminal panel. Tab
 *         walks the panels left to right and the browser scrolls each focused
 *         link into view, so a keyboard user reaches every panel without ever
 *         touching the scrollbar.
 *   N+1   the section action
 *   N+2   the email link
 *
 * Every one of those carries the two-layer focus ring. Nothing here is a focus
 * trap: there is no modal, no roving tabindex and no element removed from the
 * tab order. The rail is given vertical padding so the ring's 4px outer layer
 * is not clipped by its own `overflow-x: auto` (which computes `overflow-y` to
 * `auto` as well), and `scroll-p*` so a snapped panel's ring is not flush with
 * the scroll port edge.
 *
 * HONESTY. Every number on this page is counted from `resourcesData.ts` at
 * render time. None is typed in. See the note on `SUPPRESSED_RESOURCE_IDS`
 * below for the one entry that is deliberately not counted, and the header copy
 * for the fact that decides how the whole section reads: not one entry in the
 * library carries a `link`, so nothing in it is published yet. The previous
 * version of this file filtered `isComingSoon` entries out and described the
 * survivors as "what the library already holds"; those 15 survivors have no
 * link either, so that framing implied an availability the data does not have.
 *
 * THE DENIAL LEADS NO MORE, AND IT IS STILL THERE. The header used to open on
 * "None of it is published yet.", carrying the accent mark, on the reasoning
 * that a denial is the most checkable sentence on a page. That reasoning is
 * sound and the sentence survives; what changed is its position in the line.
 * The repositioning brief asks that an unpublished library read as one being
 * written out of real founder questions rather than as an empty state, and the
 * order of two clauses is the whole difference between those two readings. The
 * mark moved with the lead onto "Being written now", which is checkable
 * against MORE of this section than the denial ever was: every stage panel
 * prints "Being written" and the terminal panel prints the counted total for
 * the selected path, all inside this component, all on screen. The unpublished
 * fact is stated in the same sentence and was NOT softened, hedged or moved
 * off the home page. Do not delete it to tidy the line up.
 */

/**
 * Mirrors `SUPPRESSED_RESOURCE_IDS` in `Resources.tsx` (the /resources page),
 * where the reasoning lives: `ambassador-program` reads "How to lead an IFN
 * chapter in your city", IFN has no chapters outside Austin, and PRODUCT.md
 * forbids implying otherwise. That constant is module-private, so this is a
 * deliberate duplicate rather than an import. Both copies go away when the
 * entry is deleted from `src/data/resourcesData.ts`, which is the real fix.
 *
 * It is applied to the counts as well as to the titles, so the number a reader
 * sees here matches the number of cards /resources will show them.
 */
const SUPPRESSED_RESOURCE_IDS = new Set(['ambassador-program']);

/**
 * The two-layer focus ring of plan section 4.2: 2px `--paper` inner, 2px
 * `--ink` outer, no offset, IDENTICAL in both modes because `--paper` is always
 * the page colour and `--ink` is always the type colour, so the construction
 * inverts itself when the tokens swap. Never reversed.
 *
 * Written as an arbitrary property rather than as a Tailwind ring plus its
 * offset utility, for the reason recorded in `src/lib/buttonStyles.ts`: the
 * utility form routes
 * both layers through `--tw-shadow-color`, so a single shadow-colour utility
 * anywhere on the element repaints the whole ring one colour. This form emits
 * the two layers verbatim and cannot be reached that way.
 *
 * It is duplicated here rather than imported because `buttonStyles.ts` keeps it
 * module-private; the string is byte-identical to the one there on purpose.
 */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

/**
 * Panel widths, unequal by design (plan section 5: "four unequal snap panels").
 * The cycle is deliberate rather than random so the rhythm is stable across
 * path changes and across renders.
 *
 * MOBILE COLLAPSE, declared here rather than left to Tailwind: below `md`
 * (768px) every panel is `w-[78vw]` capped at `20rem`, so exactly one panel
 * plus the edge of the next is on screen at 360px and the rail stays a rail
 * instead of trying to be a grid. The unequal widths engage at `md` and above
 * only. Nothing in this section is a multi-column grid at any width, so there
 * is no column count to collapse.
 */
const PANEL_WIDTHS = [
    'w-[78vw] max-w-[20rem] md:max-w-none md:w-[24rem]',
    'w-[78vw] max-w-[20rem] md:max-w-none md:w-[19rem]',
    'w-[78vw] max-w-[20rem] md:max-w-none md:w-[21rem]',
];

/**
 * GROUND ALTERNATION, added after a pre-flight audit against skill section 4.7
 * ("Bento Background Diversity") found this rail shipping five identical
 * `border border-rule bg-paper` cells against one varied terminal cell, which is
 * 1 of 6 against a bar of 2 to 3.
 *
 * The remedy the skill names verbatim is "a tinted background", and it is the
 * only one of the four it offers (image, gradient, pattern, tint) that this
 * system permits: plan section 4.4 bans gradients and every non-flat surface
 * outright, and the page's two photographic slots are both spent (plan section
 * 7), so a third photograph here would be a slot this plan does not have.
 *
 * The tint is `--band`, which is the page's only second surface, so this adds
 * no colour and needs no new measurement. Every pairing it produces is already
 * published in plan section 4.2: `--ink` on `--band` 16.281 light and 16.318
 * dark, `--muted` on `--band` 5.982 and 6.808, the panel's own 1px `--rule`
 * border against the section's `--paper` ground 4.063 and 4.005, and the
 * in-panel `--rule` divider against `--band` 3.682 and 3.638.
 *
 * THE RULE IS KEYED OFF THE END OF THE RAIL, NOT THE START, and that is the
 * whole difficulty. The five paths in `resourcesData.ts` carry 4, 5, 5, 5 and 6
 * stages, so any `index % 2` rule tints the last stage panel for some of them
 * and seats a `--band` cell directly against the `--band` terminal panel, which
 * would erase the arrival the terminal panel exists to be. Measuring distance
 * from the last stage instead fixes the phase to the end of the rail: the last
 * stage panel is always `--paper`, so the terminal panel is always the first
 * `--band` a reader meets after a `--paper` one, at every path length.
 *
 * Checked at all three lengths, reading left to right and writing P for
 * `--paper` and B for `--band`, with the terminal panel in brackets:
 *
 *   4 stages   B P B P [B]
 *   5 stages   P B P B P [B]
 *   6 stages   B P B P B P [B]
 *
 * No two neighbours share a ground, the last stage is `--paper` in all three,
 * and `PANEL_WIDTHS` cycles on 3 against this cycle of 2, so the combined
 * rhythm repeats every 6 panels and no adjacent pair matches in both width and
 * ground.
 */
const isTintedPanel = (index: number, stageCount: number) => (stageCount - 1 - index) % 2 === 1;

/**
 * The accent mark (plan section 2, licence role 1; plan section 6, behaviour 2).
 *
 * Accent type plus a 3px accent rule drawn left to right under the phrase. The
 * licence permits it only on a phrase a reader can check against something on
 * this page, and it is used exactly ONCE in this section, on a denial. That
 * keeps the section inside the density rule of no more than two marks plus the
 * wordmark period in any one viewport.
 *
 * It sits in the section header rather than inside the rail on purpose: a
 * `whileInView` rule that lives in a panel past the horizontal fold would stay
 * at `scaleX(0)` until the reader scrolls sideways, so the honesty would be
 * hidden behind an interaction. Here it is on screen with the headline.
 *
 * Reduced motion: `MotionConfig reducedMotion="user"` in `App.tsx` disables
 * transform animations and resolves the element straight to its target, so the
 * rule renders full width with no draw. The bottom padding on the wrapper is
 * descender clearance, and it is still required after the marked phrase
 * changed: it used to clear the `p` and `y` of "published yet", and it now
 * clears the `g` of "Being" in "Being written now". Check this again if the
 * phrase is ever reworded, because a phrase with no descender would make the
 * reserve look arbitrary and a phrase with one and no reserve puts a 3px rule
 * through it.
 */
function Mark({ children }: { children: ReactNode }) {
    const reduceMotion = useReducedMotion();
    return (
        <span className="relative inline-block pb-1.5 text-accent">
            {children}
            <motion.span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 block h-[3px] origin-left bg-accent"
                initial={reduceMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            />
        </span>
    );
}

export function ResourcesPreview() {
    const segments = Object.values(RESOURCES_DATA);

    /**
     * Defaults to the US Market Entry path. `resourcesData.ts` describes it as
     * "Immigrant founders and operators navigating the US market", which is
     * this site's stated audience, so it is the path a first-time reader is
     * most likely to want. The outgoing default was `startups`. This is the one
     * behavioural change in this rebuild and it is a one-word revert.
     */
    const [activeSegmentId, setActiveSegmentId] = useState('global');
    const activeSegment = RESOURCES_DATA[activeSegmentId] ?? segments[0];

    const railRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const railHintId = useId();

    /**
     * Counted from the data on every render, never typed in. `entriesInStage`
     * is the honest per-stage figure after the /resources suppression above.
     */
    const entriesInStage = (stageId: string) =>
        (activeSegment.resources[stageId] ?? []).filter(r => !SUPPRESSED_RESOURCE_IDS.has(r.id));

    const entriesInPath = activeSegment.stages.reduce(
        (total, stage) => total + entriesInStage(stage.id).length,
        0,
    );

    /**
     * Selecting a path returns the rail to its first panel, because leaving a
     * reader parked at panel five of a path they just replaced is a state
     * change they cannot see. Smooth by default, INSTANT under reduced motion:
     * `MotionConfig` cannot reach an imperative `scrollTo`, so the degradation
     * is handwritten here. Done on the click rather than in an effect, so there
     * is no mount fire to guard and no cleanup to get wrong.
     */
    const selectSegment = (id: string) => {
        setActiveSegmentId(id);
        railRef.current?.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    return (
        // Named so this band can be linked to, matching id="events" above it.
        // Note for anyone adding a "/#resources" link: the section sits behind a
        // lazy boundary, so ScrollToAnchor's fixed 100ms timer can look for it
        // before the chunk resolves.
        <section id="resources" className="bg-paper py-28 md:py-36">
            <Container>
                {/* Header. Stacked, not split: one message, headline over body,
                    measure capped. No eyebrow, because the plan spends the
                    budget of 3 on Hero and PartnersStrip. */}
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* HEADLINE SCALE. Display is reserved for the page <h1>, and
                        every sibling section on Home is a clamp. This one was
                        not: it ran `text-3xl md:text-4xl` and capped at 36px
                        against 48px to 64px everywhere else, so the page shipped
                        two type scales and claimed one.

                        It takes `clamp(2rem, 4vw, 3rem)`, which is FAQ's value
                        verbatim and the same one EventsPreview now takes, so this
                        change adds no new number to the scale. The family's
                        larger caps were tested and rejected on the break rather
                        than on taste: at 3.5rem (HowItWorks' cap) the second line
                        collapses to "explains to you", which is a worse line than
                        the one below.

                        MEASURE, AND WHY THE WRAPPER LOST ITS CAP. `text-[clamp()]`
                        sets font-size only, so the 62ch that used to sit on this
                        wrapper was resolved in the wrapper's inherited 16px, or
                        568.4px. At 48px this headline is 1087.3px on one line, so
                        inside 568.4px it broke into THREE lines ending on the
                        orphan "you". The cap therefore moves off the wrapper and
                        onto each element, which is the shape ValueProps already
                        uses: 26ch on the headline in the headline's own ch, 62ch
                        on the body beneath it. Computed from the real glyph
                        advances in `public/fonts/archivo-variable-latin.woff2` at
                        `wght 700` with the -0.025em tracking included:

                          360px   font 32.00px  measure 328.0px (container bound)
                                  3 lines, unchanged from before this edit
                          768px   font 32.00px  measure 495.0px
                                  2 lines: "Written guides for the parts" /
                                           "nobody explains to you"
                          1366px  font 48.00px  measure 742.6px   same 2 lines
                          1920px  font 48.00px  measure 742.6px   same 2 lines

                        LEADING IS NOW EXPLICIT AND HAS TO BE. `text-3xl` and
                        `text-4xl` carried Tailwind's paired line-heights (2.25rem
                        and 2.5rem); an arbitrary font-size does not, so without
                        this the line box would inherit the body's 1.6 and the
                        headline would set at 76.8px of leading at 48px.
                        `leading-[1.02]` is the section-headline value in plan
                        section 4.3 and is what every sibling section declares.

                        Colour is untouched: `--ink` on `--paper`, 17.965 in both
                        modes (plan section 4.2). */}
                    <h2 className="max-w-[26ch] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
                        Written guides for the parts nobody explains to you
                    </h2>
                    <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
                        Guides, templates and checklists on visas, banking, incorporating, hiring
                        and raising here, sorted by the kind of founder you are and the stage you
                        have reached, in the order the questions actually come up.
                    </p>
                    <p className="mt-5 max-w-[62ch] text-lg font-semibold leading-relaxed text-ink">
                        <Mark>Being written now</Mark>, from the questions founders bring us. None
                        of it is published yet.
                    </p>
                </motion.div>

                {/* Path selector. Filter buttons, so aria-pressed carries the
                    state: the fill alone would leave it invisible to a screen
                    reader. min-h-11 is the 44px touch floor. It scrolls rather
                    than wraps at narrow widths, snapping by proximity so a
                    half-dragged row settles without fighting the reader. */}
                <div
                    role="group"
                    aria-label="Choose a founder path"
                    className="mt-12 -mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                >
                    {segments.map((segment) => {
                        const isActive = activeSegment.id === segment.id;
                        return (
                            <button
                                key={segment.id}
                                type="button"
                                onClick={() => selectSegment(segment.id)}
                                aria-pressed={isActive}
                                className={cn(
                                    'inline-flex min-h-11 flex-none snap-start items-center rounded-full',
                                    'border px-5 text-sm font-semibold sm:text-base',
                                    'transition-colors duration-150 ease-out',
                                    'active:translate-y-px active:scale-[0.985]',
                                    FOCUS_RING,
                                    isActive
                                        // --paper on the --ink fill: 17.965 in both modes.
                                        ? 'border-ink bg-ink text-paper'
                                        // --muted on --paper: 6.601 light, 7.496 dark.
                                        // --rule stroke: 4.063 light, 4.005 dark.
                                        : 'border-rule bg-paper text-muted hover:border-edge hover:bg-band hover:text-ink',
                                )}
                            >
                                {segment.name}
                            </button>
                        );
                    })}
                </div>

                {/* THE RAIL.

                    role="group" + tabIndex 0 is what makes it reachable and
                    scrollable from the keyboard; the hint below tells a screen
                    reader user that the arrow keys do something here, which is
                    not otherwise discoverable. py-3 gives the focus ring's 4px
                    outer layer room inside a container whose overflow-y
                    computes to auto, and scroll-p* keeps a snapped panel's ring
                    off the scroll port edge.

                    The negative margins pull the scroll port out to the
                    container's own edge so panels run off the side of the page
                    instead of stopping short of it; the matching padding on the
                    track puts the first panel back on the container gutter. */}
                <p id={railHintId} className="sr-only">
                    Use the left and right arrow keys to scroll through the stages.
                </p>
                <div
                    ref={railRef}
                    role="group"
                    aria-label={`Stages in the ${activeSegment.name} path`}
                    aria-describedby={railHintId}
                    tabIndex={0}
                    className={cn(
                        'mt-10 -mx-4 overflow-x-auto py-3 sm:-mx-6 lg:-mx-8',
                        'snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8',
                        FOCUS_RING,
                    )}
                >
                    {/* Keyed on the path so switching path re-mounts the track
                        and fades it in. That is the only feedback a reader gets
                        that the chip they pressed changed the contents, and
                        opacity is the one property MotionConfig keeps under
                        reduced motion, so the confirmation survives there. */}
                    <motion.ul
                        key={activeSegment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="flex list-none items-stretch gap-4 px-4 sm:px-6 md:gap-6 lg:px-8"
                    >
                        {activeSegment.stages.map((stage, index) => {
                            const entries = entriesInStage(stage.id);
                            const shown = entries.slice(0, 3);
                            const remaining = entries.length - shown.length;
                            const tinted = isTintedPanel(index, activeSegment.stages.length);

                            return (
                                <li
                                    key={stage.id}
                                    className={cn(
                                        'flex-none snap-start',
                                        PANEL_WIDTHS[index % PANEL_WIDTHS.length],
                                    )}
                                >
                                    {/* Radius 0: a panel is a surface, not a
                                        control. Separation is the 1px --rule
                                        border at full opacity (4.063 light,
                                        4.005 dark on --paper), never tone,
                                        which is 1.103 either way. The ground
                                        alternates per `isTintedPanel` above,
                                        which is the skill's named remedy for
                                        bento background diversity; the border
                                        carries the panel in both cases, so the
                                        tint is a rhythm rather than the
                                        mechanism by which a panel is seen. */}
                                    <article
                                        className={cn(
                                            'flex h-full flex-col border border-rule p-6',
                                            tinted ? 'bg-band' : 'bg-paper',
                                        )}
                                    >
                                        {/* The stage name is the panel's link,
                                            which is what keeps a11y item 14
                                            ("per-panel focusable link") while
                                            retiring five repetitions of one
                                            label: the previous build printed
                                            "Browse our resources" once per
                                            panel, so a reader saw the identical
                                            string two or three times side by
                                            side across the rail and eight times
                                            down the page. Skill 4.5 passes that
                                            on the letter (one label, one
                                            intent) and it still reads as
                                            filler, which is a design finding
                                            rather than a rule finding.

                                            Underlined, never colour alone: plan
                                            section 4.2's G183 row is the
                                            binding one, and this link is
                                            --ink rather than accent, so the
                                            underline is the ONLY thing
                                            identifying it. decoration-rule
                                            measures 4.063 on --paper and 3.682
                                            on --band in light, 4.005 and 3.638
                                            in dark, all above the 3.0 non-text
                                            floor.

                                            Link purpose is satisfied in
                                            context (WCAG 2.4.4): the panel sits
                                            inside a group labelled "Stages in
                                            the <path> path", and the terminal
                                            panel still carries the explicit
                                            "Browse our resources" action that
                                            names the destination. */}
                                        <h3 className="text-2xl font-bold leading-tight tracking-tight text-ink">
                                            <Link
                                                to="/resources"
                                                className={cn(
                                                    'underline decoration-rule underline-offset-[6px]',
                                                    'transition-colors hover:decoration-ink',
                                                    FOCUS_RING,
                                                )}
                                            >
                                                {stage.name}
                                            </Link>
                                        </h3>
                                        {/* Rendered exactly once. It used to be
                                            emitted twice, visible on mobile and
                                            at opacity 0 for desktop, so a screen
                                            reader read every stage description
                                            twice. */}
                                        <p className="mt-3 leading-snug text-muted">
                                            {stage.description}
                                        </p>

                                        <p className="mt-7 border-t border-rule pt-5 text-sm font-semibold text-muted">
                                            Being written
                                        </p>
                                        <ul className="mt-3 flex-1 list-none space-y-2.5">
                                            {shown.map((resource) => (
                                                <li
                                                    key={resource.id}
                                                    className="text-sm font-semibold leading-snug text-ink"
                                                >
                                                    {resource.title}
                                                </li>
                                            ))}
                                            {remaining > 0 && (
                                                <li className="text-sm leading-snug text-muted">
                                                    {remaining} more in this stage
                                                </li>
                                            )}
                                        </ul>
                                    </article>
                                </li>
                            );
                        })}

                        {/* The terminal panel. The one --band ground in the
                            rail, and the one piece of oversized display type in
                            this section, so the rail has somewhere to arrive
                            rather than just running out. Its number is counted
                            from the data for whichever path is selected, so it
                            moves when a chip is pressed. */}
                        <li className="flex-none snap-start w-[78vw] max-w-[20rem] md:max-w-none md:w-[26rem]">
                            <article className="flex h-full flex-col justify-between border border-rule bg-band p-6 md:p-8">
                                <p className="text-ink">
                                    <span className="block text-6xl font-extrabold leading-none tracking-tight tabular-nums md:text-7xl">
                                        {entriesInPath}
                                    </span>
                                    <span className="mt-5 block text-lg leading-snug">
                                        being written for {activeSegment.name}, across{' '}
                                        {activeSegment.stages.length} stages.
                                    </span>
                                </p>
                                <RailLink />
                            </article>
                        </li>
                    </motion.ul>
                </div>

                {/* The section action, below the rail so it needs no horizontal
                    scrolling to reach. One label per intent: "Browse our
                    resources" is the same string the hero's secondary action
                    uses for the same destination, and it is the only spelling
                    of it in this file. The outgoing "Browse the resource
                    library" was a second spelling of one intent on one page.

                    No shadow: plan section 4.4 is zero resting shadows. */}
                <div className="mt-12 flex flex-col items-start gap-6">
                    <ButtonLink to="/resources" variant="primary" size="lg" className="gap-2">
                        Browse our resources
                        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                    </ButtonLink>
                    <p className="text-sm text-muted">
                        Something missing that you needed?{' '}
                        <a
                            href="mailto:hello@ifn.community"
                            className={cn(
                                'font-semibold text-ink underline underline-offset-4',
                                'decoration-rule transition-colors hover:decoration-ink',
                                FOCUS_RING,
                            )}
                        >
                            Email hello@ifn.community
                        </a>
                        .
                    </p>
                </div>
            </Container>
        </section>
    );
}

/**
 * The terminal panel's link, and now the only one in the rail that spells the
 * intent out. The stage panels carry their focusable link on the stage name
 * instead, for the reason written at that call site; a11y item 14 holds in both
 * shapes, since every panel still contains exactly one link and Tab still walks
 * the rail left to right with the browser scrolling each panel into view.
 *
 * It carries the SAME label as the section action below the rail, deliberately.
 * Skill 4.5 bans two labels for one intent, not two links to one destination,
 * and /resources has no per-stage deep link to point at, so a stage-specific
 * label here would promise a filter the destination cannot honour. Underlined
 * rather than colour-only, per the G183 rule in plan section 4.2. Radius 0,
 * because an inline link is not a discrete control.
 *
 * It is the last child of the terminal panel under `justify-between`, so it
 * sits on the panel's bottom edge whatever height the copy above it takes.
 */
function RailLink() {
    return (
        <Link
            to="/resources"
            className={cn(
                'mt-7 inline-flex items-center gap-2 self-start',
                'text-sm font-semibold text-ink underline underline-offset-4',
                'decoration-rule transition-colors hover:decoration-ink',
                FOCUS_RING,
            )}
        >
            Browse our resources
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
    );
}
