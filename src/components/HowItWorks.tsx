import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';
import { photos } from '../data/photos.generated';

interface HowItWorksProps {
    onJoinClick?: () => void;
}

/**
 * HOWITWORKS. Layout family (REDESIGN-PLAN.md section 5, row 3):
 * "single-rule sequence with unequal stops".
 *
 * One 2px `--rule` spine runs the full container width with three ticks
 * hanging from it, and the three stops sit along it at `1fr 2fr 1fr`. Only the
 * wide middle stop carries a photograph. This is a route, not a list: the line
 * is the sequence, the ticks are the stops, and the reader's eye travels it
 * left to right exactly once.
 *
 * WHAT WAS DELETED AND WHY, so nobody reintroduces it
 * ---------------------------------------------------
 * 1. The hardcoded dark navy slab. Skill 4.11 locks the page to one theme, and
 *    dark mode is now a real user choice, so a section that is dark in both
 *    modes reads as walking into a different website. The ground is `--band`,
 *    which is the second surface OF WHICHEVER MODE IS ACTIVE.
 * 2. The three equal bordered cards. Banned outright by skill 9.C. The stops
 *    carry no container, no border, no fill and no radius; they are separated
 *    by unequal column width and by the photograph, not by boxes.
 * 3. The ghost numerals 01 / 02 / 03. Banned by skill 9.F: the step content is
 *    the label. Order is carried by the semantic <ol> and by the spine, and the
 *    ticks are `aria-hidden` because they draw the sequence the list already
 *    announces.
 * 4. The accent orb (a 420px `blur-3xl` circle). Plan section 4.4: the page is
 *    flat. Zero blur, zero glow, zero gradient, zero shadow. Separation is
 *    ground tone, full-opacity rules, and space.
 *
 * MEASURED CONTRAST, both modes, recomputed with the WCAG relative luminance
 * formula rather than copied from the plan (all four grounds agree with plan
 * section 4.2 to three decimals):
 *
 *   --ink on --band       16.281 light  16.318 dark   h2, step titles, marks
 *   --muted on --band      5.982 light   6.808 dark   lead, descriptions
 *   --rule on --band       3.682 light   3.638 dark   spine and ticks (3:1 floor)
 *   --accent on --band     6.393 light   5.011 dark   the marked phrase and its 3px rule
 *   --on-accent on fill    7.054 light   5.517 dark   the primary action label
 *   accent fill boundary   6.393 light   5.011 dark   against this section's ground
 *   focus ring outer --ink 16.281 light 16.318 dark   the better of the two ring layers here
 *
 * The section ground against the page ground is 1.103 light and 1.101 dark,
 * which is tone only and deliberately carries no meaning: this is a full-bleed
 * section ground, not a plate sitting inside one, so plan section 4.2's
 * mandatory 1px plate border does not apply and none is drawn.
 */
