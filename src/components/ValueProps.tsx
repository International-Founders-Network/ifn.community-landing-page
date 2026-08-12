import { motion, useReducedMotion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { Container } from './Container';

/* ============================================================================
   VALUEPROPS. Section 2 of REDESIGN-PLAN.md ("The Sign"). Phase 3.

   LAYOUT FAMILY: "staircased statements in open space", assigned to this
   section and to no other in plan section 5. A 12 column grid carries four
   rows whose column-start walks 1, 3, 2, 4. There are no rules, no plates, no
   containers, no icons and no equal columns anywhere in it. The asymmetry is
   the design, so the geometry is printed here rather than left to a label:

     row 1   cols 1..7    (start 1, span 7)
     row 2   cols 3..10   (start 3, span 8)
     row 3   cols 2..8    (start 2, span 7)
     row 4   cols 4..11   (start 4, span 8)

   Ragged on both edges by construction. Measured before it was committed, at
   `gap-x-6` and Tailwind's own container padding:

     768px  content 720, col 38.0  -> span 7 = 410px (45ch), span 8 = 472px (52ch)
     1024px content 960, col 58.0  -> span 7 = 550px (61ch), span 8 = 632px (70ch)
     1280px content 1216, col 79.3 -> span 7 = 699px (78ch), span 8 = 803px (89ch)

   45ch at 768 is the floor and it is why the spans are 7 and 8 rather than 6
   and 7, and why the gap is not widened. Above 1024 the column outruns the
   65ch measure from plan section 4.3, so every row body is capped at 62ch and
   the surplus column becomes white space rather than a longer line.

   MOBILE COLLAPSE, DECLARED (plan section 11, skill 7 MOBILE OVERRIDE):
   below 768px the grid is `grid-cols-1` and every `col-start` / `col-span`
   above is gated behind `md:`, so the staircase collapses to a strict single
   full-width column with no horizontal offsets left over. Vertical rhythm
   drops from `gap-y-24` to `gap-y-16` because a single column does not need
   the staircase's tread height to stay legible.

   THE THREE THINGS THAT WERE DELETED, so nobody re-adds them:
   - The bordered 2x2 card grid. Skill 4.4 licenses cards only where elevation
     communicates real hierarchy, and four peer statements have none.
   - The four icon tiles (rounded squares with a lucide glyph, hover-inverted).
     Plan section 5: "no icons".
   - The "Austin, Texas" eyebrow pill. The page's eyebrow budget is 2 of 3 and
     both are allocated, to Hero and PartnersStrip (plan section 5).
   ========================================================================== */

/* ---------------------------------------------------------------------------
   THE ACCENT LICENCE, APPLIED (plan section 2).

   The accent may mark only a phrase that is checkable against a named artifact
   on this page. THIS SECTION NOW CARRIES NO MARK AT ALL. It carried two, then
   one, and the count reached zero in three steps, each recorded so nobody reads
   the absence as rot:

   1. Row 3's mark went with the denial it sat on ("There is no matching system
      here"), when the repositioning replaced "what we are not" phrasing with a
      description of the introduction a founder actually receives.
   2. Row 2's mark ("put in your calendar") went with its title, which the
      founder's copy edit replaced with "A monthly place to meet the network".
      The new title makes no checkable claim, so there is nothing left in it to
      licence.
   3. With no call site left, the `Mark` component itself was deleted. See the
      note at its old position further down this file.

   NONE OF THE FOUR ROWS QUALIFIES NOW, and the near misses are written out so
   they are not re-litigated one at a time:
   - Row 1 asserts who is in the room. True, and nothing on this page is a
     named artifact a reader can check it against.
   - Row 2's BODY still says the dates are "published openly on Luma and
     Meetup", which the dated feed in EventsPreview (`#events`) would check
     perfectly well. It is deliberately unmarked. The mark that used to live in
     this row was in its TITLE, and moving it into the body to preserve a count
     is relicensing, which is the one move the licence forbids outright.
   - Row 3 no longer contains a denial to mark.
   - Row 4's artifact would be ResourcesPreview's topic panels, which are owned
     by another section and whose final topics this component cannot inspect.
     Marking a claim against an artifact you have not read is the same move the
     plan disqualified the Marked Copy ledger for, one step smaller.

   ZERO IS COMPLIANT AND IS NOT A GAP TO FILL. REDESIGN-PLAN.md section 2 makes
   the licence a CAP AND NOT A QUOTA: a section with no marks passes, and a
   section with an unevidenced mark is the exact defect section 4.2 exists to
   stop. This repo has now applied that rule three times, to PartnersStrip in
   6990b9c and twice here.

   Plan section 2 says "ValueProps carries four marks" while plan section 5
   says "exactly one clause in each is marked, and only the checkable one" and
   then names exactly two. That is an inconsistency inside the plan, and this
   file now satisfies neither number. It is resolved in favour of the licence,
   which is the rule both of those sentences were counting against. Do not
   "restore" any of them.

   THE PLAN DOCUMENT NOW CONTRADICTS THIS FILE IN TWO NAMED PLACES, AND THE
   CONTRADICTION IS THE PLAN'S TO FIX RATHER THAN THIS COMPONENT'S.
   `REDESIGN-PLAN.md:301` still reads "The four shipped claims survive
   verbatim" and still cites "There is no matching system here" as a marked
   phrase. Both were true when written and neither is true now. They are
   printed here so the next reader who greps the plan for authority finds this
   note first and does not reinstate a deleted denial as a bug fix. Amending
   the plan is handed over, on the same rule this repo already applies six
   times over: the plan is not this component's file.

   DENSITY: zero marks against a ceiling of two per viewport, so the seam with
   HowItWorks below is now unconditionally clear. That seam used to need
   checking, because HowItWorks opens with a mark of its own on "downtown
   Austin" and a tall viewport can hold the end of this section and the start of
   that one at the same time.

   WHY THE 3px RULE IS THE MECHANISM AND THE HUE IS NOT, kept because it is the
   reasoning any future mark in this section has to satisfy. Computed with the
   WCAG relative luminance formula, `--accent` against the surrounding `--ink`
   body text measures 2.547 light and 3.256 dark, and against `--muted` it
   measures 1.069 and 1.359. So hue alone cannot be trusted to make a mark
   perceivable, which is exactly the finding behind the plan's
   underline-every-link rule. The 3px accent rule is what carries it: 7.054
   against `--paper` in light and 5.517 in dark, both clear of the 3.0 non-text
   floor. Two consequences: no mark is ever placed inside a `--muted` paragraph,
   and no meaning anywhere in this section is carried by a mark at all. Strip
   the colour and the rule and every sentence still reads exactly the same,
   which is now trivially true because there is no colour and no rule left.

   That 3px rule is the plan's licensed mark rule, not a structural hairline.
   The full-opacity-1px hairline rule in plan section 4.2 governs plate borders
   and table rules, of which this section has none.
   -------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   MOTION. Plan section 6, behaviour 3 only, twice. Two behaviours, both
   transform and opacity only, both `whileInView` with `once: true`, no timers,
   no scroll listeners, no loops, nothing to clean up. It used to read
   "behaviours 2 and 3"; behaviour 2 is the mark draw and this section no longer
   has one.

   1. Row reveal (`row`): each statement translates y 16px to 0 and fades in as
      it enters. JUSTIFICATION: it reveals the four statements in the reading
      order the staircase already draws, so the sequence the geometry implies is
      the sequence the eye receives.
   2. Header stagger (`headerGroup`): the headline and the lead share one parent
      and enter 60ms apart. JUSTIFICATION: they genuinely enter together, so a
      stagger there states which of the two is the section's title without
      moving either one.

   THERE USED TO BE A THIRD, the mark draw (`markMotion`), which scaled the 3px
   accent rule from `scaleX(0)` over 260ms and was the one animation in this
   section carrying meaning rather than polish. It went with the section's last
   mark; see the accent licence note above. The count in the first line of this
   block is two behaviours, not three, and both are still transform and opacity
   only, both `whileInView` with `once: true`, no timers, no scroll listeners,
   nothing to clean up.

   The rows deliberately do NOT carry an index delay. A row that enters alone,
   which is the normal case on a staircase this tall, would otherwise sit blank
   for up to 180ms after it is already on screen.

   `amount: 0.2` on the rows is chosen, not defaulted. The tallest row at 360px
   is roughly 300 to 340px against about 620px of visible viewport, so the
   threshold trips with room to spare. A threshold a short viewport can never
   satisfy, combined with `once: true` and an opacity of 0, is how a section
   ships permanently invisible with no animation queued to rescue it. That is
   the failure class plan section 8 records against the hero, and it is the
   reason this number is small and written down.

   REDUCED MOTION: `MotionConfig reducedMotion="user"` in App.tsx suppresses
   transform animation but still plays opacity, so it is not sufficient on its
   own here. `useReducedMotion()` is read once below and collapses both
   behaviours to fully static: every motion prop is spread from a constant that
   becomes an empty object, so no element carries an `initial`, a variant label
   or a viewport observer at all. Nothing in this section animates at all under
   reduced motion, and nothing depends on an animation having run in order to be
   visible. (This paragraph used to end by describing `Mark` rendering a plain
   undrawn rule under reduced motion. That branch is gone with the component,
   and `reduce` is still read here because the two surviving behaviours need
   it.)

   LCP: this section sits below the fold under the hero, so the ancestor-chain
   opacity ban in plan section 6 does not reach it.
   -------------------------------------------------------------------------- */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const row = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const headerGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

/**
 * The `whileInView` props, spread rather than written per element, so that the
 * reduced-motion branch removes them ENTIRELY rather than leaving a variant
 * label pointing at nothing. Under reduced motion each of these resolves to an
 * empty object and the element renders as plain markup with no motion state at
 * all, which is the only version of "collapses to static" that cannot leave
 * content stuck at opacity 0.
 */
const groupMotion: MotionProps = {
    variants: headerGroup,
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.3 },
};

