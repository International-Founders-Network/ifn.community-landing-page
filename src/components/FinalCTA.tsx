import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';
import { MEMBERSHIP_PRICE_ATTENDEE, MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';

/**
 * SECTION 9. The page's one colour block (REDESIGN-PLAN.md section 5, row 9).
 *
 * LAYOUT FAMILY: full-bleed accent field, content distributed top to bottom.
 * Nothing else on the page is a colour field and nothing else distributes its
 * content across a full-height ground: the statement sits at the head of the
 * field and the four commitments run as a base register along its foot, which
 * is a poster rather than a section. `min-h-[100dvh]` (never `h-screen`, plan
 * section 11) is what makes plan section 2's phrase "a full viewport of accent"
 * literally true, which is the wording the theme-lock exception is claimed on.
 *
 * WHAT WENT: the dark slab, the two radial-gradient washes (flat material, plan
 * section 4.4: zero gradients, and they were two of the token-alpha composites
 * Phase 2 carried forward), the bordered panel around the four items, the four
 * lucide icons in that panel, the uppercase-tracking "What you are signing up
 * for" label (a mechanical eyebrow, and the budget of 3 is already spent by the
 * hero and PartnersStrip), the italic `Emphasis` word, and the second action.
 *
 * WHAT STAYED: all four commitment titles AND all four detail strings, verbatim
 * and character for character. An audit caught a draft dropping the details.
 * "Hosted at Station Austin" is correct and settled. The headline is preserved.
 * The lead paragraph is preserved verbatim too: the founder's copy delegation
 * of 2026-08-09 covers the HERO subtext only, so nothing here licenses a cut,
 * and the clause naming visas, bank paperwork and a first hire abroad is the
 * only place on this field where the reader sees their own problem named.
 *
 * EVERY MARK ON THIS FIELD IS `--on-plate`, NEVER `--on-accent`.
 * `--accent-plate` is theme invariant (#A81B36 in both modes) and `--on-accent`
 * is not, so folding them together resolves to #131311 on #A81B36 in dark mode
 * at 2.547 and puts the page's closing frame below even the 3:1 large-text
 * floor. That was a blocking audit defect. Recomputed with the WCAG relative
 * luminance formula and cross-checked against `scripts/verify-dark-contrast.py`,
 * which is the instrument plan section 9 assigns to whoever builds this plate:
 *
 *   --on-plate #FBFBFA type on the plate, all sizes      7.054  both modes
 *   pill fill --on-plate, boundary against the plate     7.054  both modes
 *   pill label --accent-plate on the --on-plate fill     7.054  both modes
 *   focus ring better layer against the plate            7.054  both modes
 *     (the --paper inner in light, the --ink outer in dark: the ring is
 *      2px --paper inner plus 2px --ink outer, identical in both modes and
 *      never reversed, and it arrives through `buttonStyles.ts` untouched)
 *   the ring's two layers against each other            17.965  both modes
 *
 * NO HAIRLINE ANYWHERE ON THIS FIELD. `--rule` measures 1.736 light and 1.573
 * dark against the plate, so it cannot terminate here. Space is the only
 * separator available, which is why the four commitments carry no rules, no
 * bullets and no icons.
 *
 * MOBILE COLLAPSE, declared here rather than left to Tailwind (plan risk 4):
 * below 640px every block is a single full-width column in DOM order, and the
 * four commitments become the plan's literal stack; 640px to 1279px they are a
 * 2x2; from 1280px they are the 4-up base register. The break is at `xl` and
 * not at `lg` because at a 1024px viewport a column is about 216px wide and the
 * longest detail string runs to four lines, which ragged the row.
 */
const PROOF = [
    {
        title: 'Every month, in person',
        detail: 'More than six months of monthly meetups, all of them in Austin.',
    },
    {
        title: 'Hosted at Station Austin',
        detail: 'Our venue partner. The address is on every event listing.',
    },
    {
        title: 'Structured one-to-one networking',
        detail: 'Run with Reuneo: you are paired for short conversations, one person at a time.',
    },
    {
        title: 'Free to attend',
        detail: `Register on Luma or Meetup. Membership is a separate, optional layer at ${MEMBERSHIP_PRICE_STANDARD} a year.`,
    },
];

/**
 * Motion, plan section 6 behaviour 3: `whileInView`, y 16px plus opacity, 60ms
 * stagger, `once: true`, `amount: 0.25`, transform and opacity only.
 *
 * Two behaviours, each justified in one sentence:
 *   1. The statement block enters as one unit, because the headline, the lead
 *      and the action are a single closing argument and revealing them in
 *      pieces would rank them.
 *   2. The base register staggers its five children at 60ms, because the four
 *      commitments plus the pricing note are a list and the stagger is what
 *      says so before the reader has read a word of it.
 *
 * Opacity is permitted here where it is banned in the hero: this section is the
 * last on the page, it can never be the LCP element, and the plan's LCP guard
 * is a ban on the hero's ancestor chain specifically.
 *
 * Reduced motion is handled by `<MotionConfig reducedMotion="user">` in
 * `App.tsx`, which drops the transform. No timer, no scroll listener and no
 * `useEffect` is added by this section, so there is nothing here for a
 * hand-written `useReducedMotion` to stop.
 */
const REVEAL = {
    rest: { opacity: 0, y: 16 },
    in: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
};

/**
 * The four commitments stagger at 60ms. The pricing note is deliberately NOT
 * part of that stagger and carries a flat 0.24s delay instead, which is where
 * the fourth commitment starts: nesting it under a second `staggerChildren`
 * would have compounded the two and landed the footnote before the third and
 * fourth items, reading as a list that arrives out of order.
 */
const REGISTER = {
    rest: {},
    in: { transition: { staggerChildren: 0.06 } },
};

/** Pass through, so the block below propagates the variant label to its children. */
const GROUP = { rest: {}, in: {} };

const REVEAL_LAST = {
    rest: { opacity: 0, y: 16 },
    in: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] as const },
    },
};