export function HowItWorks({ onJoinClick }: HowItWorksProps = {}) {
    const headingId = useId();
    const reduce = useReducedMotion();
    const photo = photos['how-it-works-middle'];

    // The join form asks for four things (name, work email, LinkedIn, stage).
    // See JoinModal.tsx. There is no founder profile and no matching engine, so
    // these steps describe what actually runs.
    //
    // THE COPY IS NO LONGER THE SHIPPED STRINGS. This comment used to end
    // "Copy is preserved verbatim from the shipped section; only the
    // presentation changed", which the repositioning made false. Steps 1 and 2
    // are materially unchanged; step 3 was widened, because it was the one
    // stop on the route that described staying on a mailing list and it is
    // actually where the network, the introductions and the library live. The
    // three stops now read as sign up, meet people, keep the relationship,
    // which is the founder journey rather than the event lifecycle.
    const steps = [
        {
            key: 'sign-up',
            title: 'Sign up',
            body: (
                <>
                    A short form: your name, your email, your LinkedIn address, and the stage
                    your company is at. Nothing else.
                </>
            ),
        },
        {
            key: 'meetup',
            title: 'Come to a meetup',
            body: (
                <>
                    We meet in person once a month in downtown Austin, at the address on the
                    next meetup listing below. The speed-networking part is run by our format
                    partner, so you are paired into short one-to-one conversations rather than
                    left to introduce yourself to strangers on your own.
                </>
            ),
        },
        {
            key: 'keep-going',
            title: 'Keep the conversations going',
            body: (
                <>
                    The useful part usually happens after the evening ends: an introduction to
                    someone who has raised here, a founder who will read your offer letter, an
                    answer to the question you could not search for. Membership adds the private
                    member channel, the resource library, and a members-only call each month.
                </>
            ),
        },
    ];

    // Relocated here from the hero's sub-CTA line (plan section 5), set as three
    // stacked lines so the middle-dot separator chain retires with it. No
    // bullets and no dots: skill 9.F rations the middle dot and bans decorative
    // dots outright, and three short lines need no separator at all.
    //
    // TWO OF THE THREE WERE DENIALS AND ARE NOT ANY MORE. They read "No pitch
    // deck required" and "No introduction needed", which told a reader what
    // they would not be asked for instead of what they would get. The
    // repositioning brief asks for the positive form wherever it is available,
    // and it is available here: the facts underneath (nothing to prepare,
    // nobody to know first, free) are unchanged and all three are still
    // checkable. "Free to attend" is the same claim FinalCTA's fourth
    // commitment and the FAQ's `fee` answer both make, so the three surfaces
    // agree.
    const reassurances = [
        'Free to attend',
        'Open to anyone building here',
        'Come once and decide',
    ];

    // Plan section 6, behaviour 3: y 16px plus opacity, 60ms stagger, once,
    // amount 0.25. Under reduced motion `initial` is `false`, so the element
    // mounts at its resting position and no transform is ever written.
    const rise = (index: number) => ({
        initial: reduce ? false : { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    });

    return (
        <section className="bg-band text-ink py-28 md:py-36" aria-labelledby={headingId}>
            <Container>
                {/* Header stacks vertically: headline on top, body beneath at a
                    capped measure. Deliberately NOT the banned split header
                    (skill 4.7), and no eyebrow, because plan section 5 spends the
                    page's eyebrow budget on the hero and PartnersStrip. */}
                <motion.div {...rise(0)} className="max-w-[62ch]">
                    <h2
                        id={headingId}
                        className="text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.02] tracking-[-0.025em]"
                    >
                        {/* Emphasis is a weight step inside Archivo, never a second
                            family and never colour alone (plan section 4.3). */}
                        <span className="font-medium">What you actually </span>
                        <span className="font-extrabold">get</span>
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                        Sign up, meet founders working through the same things you are, and keep
                        the ones worth keeping. Everything after that (the member channel, the
                        library, the monthly call) is optional, and you decide from there whether
                        it is worth paying for.
                    </p>
                </motion.div>

                {/* THE ROUTE.
                    The wrapper is the positioning context for the vertical spine
                    below `md`. Both spines are 2px `--rule` at full opacity: plan
                    section 4.2 measures a rule at 75% antialiased coverage at
                    2.665 light and 2.764 dark, under the 3:1 floor, so a rule is
                    never expressed with `opacity` or an alpha colour. */}
                <div className="relative mt-20 md:mt-24">
                    {/* Horizontal spine, 768px and up. Plan section 6, behaviour 4:
                        it draws left to right because the line IS the sequence, so
                        drawing it communicates order rather than decorating it. */}
                    <motion.div
                        aria-hidden="true"
                        className="hidden md:block h-0.5 w-full origin-left bg-rule"
                        initial={reduce ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* MOBILE COLLAPSE, declared here rather than assumed.
                        Below 768px the three stops stack in one column and the
                        spine rotates: a 2px vertical `--rule` runs the full height
                        of the list at the left edge, the list is inset by 2rem to
                        clear it, and each tick turns from a 28px drop into a 24px
                        horizontal mark reaching back to the line. Same route, same
                        three stops, read top to bottom instead of left to right. */}
                    <motion.div
                        aria-hidden="true"
                        className="md:hidden absolute left-0 top-0 bottom-0 w-0.5 origin-top bg-rule"
                        initial={reduce ? false : { scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    <ol className="grid list-none grid-cols-1 gap-y-14 pl-8 md:grid-cols-[1fr_2fr_1fr] md:gap-x-8 md:pl-0 lg:gap-x-16">
                        {steps.map((step, index) => (
                            <motion.li key={step.key} {...rise(index + 1)}>
                                {/* The tick. `aria-hidden` because the <ol> already
                                    announces position and count to a screen reader;
                                    the tick draws that same order for sighted
                                    readers and would otherwise be announced twice. */}
                                <span
                                    aria-hidden="true"
                                    className="block h-0.5 w-6 -ml-8 bg-rule md:ml-0 md:h-7 md:w-0.5"
                                />
                                {/* Title scale steps with the column, not against
                                    it: at 768px the outer stops are only about
                                    168px wide, so a 24px title would break "Keep
                                    the conversations going" into four lines. */}
                                <h3 className="mt-6 text-lg font-bold tracking-tight lg:text-xl xl:text-2xl">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-base leading-relaxed text-muted lg:text-[1.0625rem]">
                                    {step.body}
                                </p>

                                {/* Only the wide middle stop carries a photograph,
                                    which is what makes the three stops unequal in
                                    substance as well as in width. No caption and no
                                    overlaid label: plan section 4.4's Plate Rule
                                    puts no type on any photograph on this page, and
                                    skill 9.F bans pills laid over images. The alt
                                    text is the manifest's, hand written, naming no
                                    individual and no venue. Explicit width and
                                    height, so the box is reserved before the bytes
                                    land and this section contributes zero CLS. */}
                                {index === 1 && (
                                    <picture>
                                        <source
                                            type="image/avif"
                                            srcSet={photo.avif}
                                            sizes={photo.sizes}
                                        />
                                        <source
                                            type="image/webp"
                                            srcSet={photo.webp}
                                            sizes={photo.sizes}
                                        />
                                        <img
                                            src={photo.src}
                                            width={photo.width}
                                            height={photo.height}
                                            alt={photo.alt}
                                            loading={photo.loading}
                                            decoding="async"
                                            className="mt-10 block h-auto w-full"
                                        />
                                    </picture>
                                )}
                            </motion.li>
                        ))}
                    </ol>
                </div>

                {/* The route ends at the action. Reassurance reads first, then the
                    single action, which is also the DOM order, so keyboard and
                    screen-reader order match the visual order at every width. */}
                <motion.div
                    {...rise(4)}
                    className="mt-20 flex flex-col items-start gap-8 md:mt-24 md:flex-row md:items-end md:justify-between"
                >
                    <ul className="list-none space-y-1 text-base font-medium text-muted">
                        {reassurances.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                    <Button variant="primary" size="lg" onClick={onJoinClick}>
                        Join the community
                        <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                </motion.div>
            </Container>
        </section>
    );
}

/* THE `Mark` COMPONENT WAS DELETED HERE, with its 53 lines of licence
   documentation, and the phrase it wrapped ("downtown Austin") is now plain
   text in step 2 above. The founder's highlight audit set the page's complete
   list of marked phrases, and it holds five, all of them in `Hero` and
   `ValueProps`. Nothing in this section is on that list, so this section
   carries no mark, and with no call site left the component was unreachable
   and eslint failed the build on it.

   THE SENTENCE DID NOT CHANGE, only its emphasis. "We meet in person once a
   month in downtown Austin, at the address on the next meetup listing below"
   still says exactly what it said, and it is still true of the events feed
   further down this page, which prints the featured meetup's street address
   from `src/data/events.json`. The claim kept its evidence; it lost its
   underline.

   WHAT WENT WITH THE COMPONENT, so it is not mourned as a loss: a standing
   condition saying that if the events feed ever resolved empty the mark must
   be DELETED rather than relicensed onto another phrase. That instruction is
   now moot here, and the general rule behind it is recorded in `ValueProps`
   and in REDESIGN-PLAN.md section 2. The construction itself survives in
   `ValueProps.tsx` and `Hero.tsx` if this section ever needs it back. */
