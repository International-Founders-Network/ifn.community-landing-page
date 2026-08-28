import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Container } from './Container';
import { galleryFrames, type GalleryFrame } from '../data/photos.generated';

/**
 * GALLERY PREVIEW. The home page's tenth section, added 2026-08-10.
 *
 * WHY A TENTH SECTION EXISTS AT ALL, WHEN THE LAST ROUND ARGUED AGAINST ONE
 * -------------------------------------------------------------------------
 * `EventsPreview` carried a comment saying a home gallery section was not worth
 * a tenth layout family, a tenth measured Suspense fallback and a change to the
 * nine section order. That was a COST argument and every line of it is still
 * true. What changed is that the cost was paid deliberately, because the thing
 * it was declining to buy turned out to be the round's actual objective.
 *
 * The founder's first instruction was to put photography into the middle third
 * of the page. A design pre-flight then measured the built page and found the
 * middle third still flat: 5,649 CSS px, 47 percent of the document at 1366,
 * running from the last photograph to the accent field with no image and no
 * ground event stronger than the 1.103 `--band` tone swap. All three
 * photographs sat in the first 41 percent. The FounderStory frame had been
 * placed on grid row 3, at the END of its section, so it OPENED that run rather
 * than breaking it. Adding one frame further down was the only fix that reaches
 * the finding, and a frame needs a section to live in.
 *
 * Nothing existing moves. No route, slug, anchor id, nav label or form field
 * name is touched; this section carries no anchor id of its own and is inserted
 * between two existing sections rather than reordering any of them.
 *
 * PLACEMENT, WHICH IS ARITHMETIC RATHER THAN TASTE
 * ------------------------------------------------
 * Three insertion points were priced against the measured 5,649px run, using
 * the rendered section heights recorded in `Home.tsx`:
 *
 *   before PartnersStrip     splits it 1,478 / 4,171
 *   AFTER PartnersStrip      splits it 2,458 / 2,690     <- chosen
 *   after ResourcesPreview   splits it 3,653 / 1,997
 *
 * The middle one is the only one that leaves no run longer than about 2,700px.
 * The other two leave a run of four thousand and of three and a half thousand
 * respectively, which is the defect at a smaller number rather than a fix.
 *
 * MEASURED AFTER THE FACT rather than left as a prediction, because widening
 * the FounderStory frame in the same round moved every y coordinate the
 * pre-flight recorded. On the built page at 1366, under reduced motion, with
 * every lazy chunk resolved: the document is 13,247px, the two runs are
 * **2,772px** (FounderStory frame to this section) and **3,320px** (this
 * section to the accent plate), and the longest imageless run is therefore
 * **3,320px, 25 percent of the document, against 5,649px and 47 percent
 * before**. At 390 it is 3,668 of 15,107 against 6,275 before. The predicted
 * split above was 2,458 / 2,690 and the real one is 2,772 / 3,320; the
 * difference is the 185px FounderStory gained and this section's own height,
 * neither of which existed when the three options were priced.
 *
 * The residual 3,320px is ResourcesPreview plus FAQ, which are a snap rail of
 * text panels and a disclosure register. Both are text surfaces by design, no
 * photograph in the folder belongs in either, and the run terminates on the
 * full bleed accent plate, which is the strongest ground event on the page.
 * Splitting it further would mean inventing a reason to put a photograph
 * between a resources rail and an FAQ, and there is not one.
 *
 * GROUND, AND THE ADJACENCY IT CREATES
 * ------------------------------------
 * `--paper`, like every other photographic surface on this page. That puts two
 * `--paper` sections next to each other for the first time, which is the exact
 * thing `Home.tsx` says PartnersStrip's `--band` was positioned to prevent
 * between EventsPreview and ResourcesPreview. The reason that is not the same
 * defect: the objection was to two sections of TYPE on one ground reading as a
 * single undifferentiated field. This section's visual field is three
 * photographs, so nothing about it reads as a continuation of a snap rail of
 * text panels. The ground sequence is paper, band, paper, paper, band, plate,
 * and the one repeat is separated by the strongest tonal event in the middle of
 * the page.
 *
 * THE LAYOUT FAMILY, AND WHY IT IS AN ELEVENTH RATHER THAN A REPEAT
 * -----------------------------------------------------------------
 * An UNEQUAL TWO COLUMN FRAME SET WITH THE SECTION'S ONE LINK SET INTO THE
 * VOID. One lead frame occupies seven of twelve columns; the other two stack in
 * the remaining five; the stacked column is taller than the lead frame, so the
 * link sits in the space the lead frame does not fill rather than being parked
 * under the whole grid. The empty region is composed rather than left over.
 *
 * It repeats none of the ten families in use. The hero band is full bleed with
 * nothing beside it, HowItWorks is one image inside a rule sequence,
 * FounderStory stacks one frame under a measure, and `/gallery` is a nine row
 * authored hang on a twelve column measure. This is ONE row of three, so it is
 * a fragment of that grammar rather than a second run at it, and it keeps the
 * link set into the void, which the gallery route has no equivalent of. Skill
 * 9.C bans the three equal card row outright and these three are deliberately
 * unequal.
 *
 * WHAT THIS SECTION CLAIMS, AND WHAT IT REFUSES TO
 * ------------------------------------------------
 * REWRITTEN 2026-08-10 for the founder's gallery ruling. It prints NO DATE on
 * any frame, which it never did, and it no longer prints a COUNT OF EVENINGS
 * either. The old lead read "One frame from each of the 3 Austin evenings that
 * have been photographed", and although every word of that was true, three
 * dated nights presented as the set is exactly the reading the founder
 * objected to on `/gallery`: it invites a reader to conclude that three is how
 * many meetups there have been. The sentence is replaced rather than patched,
 * and nothing on this section now carries a number, a date or an evening. It
 * prints no caption either, under the Plate Rule and skill 9.F.
 *
 * FRAME SELECTION, REDONE FOR THE SAME ROUND
 * ------------------------------------------
 * The old rule was one frame per photographed evening, which is a grouping
 * rule, and the grouping is what went. The rule now is the founder's: favour
 * PEOPLE, FACES and ENERGY, and do not print the same photograph twice on one
 * page.
 *
 * Three slots are barred outright because the landing page's own photography is
 * being reselected onto them in the same round: `gallery-apr-listening` is the
 * new hero band source, `gallery-apr-gesture` is the HowItWorks stop, and
 * `gallery-jul-standing` is the new FounderStory frame. Any of the three here
 * would print one photograph twice on one page, which is the objection this
 * file already recorded against `gallery-apr-room`.
 *
 * What ships is a preference list per position rather than a fixed slot, for the
 * reason stated on the constants below.
 *
 * THE LEAD CHANGED AGAIN LATE IN THE SAME ROUND, and it changed because a design
 * pre-flight opened both frames side by side and found that this section and the
 * hero band were printing the same photograph. The lead was
 * `gallery-apr-seated`, source `meetups/20260423_184523.jpg`, and the hero band
 * is `meetups/20260423_184527.jpg`: four seconds apart from one camera position,
 * the same circle, the same people in the same clothes, the same two IFN screens
 * and the same glass wall. Nothing in the manifest catches that, because they
 * are different files and different slots; only looking at them does. To a
 * reader scrolling the home page it is one picture printed twice, which is the
 * objection this file already recorded against `gallery-apr-room` and had not
 * noticed it was now committing itself.
 *
 * `gallery-apr-group` leads instead, and its landing page exclusion is REVERSED
 * here rather than worked around. Plan section 7 had reversed it for the gallery
 * route only and left the genre reason binding on the landing page: "a posed
 * line up is a different kind of picture from the documentary frames this page
 * is built on, and mixing the two is how a page starts looking like a brochure."
 * The founder's instruction of 2026-08-10 reopens exactly this judgment. It says
 * to reselect the landing photography from scratch and to favour PEOPLE, FACES
 * and ENERGY, and this frame is seventeen people shoulder to shoulder facing the
 * camera in front of an IFN screen at the end of the evening. It is the most
 * faces and the most legible faces in the folder by a wide margin, and it is the
 * only frame that cannot be mistaken for any other frame on the page. The
 * brochure charge is answered by what it sits in: one posed frame beside two
 * documentary ones, under a heading that says what a meetup looks like, is a
 * community wall rather than a brochure. Plan section 7 is amended in the same
 * commit so the repository does not hold two statements about this photograph.
 *
 * `gallery-apr-circle` stacks above `gallery-feb-sign`. The circle is a genuinely
 * different vantage from the hero band, lower and closer with the glass wall
 * carrying the frame and no former venue gear in it at all, and it renders at
 * about 470 CSS px rather than at lead scale. The lit sign at night is kept as
 * the third because it is the only tonal counterweight in the folder to two
 * daylight frames, and this section would otherwise be one room three times.
 *
 * WHAT THIS DOES NOT FIX, STATED RATHER THAN LEFT FOR THE NEXT AUDIT. The same
 * pre-flight counted the evenings behind the six landing frames and found the
 * home page leaning heavily on one April evening. The swap removes the duplicate
 * and it does not remove the lean, because the lean is INVENTORY. April is eight
 * of the fifteen sources; February's only frame with people in it is the wide
 * empty hall the founder rejected by name; July's only frame with people in it is
 * already carrying FounderStory; and the remaining July frame is the one with the
 * flags and the former venue emblem across it. There is no selection of six
 * frames from this folder that both favours faces and spreads across evenings.
 * The fix is a fourth photographed evening, which costs ten minutes at the next
 * meetup and needs nobody's consent, and it is named in REDESIGN-PLAN.md section
 * 7 as founder input rather than as a build task.
 *
 * BYTES. Only the 640px `tile` tier is offered, with no `srcset` and no
 * `sizes`, for the reason `/gallery` states at length: the frames also carry a
 * 1280px `view` tier, and putting it in a srcset makes every 2x display fetch
 * a tier no placement here renders at. No new derivative is built for this
 * section and the tier is unchanged, so the only thing that moved is WHICH
 * three tiles are fetched.
 *
 * Measured on the built files after the photo pipeline landed. The pipeline now
 * cuts each gallery tile to the width of the cell it occupies ON `/gallery`,
 * which is why the lead here is a 832w tile rather than a 640w one: it is the
 * span 8 cell of the hang. At this section's placements that is 832 into about
 * 690 CSS px and 640 into about 470, so both are above 1x and neither is
 * upscaled.
 *
 *   gallery-apr-group   832w  26,692        gallery-apr-circle  640w  17,310
 *   gallery-feb-sign    640w   8,908        total               52,910
 *
 * The three frames this section shipped before the gallery round cost 39,350, so
 * it is 13,560 bytes heavier than that, and 3,666 bytes LIGHTER than the
 * `gallery-apr-seated` lead it replaced. The lead is the whole of the increase
 * and it buys the one frame in the folder that puts seventeen legible faces on
 * the home page.
 *
 * TWO HANDOVER CONSEQUENCES, NAMED HERE RATHER THAN LEFT FOR SOMEONE TO FIND.
 * `scripts/photos.manifest.json` carries `budget.landingAt1440` as a hand
 * maintained list of the slots a 1440 viewport fetches on the landing route,
 * and it must name `gallery-apr-group`, `gallery-apr-circle` and
 * `gallery-feb-sign` after this change, at 832, 640 and 640. If it still names
 * `gallery-apr-seated`, `gallery-apr-floor` or `gallery-jul-standing`, the
 * budget check is summing a selection that is no longer on the page. And plan
 * section 8 makes this section's `Suspense` fallback a least squares fit of
 * rendered height against viewport width, re-opened by any change to its
 * composition. It is NOT re-opened by the lead swap, and that is checked rather
 * than assumed: `gallery-apr-group` and `gallery-apr-seated` are both 832x468,
 * both 16:9, both in the same grid cell, so the rendered height delta is exactly
 * zero at every width. The fit that IS in `Home.tsx` came from the earlier edit
 * in this round, where the lead paragraph dropped from 140 characters to 74 and
 * cost one rendered line at every band from `sm` up.
 *
 * MOBILE COLLAPSE, DECLARED HERE RATHER THAN ASSUMED
 * ---------------------------------------------------
 *   below 640px    one column: lead frame, second frame, third frame, link.
 *                  Every frame runs the full container width.
 *   640 to 1023    lead frame full width, the other two side by side beneath
 *                  it, link below.
 *   1024 and up    the unequal two column set above, lead frame seven of twelve.
 *
 * Both breakpoints are measured rather than guessed, and the first one moved
 * once during the build. One column of three full width frames costs 1,455px at
 * 639 of viewport and would have cost 1,937px at 900: that is nearly three
 * tablet viewports of photographs and nothing else, and it is why the pair goes
 * side by side at `sm` rather than at `md`. The same content in the pair state
 * is 900px at 640 and 1,296px at 1023.
 *
 * The `lg` split is NOT run earlier. A five of twelve column is 296px wide at
 * 768px of viewport, which renders a 16:9 documentary frame 167px tall and
 * stops being a photograph. DOM order is the reading order in all three states.
 *
 * CONTRAST. This section introduces ZERO new pairings. Every colour on it is
 * already measured in REDESIGN-PLAN.md section 4.2, recomputed here light then
 * dark:
 *
 *   --ink h2 on --paper                              17.965  17.965
 *   --muted lead paragraph on --paper                 6.601   7.496
 *   --ink link label on --paper                      17.965  17.965
 *   --rule link underline vs --paper                  4.063   4.005
 *   --ink link underline on hover vs --paper         17.965  17.965
 *   focus ring, layer against layer and against ground 17.965 17.965
 *
 * The photographs carry no border, no caption and no overlay, which is how the
 * other three frames on this page are set. There is no hairline anywhere in
 * this section, so nothing here can terminate on a photograph.
 *
 * MOTION. Plan section 6 behaviour 3, reused rather than reinvented: 16px of y
 * plus opacity, `once`, `amount: 0.25`, 60ms stagger across the three frames in
 * reading order. It says "these belong together" as the reader arrives. Under
 * reduced motion the helper returns no motion props at all, so nothing has an
 * initial state to recover from. This section is thousands of pixels below the
 * fold and can never be the LCP element, so the LCP guard is satisfied by
 * position rather than by argument.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Plan section 6 behaviour 3. Same shape as `FounderStory`'s helper. */
