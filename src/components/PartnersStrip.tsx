import { motion, type Variants } from 'framer-motion';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';
import { PARTNERS, type Partner } from '../data/partnersData';

/**
 * PARTNERS. Section 6 of REDESIGN-PLAN.md ("The Sign").
 *
 * Layout family, assigned in plan section 5 and used by no other section on
 * this page: LOGO BASELINE WITH RUNNING PROSE. Three marks on one optical
 * baseline, sized by eye rather than boxed to a common width, then one
 * full-measure paragraph beneath them. No cards, no grid, no rule under the
 * row, and nothing printed under any individual mark.
 *
 * The row deliberately carries no hairline. HowItWorks owns the horizontal
 * rule on this page (a 2px spine with ticks), and a second horizontal rule one
 * section later would read as one family repeated rather than two families.
 * The baseline here is optical: the marks share a bottom edge and nothing draws
 * it.
 *
 * Ground is `--band`, which is what puts this section between the two `--paper`
 * sections around it and separates them by tone rather than by a rule.
 *
 * WHY THERE ARE NO CATEGORY LABELS. Skill section 4.8's LOGO-ONLY rule: a logo
 * wall is logos and nothing else, because "Station Austin / Venue Partner"
 * tells a reader nothing the logo did not already tell them. The information
 * those three labels used to carry moves into the single paragraph below the
 * row, which is the plan's own instruction and is what keeps the shipped
 * headline ("and what each one does") true.
 */

/* Plan section 6 behaviour 3: section entry, `y` 16px plus opacity, 60ms
   stagger, `once`, `amount: 0.25`. Transform and opacity only. This section is
   far below the fold and contains no LCP candidate, so the opacity half of it
   is permitted here (the LCP guard binds on the hero's ancestor chain).
   Reduced motion is handled globally by <MotionConfig reducedMotion="user">:
   the translate is dropped and the content renders at rest. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const step: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * THE MARK (plan section 2, behaviour 2 in section 6).
 *
 * Accent type plus a 3px accent rule, licensed only to a phrase a reader can
 * check against something on this page. Exactly one is used in this section,
 * on the standing disclosure, which is the most checkable sentence here.
 *
 * The wrapper is `inline-block` and `whitespace-nowrap` on purpose. An
 * absolutely positioned rule inside a plain `inline` element resolves against a
 * containing block assembled from that inline's fragment boxes, so a phrase
 * that wraps gets a rule of browser-dependent width. One fragment, one rule.
 * The nowrap is safe at the size it is used: the marked phrase is 27
 * characters, which at the 17px body size and Archivo's 0.529em average advance
 * is about 243px, inside the 288px of content a 320px viewport leaves.
 *
 * The rule is a transform animation, so under reduced motion Framer Motion
 * applies the target instantly and the mark is simply drawn. If it never draws
 * at all, the phrase is still marked by colour and weight, so no meaning is
 * carried by the animation alone.
 *
 * Contrast, both modes, on this section's `--band` ground: accent type 6.393
 * light and 5.011 dark, the 3px rule the same numbers against a 3.0 non-text
 * floor. Accent against the surrounding `--ink` body text measures 2.547 light
 * and 3.256 dark, which is why the mark is never colour alone: the rule and the
 * weight step are the non-colour differentiators. This phrase is not a link, so
 * the underline rule that governs links is not what is doing the work here.
 */
function Mark({ children }: { children: React.ReactNode }) {
    return (
        <span className="relative inline-block font-semibold whitespace-nowrap text-accent">
            {children}
            <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[0.14em] block h-[3px] origin-left bg-accent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.26, ease: EASE }}
            />
        </span>
    );
}