const rowMotion: MotionProps = {
    variants: row,
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.2 },
};

/** Children of a group: they take their state from the parent, not a viewport. */
const childMotion: MotionProps = { variants: row };

/* THE `Mark` COMPONENT AND ITS `markMotion` VARIANT WERE DELETED HERE, and the
   deletion is mechanical rather than a design decision of this file's making.
   Row 2's title was the section's last call site, and the founder's copy edit
   replaced that title ("A meetup you can put in your calendar") with one that
   makes no checkable claim ("A monthly place to meet the network"). With no
   call site the component is unreachable and eslint fails the build on it,
   which is exactly what happened to PartnersStrip's own `Mark` in 6990b9c when
   its single marked phrase was removed.

   DO NOT REINSTATE IT BY FINDING SOMETHING ELSE TO MARK. The obvious candidate
   is sitting right there in row 2's new body, "published openly on Luma and
   Meetup", which the events feed further down this page would check perfectly
   well. Marking it is still forbidden: REDESIGN-PLAN.md section 2 makes the
   licence a CAP AND NOT A QUOTA, this repo has now twice recorded that a
   section with zero marks passes, and relicensing a mark onto a different
   phrase to keep a count up is the precise defect section 4.2 exists to stop.

   If a future edit gives this section a genuinely checkable phrase that wants
   marking, copy the component back from `HowItWorks.tsx`, which still carries
   the same construction with its documentation intact. */

