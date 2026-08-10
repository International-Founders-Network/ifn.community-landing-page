import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Container } from './Container';
import { galleryNights, type GalleryFrame, type PhotoSlot } from '../data/photos.generated';

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
 * FounderStory stacks one frame under a measure, and `/gallery` is a
 * chronological register of EQUAL tiles whose whole argument is that block area
 * encodes frame count. That argument does not exist here, which is exactly why
 * these three are deliberately unequal: skill 9.C bans the three equal card row
 * outright, and equal tiles are only earned where they are counting something.
 *
 * WHAT THIS SECTION CLAIMS, AND WHAT IT REFUSES TO
 * ------------------------------------------------
 * It prints NO DATE on any frame. Plan section 5 states that no photograph on
 * the home page prints a date and section 7's recurrence accounting is built on
 * `/gallery` being the only dated surface on this site. A dated home band would
 * reopen both. It prints no caption either, under the Plate Rule and skill 9.F.
 * The one numeral in the copy is `galleryNights.length`, read off the data, so
 * the sentence cannot drift away from what ships.
 *
 * FRAME SELECTION, AND THE THREE FRAMES IT HAD TO REFUSE
 * ------------------------------------------------------
 * One frame per photographed evening, three evenings, and the lead position
 * goes to April because that is the evening the record holds the most frames
 * from. That is the same rule `/gallery` uses for block size, reduced to a
 * single row.
 *
 * Six candidates existed and three were refused for stated reasons:
 *   gallery-apr-room       the hero band's own source. The same frame twice on
 *                          one page.
 *   gallery-apr-gesture    the HowItWorks stop's source. Same objection.
 *   gallery-apr-group      the posed line up. Plan section 7 reverses its
 *                          exclusion FOR THE GALLERY ROUTE ONLY and leaves it
 *                          binding on the landing page, and this is the landing
 *                          page.
 * `gallery-apr-listening` was rejected on the plan's one stated design
 * preference about the former venue mark: the gear is the highest contrast
 * object in that frame. `founder-story` is February's first gallery frame and
 * is already on this page, so February shows `gallery-feb-sign` instead. The
 * three that ship are a full room in daylight, a lit sign at night, and three
 * people talking with drinks, which is three different pictures rather than one
 * picture three times.
 *
 * BYTES. Only the 640px `tile` tier is offered, with no `srcset` and no
 * `sizes`, exactly as `/gallery` does and for the same reason: the frames also
 * carry a 1280px `view` tier, and putting it in a srcset makes every 2x display
 * fetch about 137KB of band nobody asked for. The three tiles are 38.4KB of
 * avif together, and the landing route's measured total at a 1440 viewport is
 * 136.6KB against a 500KB budget. No new derivative was built for this section.
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
 * The three slots, named as a typed constant. `PhotoSlot` is a union emitted by
 * the photo pipeline, so a frame leaving the manifest is a compile error here
 * rather than a blank box in production.
 */
const LEAD_SLOT: PhotoSlot = 'gallery-apr-floor';
const STACKED_SLOTS: PhotoSlot[] = ['gallery-feb-sign', 'gallery-jul-standing'];

/** Every gallery frame that ships, keyed by slot, flattened out of the nights. */
const framesBySlot = new Map<string, GalleryFrame>(
    galleryNights.flatMap((night) => night.frames.map((frame) => [frame.slot, frame] as const)),
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

export function GalleryPreview() {
    const reduce = useReducedMotion();

    const lead = framesBySlot.get(LEAD_SLOT);
    const stacked = STACKED_SLOTS.map((slot) => framesBySlot.get(slot)).filter(
        (frame): frame is GalleryFrame => Boolean(frame),
    );

    // If the manifest ever stops shipping the lead frame, the section removes
    // itself rather than rendering a headline over an empty grid. There is no
    // loading state and no error state on this section because nothing is
    // fetched: the frames are compiled in.
    if (!lead || stacked.length === 0) return null;

    const nightCount = galleryNights.filter((night) => night.frames.length > 0).length;

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
                    {/* The numeral is read off the data rather than typed, so
                        this sentence cannot drift away from what ships. It is
                        placed mid sentence rather than at the front on purpose:
                        `{nightCount} Austin evenings have been photographed`
                        renders as "3 Austin evenings", and a sentence opening on
                        a digit is a typographic tell. Spelling it out would fix
                        the look and reintroduce the drift, so the sentence moved
                        instead of the number. */}
                    <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-[1.6] text-muted">
                        One frame from each of the {nightCount} Austin evenings that have been
                        photographed. The rest are on the gallery page.
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