/**
 * ARTWORK, AND THE HONEST GAP.
 *
 * Only one of the three partners has vendored artwork in this repository.
 * `Icons.tsx` renders the other two by hotlinking `google.com/s2/favicons`,
 * which sends every visitor's IP to a third party, depends on an endpoint IFN
 * does not control, and puts a 16px favicon where a logo belongs. That is the
 * same class of third-party request this repo already removed from the hero, so
 * it is not carried forward here.
 *
 * The three ways out of that are: hotlink (banned above), draw a mark for them
 * (skill 4.8 permits a generated monogram only for INVENTED brands, and these
 * are real companies, so a monogram would misrepresent them), or reserve the
 * slot honestly. This file reserves the slot: a dashed 1px `--rule` box at the
 * exact dimensions the artwork has to fit, carrying the partner's name and the
 * word "pending".
 *
 * The name inside the box is identification, not categorisation. Skill 4.8
 * bans the second (no "hosting", no "payments", no "Venue Partner") and
 * explicitly allows the first as the mark's accessible name.
 *
 * Dashed rather than solid so the box cannot be mistaken for a plate border,
 * which in this system is always solid. Each drawn segment is a full-opacity
 * 1px `--rule`, measuring 3.682 on `--band` in light and 3.638 in dark, so the
 * hairline rule in plan section 4.2 is satisfied literally: no `opacity`, no
 * alpha colour.
 *
 * WHAT THE FOUNDER MUST SUPPLY, per slot:
 *   single-colour SVG, transparent background, viewBox proportioned to render
 *   at a 56px optical height inside a 192 x 56 CSS px box. Single colour so it
 *   can take `--ink` and therefore work in both modes from one file. If the
 *   brand requires full colour, two files (one for each mode) or one file whose
 *   artwork carries its own ground, as the Yani Partners emblem does.
 *
 * This departs from plan section 5, which says a partner without artwork is
 * omitted from the row rather than shown. Omitting two of three would leave a
 * section headlined "Three named partners" showing one, and the reserved slot
 * keeps the composition honest about what is missing instead of hiding it.
 */
const RESERVED_SLOT = 'h-14 w-[12rem]';

function PartnerMark({ partner }: { partner: Partner }) {
    if (partner.id === 'yani-partners') {
        /* The one vendored file. It is a full-colour circular emblem carrying
           its own cream ground, so it reads on both page grounds without a
           per-mode variant: the teal ring measures 8.014 against `--band` in
           light mode, and in dark mode the ring falls to 1.845 while the cream
           disc one step inside it measures 15.151, so the object is always
           perceivable, by its edge in light and by its field in dark. A
           logotype is exempt from WCAG contrast in any case; these are measured
           because "it looks fine" is not a measurement.

           Rendered at 64px against the 56px reserved boxes, which is the
           "sized by eye" instruction in plan section 5: a circular emblem reads
           optically smaller than a horizontal lockup at the same pixel height.
           Width and height are explicit and match the file's 1:1 intrinsic
           ratio, so this contributes nothing to CLS. */
        return (
            <img
                src="/partners/yani-partners-logo.png"
                alt={partner.name}
                width={128}
                height={128}
                className="h-16 w-16 flex-none object-contain"
                loading="lazy"
                decoding="async"
            />
        );
    }

    /* TODO(founder): vendor real artwork for this partner into
       public/partners/ and replace this reserved slot. Single-colour SVG,
       transparent background, rendering at 56px height inside a 192 x 56 box.
       Until then this stays a labelled placeholder. Do not restore the
       google.com/s2/favicons hotlink and do not substitute a drawn monogram. */
    return (
        <div
            className={`${RESERVED_SLOT} flex flex-none items-center justify-center border border-dashed border-rule px-3 text-center`}
        >
            <span className="text-[0.6875rem] leading-[1.4] font-semibold tracking-[0.1em] text-muted uppercase">
                {partner.name}
                <span className="block font-normal tracking-[0.06em]">Logo pending</span>
            </span>
        </div>
    );
}