function reveal(reduce: boolean | null, delay: number): MotionProps {
    if (reduce) return {};
    return {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.5, delay, ease: EASE },
    };
}

/**
 * The three positions, each a PREFERENCE LIST of slot names resolved in order
 * against what the photo pipeline actually ships, skipping anything an earlier
 * position already took.
 *
 * TYPED AS `string`, NOT AS THE `PhotoSlot` UNION, AND THE DEPARTURE FROM THIS
 * FILE'S OWN PRECEDENT IS DELIBERATE. The union made a vanished frame a compile
 * error rather than a blank box, which is the right trade when the manifest is
 * stable. It is the wrong trade this round: the photo pipeline is being rebuilt
 * in the same working tree, `gallery-apr-group` is one of the frames whose tile
 * width was still moving, and naming it in a union would block everybody's build
 * until they land. The fallbacks are the compensation: every list ends on a slot
 * that ships today, so this section renders correctly before and after the
 * pipeline lands, and it removes itself rather than rendering a headline over an
 * empty grid if it ever resolves to nothing.
 *
 * `gallery-apr-seated` is kept as the lead's FIRST fallback rather than struck
 * out. It is a good frame and the only thing wrong with it is that the hero band
 * currently holds its twin; if the hero band is ever repointed, it is the right
 * frame to come back.
 */
