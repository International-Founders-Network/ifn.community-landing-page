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
 * ARTWORK, AND THE HONEST GAP.
 *
 * Only one of the three partners has vendored artwork in this repository.
 * `Icons.tsx` used to render the other two by hotlinking
 * `google.com/s2/favicons`, which sent every visitor's IP to a third party,
 * depended on an endpoint IFN does not control, and put a 16px favicon where a
 * logo belongs. That is the same class of third-party request this repo already
 * removed from the hero, so it was never carried forward here, and as of
 * 2026-08-10 both hotlinked components are deleted at the source and /partners
 * reserves its slots the same way this file does.
 *
 * The three ways out of that are: hotlink (banned above), draw a mark for them
 * (skill 4.8 permits a generated monogram only for INVENTED brands, and these
 * are real companies, so a monogram would misrepresent them), or reserve the
 * slot honestly. This file reserves the slot: a dashed 1px `--rule` box at the
 * exact dimensions the artwork has to fit, carrying the partner's name and the
 * word "pending".
 *
 * WHICH PARTNER GETS ARTWORK IS DATA, NOT A NAME TEST. This component used to
 * ask `partner.id === 'yani-partners'`. It now asks whether `partner.logo` is
 * set in `src/data/partnersData.ts`, so real artwork arrives by dropping a file
 * into `public/partners/` and adding one `logo` key, with no edit to this file
 * and none to /partners. That field also carries the mark's intrinsic
 * dimensions and its `form`, which is what lets one rule size a round emblem
 * and a horizontal lockup differently without either one being measured by
 * hand here.
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
    if (partner.logo) {
        /* Today the only vendored file is the Yani Partners emblem. It is a
           full-colour circular mark carrying its own cream ground, so it reads
           on both page grounds without a per-mode variant: the teal ring
           measures 8.014 against `--band` in light mode, and in dark mode the
           ring falls to 1.845 while the cream disc one step inside it measures
           15.151, so the object is always perceivable, by its edge in light and
           by its field in dark. A logotype is exempt from WCAG contrast in any
           case; these are measured because "it looks fine" is not a
           measurement.

           An emblem renders at 64px against the 56px reserved boxes, which is
           the "sized by eye" instruction in plan section 5: a circular emblem
           reads optically smaller than a horizontal lockup at the same pixel
           height. A lockup therefore takes the reserved slot's 56px height and
           its 192px maximum width, so a real mark arrives at the same height and
           within the same bound as the placeholder it replaces. It is not
           stretched to fill that width: a 2:1 mark renders 112px wide and the
           flex row closes up around it, because padding a logo out to a box is
           how a logo stops looking like itself. Neither form is scaled by the
           viewport either, for the same reason.

           Width and height come from the data and are the artwork's intrinsic
           dimensions, so the box is reserved at the right ratio before the file
           loads and this contributes nothing to CLS. The rendered size is set
           by the classes below, so declaring the true 2000 x 2000 rather than a
           rounded 128 x 128 changes no pixel: both are 1:1 and both are
           overridden to 64px by `h-16 w-16`. */
        /* Two whole literal class strings rather than fragments assembled at
           runtime: Tailwind resolves utilities by scanning source text, so a
           class built by string surgery is not in the source to be found and
           would not be generated. */
        const sizing = partner.logo.form === 'emblem' ? 'h-16 w-16' : 'h-14 w-auto max-w-[12rem]';
        return (
            <img
                src={partner.logo.src}
                alt={partner.name}
                width={partner.logo.width}
                height={partner.logo.height}
                className={`${sizing} flex-none object-contain`}
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
                        Station Austin hosts the meetups. Reuneo runs the speed networking that
                        pairs founders into one-to-one conversations. Yani Partners provides
                        fractional CTO and technology help for founders and small teams. These are
                        working relationships rather than paid placements: nobody on this page
                        bought their way onto it.
                    </motion.p>

                    {/* The Yani Partners related-party disclosure was removed here
                        on 2026-08-10 at the founder's direction, and PRODUCT.md
                        was updated in the same commit so the two do not
                        contradict each other.

                        This section now carries NO accent mark. That is
                        compliant rather than a gap: REDESIGN-PLAN.md section 2
                        makes the mark licence a cap, not a quota, and a section
                        with zero marks passes while a section with an
                        unevidenced mark does not. Do not relicense the mark onto
                        another phrase here to fill the space. */}

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