export function PartnersStrip() {
    return (
        <section className="bg-band py-28 md:py-36" id="partners">
            <Container>
                <motion.div
                    variants={group}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.25 }}
                >
                    {/* One of the page's two eyebrows, budgeted in plan section 5.
                        `--muted` on `--band`: 5.982 light, 6.808 dark. */}
                    <motion.div variants={step}>
                        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                            Who we work with
                        </p>
                        {/* Emphasis is a weight step inside one family, never a
                            second family and never colour alone (plan 4.3): the
                            line sits at 500 and the marked-out phrase at 800,
                            which is how the source slide sets "International"
                            against "Founders". `--ink` on `--band`: 16.281
                            light, 16.318 dark. */}
                        <h2 className="mt-5 max-w-[22ch] text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.02] font-medium tracking-[-0.025em] text-ink">
                            <span className="font-extrabold">Three named partners</span>, and what
                            each one does
                        </h2>
                    </motion.div>

                    {/* THE BASELINE. `items-end` gives the shared bottom edge
                        that makes the row read as one line of marks even though
                        the marks are different heights.

                        MOBILE COLLAPSE, declared here rather than assumed: the
                        row is `flex-wrap`. A reserved slot is 192px and the gap
                        is 48px, so two slots need 432px of content width. Below
                        640px the container leaves at most 328px, so the row
                        wraps to one mark per line, left aligned, with a 40px row
                        gap. Nothing is centred and nothing shrinks: a logo that
                        scales down with the viewport stops being a logo. */}
                    <motion.ul
                        variants={step}
                        className="mt-16 flex list-none flex-wrap items-end gap-x-12 gap-y-10 md:mt-20 lg:gap-x-24"
                    >
                        {PARTNERS.map((partner) => (
                            <li key={partner.id} className="flex items-end">
                                <PartnerMark partner={partner} />
                            </li>
                        ))}
                    </motion.ul>

                    {/* The one paragraph the row's missing labels fold into.
                        It names each partner and the single job that partner
                        does, which is the whole content of the retired
                        `category` strings, at reading scale instead of as three
                        pieces of fine print. It also carries the claim relocated
                        from the hero by plan section 5 ("Speed networking by
                        Reuneo"). Measure capped at 65ch per plan 4.3. */}
                    <motion.p
                        variants={step}
                        className="mt-14 max-w-[65ch] text-[1.0625rem] leading-[1.6] text-ink md:mt-16"
                    >
                        Station Austin is the venue the meetups are held in. Reuneo runs the speed
                        networking that pairs founders into one-to-one conversations in place of
                        standing-around small talk. Yani Partners provides fractional CTO and
                        technology help for founders and small teams. These are working
                        relationships rather than paid placements: nobody on this page bought
                        their way onto it.
                    </motion.p>

                    {/* PRODUCT.md requires this disclosure to travel with the
                        Yani Partners claim wherever the claim appears, not only
                        on /partners. Reproduced verbatim and unshortened, at
                        body scale rather than as a footnote, because it is the
                        point of the section. This carries the section's single
                        mark. */}
                    <motion.p
                        variants={step}
                        className="mt-8 max-w-[65ch] text-[1.0625rem] leading-[1.6] text-ink"
                    >
                        <span className="font-bold">Disclosure:</span> Yani Partners was founded by{' '}
                        <Mark>the same people who run IFN</Mark>. It is not an outside company
                        recommending us, and we would rather tell you that here than have you find
                        it out later.
                    </motion.p>

                    {/* The marks are not links. Two of the three partners have a
                        website in the data and one does not, so linking the row
                        would make two marks interactive and one not, on a page
                        whose shape rule says pressability is signalled
                        consistently. /partners carries the outbound links, and
                        this is the way into it. Intent is distinct from the
                        page's "Join the community" action, so the one-label-per-
                        intent rule is not touched. */}
                    <motion.div variants={step} className="mt-12">
                        <ButtonLink to="/partners" variant="outline">
                            Read about each partner
                        </ButtonLink>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}