interface FinalCTAProps {
    onJoinClick: () => void;
}

export function FinalCTA({ onJoinClick }: FinalCTAProps) {
    return (
        <section className="flex min-h-[100dvh] flex-col justify-between bg-accent-plate py-20 text-on-plate md:py-28">

            <Container size="xl" className="w-full">
                <motion.div
                    initial="rest"
                    whileInView="in"
                    viewport={{ once: true, amount: 0.25 }}
                    variants={REVEAL}
                >
                    {/* Emphasis is a weight step inside Archivo, 800 against a
                        500 line, which is the slide's own mechanism (plan
                        section 4.3). Never a second family, never italic, and
                        never colour here: `--accent` on `--accent-plate` is the
                        same value, so an accent mark on this field measures
                        1.000 and disappears. From 1024px up the measure cap
                        breaks the line after "in", which sets "Austin." alone
                        on the second line at 800. */}
                    <h2 className="text-[clamp(2.25rem,4.6vw,4rem)] font-medium leading-[1.02] tracking-[-0.025em] lg:max-w-[62%]">
                        Come to one meetup in <span className="font-extrabold">Austin.</span>
                    </h2>

                    {/* 52ch, not the 65ch cap: at 1280px the h2's 62% measure
                        is 754px and a 58ch lead at 20px is about 615px, close
                        enough that the two blocks would read as one ragged
                        column instead of a statement standing over a measure.
                        52ch is about 551px, which stages them. */}
                    <p className="mt-8 max-w-[52ch] text-lg leading-[1.55] md:text-xl">
                        Once a month, founders who moved here to build meet in the same room:
                        people working through the same visa questions, the same bank paperwork,
                        the same first hire in another country. Come once and decide from there.
                    </p>

                    {/* ONE action. "Join the community" is the settled label for
                        this intent across nav, hero, HowItWorks and here, so a
                        second CTA of the same intent is banned; the outgoing
                        "See the next meetup" is a different intent and was cut
                        anyway, because plan section 5 gives this section one
                        action and one field, and the Luma calendar is still
                        reached from EventsPreview, the FAQ, the join dialog and
                        the footer.

                        The pill is the page's primary button inverted onto its
                        own field: an --on-plate #FBFBFA fill (7.054 against the
                        plate) carrying an --accent-plate #A81B36 label (7.054
                        against the fill). Deliberately NOT a --paper fill with
                        an --ink label, because --paper is per mode and a dark
                        mode #131311 pill measures 2.547 at its boundary here.

                        HOVER INVERTS, and the numbers are written down so the
                        next audit does not have to re-derive them: the fill
                        becomes --accent-plate, which is 1.000 against the field
                        it sits on, so the boundary is carried instead by the
                        2px --on-plate stroke at 7.054, and the label becomes
                        --on-plate at 7.054 on the new fill. The stroke is
                        present at rest as well (invisible, fill and stroke are
                        the same colour there) so hover changes no geometry.
                        This is the same mechanism plan section 4.2 uses for the
                        JoinModal boundary in dark mode: where tone cannot carry
                        an edge, a measured border does.

                        Radius, focus ring, the 44px touch floor and the
                        :active press all arrive through `buttonClasses`; only
                        the four colour utilities are overridden, and twMerge
                        drops the primary variant's own three. */}
                    <div className="mt-10">
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={onJoinClick}
                            className="w-full gap-3 border-2 border-on-plate bg-on-plate text-accent-plate hover:bg-accent-plate hover:text-on-plate sm:w-auto"
                        >
                            Join the community
                            <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                        </Button>
                    </div>
                </motion.div>
            </Container>

            <Container size="xl" className="mt-24 w-full">
                <motion.div
                    initial="rest"
                    whileInView="in"
                    viewport={{ once: true, amount: 0.25 }}
                    variants={GROUP}
                >
                    {/* The panel's visible label is gone as a banned eyebrow,
                        but the heading itself stays in the document outline
                        rather than being downgraded to an aria-label, so the
                        structural accessibility delta of this rebuild is zero. */}
                    <h3 className="sr-only">What you are signing up for</h3>

                    <motion.ul
                        variants={REGISTER}
                        className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        {PROOF.map(({ title, detail }) => (
                            <motion.li key={title} variants={REVEAL}>
                                <span className="block text-[1.0625rem] font-bold leading-snug">
                                    {title}
                                </span>
                                <span className="mt-2 block max-w-[40ch] text-[0.9375rem] leading-[1.55]">
                                    {detail}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* Prices are imported, never typed. Only the attendee rate
                        is printed here: the standard rate is already in the
                        fourth commitment above, verbatim, and printing it twice
                        on one screen reads as a page that cannot keep its own
                        figures straight. No checkout is designed and
                        STRIPE_PAYMENT_LINK is wired to nothing. */}
                    <motion.p
                        variants={REVEAL_LAST}
                        className="mt-14 max-w-[62ch] text-[0.9375rem] leading-[1.55]"
                    >
                        Membership is the paid layer and it is optional: the private member
                        channel, the resource library and monthly office hours.{' '}
                        {MEMBERSHIP_PRICE_ATTENDEE} a year if you already come to the meetups.
                    </motion.p>
                </motion.div>
            </Container>

        </section>
    );
}