const LEAD_SLOTS: string[] = ['gallery-apr-group', 'gallery-apr-seated', 'gallery-apr-circle'];
const STACKED_SLOTS: string[][] = [
    ['gallery-apr-circle', 'gallery-apr-floor'],
    ['gallery-feb-sign', 'gallery-jul-screen'],
];

/** Every gallery frame that ships, keyed by slot. */
const framesBySlot = new Map<string, GalleryFrame>(
    galleryFrames.map((frame) => [frame.slot, frame] as const),
);

function Frame({ frame }: { frame: GalleryFrame }) {
    return (
        /* `block` on the <picture> as well as the <img>: a default inline
           <picture> leaves a line box descender gap under the image. */
        <picture className="block">
            <source type="image/avif" srcSet={frame.tile.avif} />
            <source type="image/webp" srcSet={frame.tile.webp} />
            <img
                src={frame.tile.src}
                width={frame.tile.width}
                height={frame.tile.height}
                alt={frame.alt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
            />
        </picture>
    );
}

/** First slot in the list that ships and that no earlier position has taken. */
function resolve(preferences: string[], taken: Set<string>): GalleryFrame | undefined {
    for (const slot of preferences) {
        const frame = framesBySlot.get(slot);
        if (frame && !taken.has(slot)) {
            taken.add(slot);
            return frame;
        }
    }
    return undefined;
}

export function GalleryPreview() {
    const reduce = useReducedMotion();

    const taken = new Set<string>();
    const lead = resolve(LEAD_SLOTS, taken);
    const stacked = STACKED_SLOTS.map((preferences) => resolve(preferences, taken)).filter(
        (frame): frame is GalleryFrame => Boolean(frame),
    );

    // If the manifest ever stops shipping every candidate, the section removes
    // itself rather than rendering a headline over an empty grid. There is no
    // loading state and no error state on this section because nothing is
    // fetched: the frames are compiled in.
    if (!lead || stacked.length === 0) return null;

    return (
        <section className="bg-paper py-20 md:py-28 lg:py-32">
            <Container>
                {/* No eyebrow. The budget allows four across ten sections and
                    two are spent; this section does not need a label above a
                    headline that already says what it is. */}
                <div className="max-w-[42rem]">
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
                        What a meetup looks like
                    </h2>
                    {/* NO NUMERAL AT ALL, which is a change of policy rather
                        than a shorter sentence. The old line read the evening
                        count off the data so it could never drift, and drift was
                        never the problem: the problem is that any count of
                        evenings on this page invites the reader to treat it as
                        the number of meetups there have been. The safe number of
                        numbers here is none. */}
                    <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-[1.6] text-muted">
                        Photographs from the meetups in Austin. The rest are on the gallery page.
                    </p>
                </div>

                {/* The unequal set. Seven of twelve against five, and the
                    stacked column is the taller of the two on purpose: the link
                    below occupies the difference, so the row's second grid row
                    is filled by type rather than by nothing.

                    Explicit `row-start` and `row-span` rather than source order,
                    because the link has to come LAST in the DOM so the mobile
                    single column reads frame, frame, frame, link, while at `lg`
                    it has to sit under the lead frame in column one. Those two
                    requirements disagree about order, and grid placement is the
                    mechanism that lets both hold. */}
                <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-12">
                    <motion.div
                        {...reveal(reduce, 0)}
                        className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
                    >
                        <Frame frame={lead} />
                    </motion.div>

                    {/* The pair. Side by side from `md`, stacked again at `lg`
                        where they become the narrow column of the unequal set.
                        That middle state is not decoration: measured on the
                        built page, one column of three full width frames runs
                        1,937px at 900px of viewport, which is nearly three
                        tablet viewports of nothing but photographs. Lead frame
                        over a pair takes the same content to about 1,240px and
                        is a better composition besides. */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:grid-cols-1">
                        {stacked.map((frame, index) => (
                            <motion.div key={frame.slot} {...reveal(reduce, (index + 1) * 0.06)}>
                                <Frame frame={frame} />
                            </motion.div>
                        ))}
                    </div>

                    {/* ONE LINK, and its label is byte for byte the label in
                        Footer's Community group, because both render on `/` and
                        two spellings of one intent on one page is a pre-flight
                        fail. `EventsPreview` carried the same string and its
                        copy is deleted in the same commit: this section is a
                        stronger front door to the same route and two links to
                        one destination on one page is redundancy, not emphasis.

                        A link rather than a button. The page's two button
                        variants are reserved for the join action and for
                        section level actions like "See all meetups"; a lateral
                        move to a sibling page is an inline link. Underlined
                        always, in both modes: accent measures 2.547 against
                        `--ink` in light mode (WCAG 1.4.1, technique G183), so
                        colour may never identify a link on this page.
                        `min-h-11` holds the 44px touch floor.

                        `lg:self-end` rather than the default stretch, and it is
                        a composition decision with a second job. Grid
                        distributes a spanning item's extra height equally
                        across the auto rows it spans, so at rest the link
                        landed 82px under the lead frame, aligned with nothing.
                        Pinned to the end of its row its BASELINE EDGE sits on
                        the bottom edge of the stacked column, so the set closes
                        on one line. The second job: 24px under a photograph is
                        exactly where a caption goes, and skill 9.F bans caption
                        decoration under frames. Sitting at the bottom of the
                        void, level with the far column, it cannot be read as a
                        caption for the frame above it. */}
                    <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:self-end">
                        <Link
                            to="/gallery"
                            className="inline-flex min-h-11 items-center rounded-none text-base font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-hidden focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]"
                        >
                            Meetup Photographs
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
}