/* ---------------------------------------------------------------------------
   CONTENT. Every claim below is checked against PRODUCT.md "Evidence on Hand":
   one monthly in-person meetup in Austin (six-plus months of it), a venue
   partner, a partner running the speed-networking format, a member channel, a
   resource library, and one members-only call a month. The partners are named
   in that record and in the three partner surfaces (the home PartnersStrip,
   /partners, partnersData.ts); they are deliberately not named here. Do not
   re-import the names into this file to "restore" the provenance: the
   provenance is the PRODUCT.md pointer on the line above.

   THE FOUR STATEMENTS AND THE LEAD WERE REWRITTEN IN THE REPOSITIONING, and
   this comment used to say the opposite ("the SHIPPED strings, carried
   verbatim per plan section 5. Nothing here is new copy"). That is no longer
   true and the claim is retired rather than left standing. Every fact in them
   still traces to the Evidence on Hand list above; what changed is which fact
   leads and how much of the section is spent on the event.

   WHAT MOVED, so the next reader can see the shape of the edit:
   - The lead no longer opens on the meetup. It opens on the founder's own
     problem and closes on the meetup as the evidence that IFN is real. The
     order is the whole point: the schedule is proof of the community, not the
     product.
   - Row 2 lost "Not a conference circuit, and not a network of chapters in
     other cities." Both were true and both were denials, and the one fact
     inside them (Austin only, no chapters) is stated positively here and
     answered in full by the FAQ's `austin` entry, which is where a reader who
     actually needs it goes.
   - Row 3 lost its denial and its mark. See the licence note above.
   - Row 4 widened past immigration/banking/hiring to name fundraising and
     U.S. market entry, which the brief puts at the centre of the journey and
     which `resourcesData.ts` already carries paths for.

   The hero's relocated proof claim, "Six months of monthly meetups, in
   person", lands in this section per plan section 5, and it is still here: the
   lead's LAST sentence now reads "and it has met in Austin every month for
   more than six months". It moved from the first sentence to the last in this
   edit and was not duplicated. Integrator: confirm there is exactly one copy
   of the claim in this section rather than adding another.
   -------------------------------------------------------------------------- */

