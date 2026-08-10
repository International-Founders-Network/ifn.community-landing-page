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
   on this page. Two of the four rows below qualify and two do not, so two
   marks ship, not four.

   MARKED
   - Row 2, "put in your calendar". The artifact is the dated meetup feed in
     EventsPreview (`#events`) further down this same page. A reader can scroll
     to it and check.
   - Row 3, "There is no matching system here". A denial of something IFN does
     not offer, which plan section 2 names as the most checkable sentence there
     is.

   NOT MARKED
   - Row 1 asserts who is in the room. True, and nothing on this page is a
     named artifact a reader can check it against.
   - Row 4's artifact would be ResourcesPreview's topic panels, which are owned
     by another section and whose final topics this component cannot inspect.
     Marking a claim against an artifact you have not read is the same move the
     plan disqualified the Marked Copy ledger for, one step smaller. It stays
     unmarked, and leaving it unmarked also keeps the seam with HowItWorks
     clean: no viewport containing the end of this section can hold a third
     mark.

   Plan section 2 says "ValueProps carries four marks" while plan section 5
   says "exactly one clause in each is marked, and only the checkable one" and
   then names exactly two. That is an inconsistency inside the plan. It is
   resolved here in favour of the licence, which is the rule the other sentence
   was counting against. Do not "restore" the missing two.

   DENSITY: two marks in a section taller than one viewport, against the rule
   of no more than two marks plus the wordmark period per viewport. Rows 2 and
   3 are adjacent, so a tall desktop viewport can hold both. That is at the
   limit and inside it.

   WHY THE 3px RULE IS THE MECHANISM AND THE HUE IS NOT. Computed with the WCAG
   relative luminance formula, `--accent` against the surrounding `--ink` body
   text measures 2.547 light and 3.256 dark, and against `--muted` it measures
   1.069 and 1.359. So hue alone cannot be trusted to make a mark perceivable,
   which is exactly the finding behind the plan's underline-every-link rule.
   The 3px accent rule is what carries it: 7.054 against `--paper` in light and
   5.517 in dark, both clear of the 3.0 non-text floor. Two consequences that
   are followed below: no mark is ever placed inside a `--muted` paragraph, and
   no meaning anywhere in this section is carried by the mark at all. Strip the
   colour and the rule and every sentence still reads exactly the same.

   That 3px rule is the plan's licensed mark rule, not a structural hairline.
   The full-opacity-1px hairline rule in plan section 4.2 governs plate borders
   and table rules, of which this section has none.
   -------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   MOTION. Plan section 6, behaviours 2 and 3. Two behaviours, both transform
   and opacity only, both `whileInView` with `once: true`, no timers, no scroll
   listeners, no loops, nothing to clean up.

   1. Row reveal (`row`): each statement translates y 16px to 0 and fades in as
      it enters. JUSTIFICATION: it reveals the four statements in the reading
      order the staircase already draws, so the sequence the geometry implies is
      the sequence the eye receives.
   2. Mark draw (`markMotion`): the 3px accent rule scales `scaleX(0)` to
      `scaleX(1)` from the left over 260ms, 120ms after it enters.
      JUSTIFICATION: it enacts the page's one idea, a hand marking the checkable
      part of a sentence in reading order, which is meaning rather than polish.
   3. Header stagger (`headerGroup`): the headline and the lead share one parent
      and enter 60ms apart. JUSTIFICATION: they genuinely enter together, so a
      stagger there states which of the two is the section's title without
      moving either one.

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
   or a viewport observer at all, and `Mark` renders a plain span whose rule is
   simply drawn rather than animated. Nothing in this
   section animates at all under reduced motion, and nothing depends on an
   animation having run in order to be visible.

   LCP: this section sits below the fold under the hero, so the ancestor-chain
   opacity ban in plan section 6 does not reach it.
   -------------------------------------------------------------------------- */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const row = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * The mark draw carries its OWN viewport trigger rather than inheriting the
 * row's, and that is a deliberate belt-and-braces choice rather than an
 * oversight. Variant propagation would reach it (the `motion.span` sits under
 * the row's `motion.li` in the same context tree), but if it ever failed to,
 * the rule would stay at `scaleX(0)` and the mark would simply not exist:
 * `--accent` against the surrounding `--ink` measures 2.547 in light, so the
 * hue cannot carry a mark on its own and the rule is the whole mechanism. A
 * silent failure here deletes a mark rather than degrading it, so it gets an
 * observer of its own, which cannot fail quietly.
 */
const markMotion: MotionProps = {
    initial: { scaleX: 0 },
    whileInView: { scaleX: 1 },
    viewport: { once: true, amount: 0.5 },
    transition: { duration: 0.26, delay: 0.12, ease: EASE },
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

type MarkProps = {
    children: React.ReactNode;
    /** Passed down rather than re-read per instance so one media query decides. */
    reduce: boolean;
};

/**
 * One marked phrase: accent type plus a 3px accent rule drawn under it.
 *
 * `inline-block` so the rule can be positioned against the phrase's own box.
 * If the phrase does not fit on the remaining line it moves to the next line
 * whole, which reads as a deliberate break rather than as a half-underlined
 * fragment. `pb-[0.18em]` is descender reserve: "put in your calendar" carries
 * a `p` and a `y`, and a rule at the text baseline would cut through both.
 *
 * `leading-[1.15]` is not cosmetic either. An inline-block inherits the line
 * height of whatever it sits in, and the body paragraphs run 1.6, which would
 * make the phrase's own box roughly 8px taller than its glyphs and float the
 * rule away from the words it marks. 1.15 hugs the phrase in both contexts, is
 * the minimum the plan sets for any slot that has to clear a descender, and it
 * changes nothing about the surrounding paragraph's rhythm because an
 * inline-block aligns on its baseline.
 */
function Mark({ children, reduce }: MarkProps) {
    return (
        <span className="relative inline-block pb-[0.18em] leading-[1.15] text-accent">
            {children}
            {reduce ? (
                <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 block h-[3px] w-full bg-accent"
                />
            ) : (
                <motion.span
                    aria-hidden="true"
                    {...markMotion}
                    className="absolute bottom-0 left-0 block h-[3px] w-full origin-left bg-accent"
                />
            )}
        </span>
    );
}

/* ---------------------------------------------------------------------------
   CONTENT. Every claim below is checked against PRODUCT.md "Evidence on Hand":
   one monthly in-person meetup in Austin (six-plus months of it), Station
   Austin as venue, Reuneo running the speed-networking format, a member
   channel, a resource library, and one members-only call a month.

   The four statements and their bodies are the SHIPPED strings, carried
   verbatim per plan section 5. Nothing here is new copy. The only edits in
   this file are structural: the mark wraps an existing phrase, it does not
   replace one.

   The hero's relocated proof claim, "Six months of monthly meetups, in
   person", lands in this section per plan section 5, and it is already here:
   the preserved lead's first sentence reads "IFN meets in person in Austin
   every month, and has done so for more than six months." No new string was
   invented to receive it. Integrator: confirm this once Hero lands rather than
   adding a second copy of the claim.
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
            title: 'Founders who solved it before you',
            body: 'You will meet founders who have opened a U.S. bank account, worked through a visa, or made a first hire here. The answer comes from someone who has done it, not from a search result.',
        },
        {
            place: 'md:col-start-3 md:col-span-8',
            title: (
                <>
                    A meetup you can <Mark reduce={reduce}>put in your calendar</Mark>
                </>
            ),
            body: 'One a month, in person, at Station Austin. Not a conference circuit, and not a network of chapters in other cities. Every date is published openly on Luma and Meetup, so you can see the history before you commit to anything.',
        },
        {
            place: 'md:col-start-2 md:col-span-7',
            title: 'Introductions that come from meeting people',
            body: (
                <>
                    <Mark reduce={reduce}>There is no matching system here</Mark>. Introductions happen the ordinary
                    way: you meet someone at a meetup, they know the person you need, and they say so.
                </>
            ),
        },
        {
            place: 'md:col-start-4 md:col-span-8',
            title: 'Notes and templates you can use the same week',
            body: 'The resource library covers immigration paperwork, U.S. banking, and first hires (written from the questions founders actually bring to the meetups). Membership adds a private member channel and a members-only call each month.',
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
                        IFN meets in person in Austin every month, and has done so for more than six months. Whether you
                        moved here last year or are still planning the move, the same problems come up: visas, U.S.
                        banking, funding rules nobody explained to you, and a professional network that does not exist
                        yet.
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