type Statement = {
    title: React.ReactNode;
    body: React.ReactNode;
    /** Grid placement above `md`. Below it, every row is full width. */
    place: string;
};

export function ValueProps() {
    const reduce = Boolean(useReducedMotion());

    const statements: Statement[] = [
        {
            place: 'md:col-start-1 md:col-span-7',
            title: 'Founders who have been through it before',
            body: 'You will meet founders who have opened a U.S. bank account, worked through a visa, incorporated here, or made a first hire across borders. The perspective comes from someone who has been through it, not from a search result.',
        },
        {
            place: 'md:col-start-3 md:col-span-8',
            title: 'A monthly place to meet the network',
            body: 'Once a month in downtown Austin, founders, operators, investors and advisors meet in the same room. Every date is published openly on Luma and Meetup, so you can see the history before you commit to anything.',
        },
        {
            place: 'md:col-start-2 md:col-span-7',
            title: 'Introductions from someone who knows you both',
            body: 'Introductions happen the ordinary way: you meet someone at a meetup, they know the investor, the attorney or the first engineer you need, and they say so. A warm introduction from a founder who has worked with you is worth more than a list.',
        },
        {
            place: 'md:col-start-4 md:col-span-8',
            title: 'Notes and templates you can use the same week',
            body: 'The resource library covers immigration paperwork, U.S. banking, first hires, raising here and getting a product into the U.S. market, written from the questions founders actually bring us. Membership adds a private member channel and a members-only call each month.',
        },
    ];

    return (
        // `id="mentorship"` is frozen by plan section 5 and sits on the <section>
        // itself, because index.css keys `scroll-margin-top` on `section[id]`.
        // Moving it to a wrapper silently breaks the nav anchor.
        <section className="bg-paper py-28 md:py-36" id="mentorship">
            <Container>
                <motion.div {...(reduce ? {} : groupMotion)}>
                    <motion.h2
                        {...(reduce ? {} : childMotion)}
                        className="max-w-[26ch] text-[clamp(1.875rem,4.2vw,3rem)] font-medium leading-[1.02] tracking-[-0.025em] text-ink"
                    >
                        Built for founders starting from{' '}
                        {/* Emphasis is a weight step inside one family, per plan
                            section 4.3. Never a second family, never italic, and
                            never colour: the accent is licensed to checkable
                            phrases and "zero" is not one. */}
                        <span className="font-extrabold">zero</span> in a new country
                    </motion.h2>

                    <motion.p
                        {...(reduce ? {} : childMotion)}
                        className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.6] text-muted"
                    >
                        Whether you moved here last year or are still planning the move, the same problems come up:
                        visas, U.S. banking, incorporating, hiring across borders, funding rules nobody explained to
                        you, and a professional network you are building from nothing. IFN is where founders work
                        through them together, and it has met in Austin every month for more than six months.
                    </motion.p>
                </motion.div>

                {/* A real list, so a screen reader announces "list, 4 items" before
                    the first statement. Tailwind Preflight already strips the
                    marker, and `role="list"` is restated because that same
                    `list-style: none` is what drops list semantics in VoiceOver. */}
                <ul
                    role="list"
                    className="mt-20 grid grid-cols-1 gap-x-6 gap-y-16 md:mt-28 md:grid-cols-12 md:gap-y-24"
                >
                    {statements.map((statement) => (
                        <motion.li
                            key={statement.place}
                            {...(reduce ? {} : rowMotion)}
                            className={statement.place}
                        >
                            <h3 className="text-[clamp(1.375rem,3.2vw,2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">
                                {statement.title}
                            </h3>
                            <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.6] text-ink">
                                {statement.body}
                            </p>
                        </motion.li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}
