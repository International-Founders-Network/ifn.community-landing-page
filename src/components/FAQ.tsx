import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { cn } from '../lib/cn';
import { MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

const MEETUP_URL = 'https://www.meetup.com/international-founders-network-austin/';

/**
 * Shared inline-link styling.
 *
 * Colour: `--ink`, not `--accent`. Phase 1 left this open and named the owner:
 * "whoever sets this section's mark budget in Phase 3 owns the accent-link
 * question". That is this commit, and the answer is no, on two independent
 * grounds. First, REDESIGN-PLAN.md section 2 licenses the accent to three roles
 * and the mark is the only one in play here; an inline link is not a checkable
 * claim, so painting it accent would spend the section's mark budget on the one
 * thing in an answer that is not a fact about IFN. Second, the plan's own
 * failing row settles it independently: `--accent` against surrounding `--ink`
 * body text measures 2.547 in light mode against WCAG technique G183's 3.0
 * floor, so colour could never have been the affordance even if the licence
 * allowed it. Ink on `--band` measures 16.281 light and 16.318 dark.
 *
 * The underline is therefore the sole affordance and has to clear the 3:1
 * non-text floor on its own. `--rule` measures 3.682 light and 3.638 dark on
 * `--band` at rest and promotes to `--ink` at 16.281 and 16.318 on hover.
 *
 * THIS SECTION NO LONGER HAS MARKS AT ALL, so the paragraph that used to sit
 * here is retired rather than corrected. It read that the two marked phrases
 * carried a 3px `--accent` rule and that no marked answer contained a link, so
 * a 1px `--rule` underline and a 3px `--accent` mark were never asked to be
 * told apart inside one paragraph. With zero marks that is now trivially and
 * permanently true, and the underline below is the only line-like device in
 * this section. See the deletion note further down.
 *
 * Focus ring: the plan's two-layer construction, 2px `--paper` inner plus 2px
 * `--ink` outer, identical on every ground and in both modes. Tailwind's
 * `ring-offset-2 ring-offset-paper` plus `ring-2 ring-ink` compiles to exactly
 * `0 0 0 2px var(--paper), 0 0 0 4px var(--ink)`, which is that construction
 * verbatim. Section 4.2's "no ring-offset" targets the SHIPPED pattern, an
 * offset with no colour named alongside it, which defaulted to white and
 * therefore assumed a known ground. Pinning the offset colour to `--paper`
 * removes the assumption. Not a violation, do not "fix" it by grep.
 *
 * On this section's `--band` ground the inner `--paper` layer measures 1.103
 * light and 1.101 dark, so the ring is carried entirely by its outer `--ink`
 * layer at 16.281 and 16.318. That is the plan's "better of the two layers"
 * argument arriving at a real ground, and it is why the ring must never be
 * reversed: reversing it would put the 1.10 layer on the outside.
 *
 * `outline-hidden` rather than the bare outline reset it replaces: only
 * `outline-hidden` keeps `outline: 2px solid transparent` under
 * `forced-colors: active`, and a forced colours UA drops box-shadow, which is
 * what a ring compiles to. Under the bare reset these links and the disclosure
 * trigger below had no focus indicator at all in Windows High Contrast Mode.
 */
const linkStyles =
    'font-medium text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

/* THE `Mark` COMPONENT WAS DELETED HERE, with the 30 lines documenting its
   32-character wrap cap and its `useInView`-on-the-phrase correctness
   argument. The founder's highlight audit fixed the page's complete list of
   marked phrases at five, all in `Hero` and `ValueProps`, and this section's
   two are not among them.

   BOTH SENTENCES SURVIVE WORD FOR WORD. "Not as a professional service" and
   "the in-person part of IFN is Austin only" are still the opening clauses of
   their answers, still in the "What IFN does not do" cluster, still the first
   thing a reader meets on opening either one. Only the accent underline is
   gone. That matters more here than anywhere else on the page, because the
   first of those two is the sentence keeping this site's promise not to
   overpromise immigration, legal or financial guidance, and a highlight audit
   is not allowed to weaken it. It has not: an underline was removed, a denial
   was not.

   ONE INVARIANT THIS DELETION RETIRES, recorded because the note on
   `linkStyles` above still refers to it. The page used to have to guarantee
   that no marked answer contained a link, so that a 1px `--rule` underline and
   a 3px `--accent` mark were never asked to be told apart inside one
   paragraph. With no marks in this section that constraint is now
   unconditionally satisfied, and a future edit adding a link to either answer
   can no longer break it. If a mark ever returns here, the constraint returns
   with it. */

interface FaqEntry {
    id: string;
    question: string;
    answer: ReactNode;
    /** Open on load. Kept to two so the section still reads as a list. */
    defaultOpen?: boolean;
}

interface FaqCluster {
    id: string;
    /**
     * The cluster's name. Deliberately NOT an eyebrow: sentence case, 15px,
     * `--muted`, no letter-case transform and no letter-spacing utility. Skill
     * 4.7's eyebrow budget is enforced by a mechanical grep for the small
     * wide-set caps label signature above a section headline, and these three
     * add nothing to that count in either the markup or the prose of this file.
     * Skill 4.9 names "cluster heading" as the sanctioned alternative to a
     * hairline under every row, which is exactly what they are.
     */
    label: string;
    entries: FaqEntry[];
}

/**
 * Every answer here has to survive a member asking "is that actually true?".
 * What is claimed: a monthly in-person Austin meetup with six-plus months of
 * history, a venue partner and a format partner (neither named on this
 * surface, see below), listings on Luma and Meetup, free attendance, and a paid
 * membership at the one published price. Nothing else. See PRODUCT.md,
 * "Evidence on Hand".
 *
 * **THE TWO PARTNER NAMES ARE DELIBERATELY ABSENT, DO NOT PUT THEM BACK.** The
 * founder capped the named partner footprint: the venue partner's name and the
 * format partner's name may appear only on the home `PartnersStrip` section, on
 * `/partners`, and in `src/data/partnersData.ts`, which is where to read them.
 * Everywhere else, including this file, they are generic descriptors. Two
 * answers here used to carry them and now read "our venue partner" and "our
 * format partner", which are the exact approved phrases. This comment does not
 * spell the names either, on purpose: the cap is verified by grepping the tree
 * for them, and a guard that prints what it is guarding against would show up
 * as the very hit it exists to prevent, in the one file most likely to be
 * checked first. There is one protected exception in the tree and it is not in
 * this file: `src/data/events.json` sets `location_name` to the street address
 * of the venue and `EventsPreview` prints it, because an event listing that
 * will not name its venue is broken. That is why the `where` answer can point a
 * reader at the listings instead of naming the building itself: the address is
 * one hop away, on the page and in the feed, as a fact rather than as a partner
 * credit.
 *
 * **THE SECOND MEMBERSHIP PRICE IS DELIBERATELY ABSENT TOO, AND THAT IS THE
 * EASIER ONE TO "FIX" BACK IN.** Only `MEMBERSHIP_PRICE_STANDARD` is published,
 * here and on every other public surface. A second, lower annual price exists;
 * the founder sends it by email to roughly forty selected people and it is not
 * public. It is not an export, not a tier and not rendered anywhere, so there
 * is no constant in this file to reach for. The `fee` answer below used to
 * print both figures side by side and now prints one. If a future reader finds
 * `/membership` and this section disagreeing, the resolution is never to add
 * the lower figure here: it is that the lower figure does not belong on a page.
 * The answer must also not hint that a cheaper price exists, so no "starting
 * at", no "from", no "ask us about a discount".
 *
 * **What else changed, and what did not.** Grouping and order were set in an
 * earlier phase: the eight entries are three clusters. Nothing outside this
 * file reads that order, checked rather than assumed: `id` is consumed only as
 * a React key, there is no FAQ JSON-LD anywhere in the tree, and the section
 * anchor `#faq` sits on the `<section>` and does not move.
 *
 * The repositioning pass edited prose inside three answers (`meetup`, `visas`,
 * `austin`). No question text moved, no entry was added, removed or reordered,
 * and no cluster was renamed.
 *
 * The highlight audit that followed removed both `<Mark>` wrappers and the
 * component with them. NO SENTENCE CHANGED IN THAT PASS: "Not as a professional
 * service" and "the in-person part of IFN is Austin only" are byte for byte
 * what they were, and only the accent underline around the first few words of
 * each is gone. The 32-character wrap cap those two phrases were measured
 * against retires with the component that computed it.
 *
 * **WHY THIS CLUSTER SURVIVED A BRIEF THAT ASKED FOR ITS OPPOSITE.** The
 * repositioning asks for confident "what founders get" phrasing in place of
 * "what we are not", and it was applied that way in ValueProps and HowItWorks,
 * where the denials were about product shape and cost nothing to invert. It is
 * NOT applied here and the exception is in the same brief: it also says not to
 * overpromise legal, immigration or financial guidance. "Not as a professional
 * service" is the sentence that keeps that promise. Inverting it into something
 * warmer is the one edit on this page that could do real harm to a reader
 * making a visa decision, so the cluster, its name, and both denials stay.
 *
 * A DRAFT OF THE `austin` ANSWER WENT FURTHER THAN THAT AND WAS PULLED BACK.
 * It closed on "plenty of members are not in Austin" and "introductions travel
 * further than the room does", and it dropped the admission that the in-person
 * evenings are the strongest part of IFN. Both additions are claims about reach
 * and about membership geography that nothing in PRODUCT.md's Evidence on Hand
 * supports, and they sat two clauses after a marked denial in the one cluster
 * whose entire job is to be checkable. The admission is restored and the
 * unevidenced half is gone. The rule this cluster runs on is the one at the top
 * of this comment: every sentence has to survive a member asking "is that
 * actually true?", and a sentence that merely sounds generous does not qualify.
 *
 * **The three cluster names and the deck.** The deck below promises "what IFN
 * is, what it costs, and what it does not do", and the clusters answer it in
 * that order. The third name is a deliberate verbatim echo of the deck's last
 * clause, because that is the promise the section exists to keep. The second is
 * deliberately NOT an echo ("Attending, and membership" rather than a second
 * printing of "what it costs"), so the page does not say the same three words
 * twice inside 200px.
 */
const CLUSTERS: FaqCluster[] = [
    {
        id: 'room',
        label: 'Who comes, and what happens',
        entries: [
            {
                id: 'who',
                question: 'Do I have to be a founder already?',
                answer: (
                    <>
                        No. People come with a registered company, with an idea and nothing else, and with a
                        full-time job they have not left yet. International students building a first venture
                        come as well. If you are building something in the United States and you are from
                        somewhere else, you are in the right room.
                    </>
                ),
                defaultOpen: true,
            },
            {
                id: 'meetup',
                question: 'What happens at a meetup?',
                answer: (
                    <>
                        The center of the evening is structured one-to-one networking run with our format
                        partner: you are paired with one person at a time for a short conversation, then
                        paired again, so you never have to walk up to a circle of strangers. Around that
                        there is open conversation with founders who have already worked through whatever
                        you are on now, whether that is a visa, a bank account, a first hire or a first
                        raise.
                    </>
                ),
                defaultOpen: true,
            },
            {
                id: 'different',
                question: 'What makes IFN different from other founder meetups?',
                answer: (
                    <>
                        Two things, and you can check both. It has run every month for more than six months:
                        the past meetups are listed publicly on Meetup and Luma. And everyone in the room is
                        building in the United States from somewhere else, so the conversation starts at work
                        authorization, opening a bank account and hiring across borders instead of arriving
                        there at the end of the night.
                    </>
                ),
            },
            {
                id: 'accelerator',
                question: 'Is this an accelerator or a program?',
                answer: (
                    <>
                        No. There is no application, no cohort and no selection: anyone building a company
                        in Austin can come to a meetup, and IFN does not take equity. Accelerators do a
                        different job and the good ones do it well. This is the layer underneath, for the
                        months when you are working out a visa, a bank account and a first hire and do not
                        need a program to do it.
                    </>
                ),
            },
        ],
    },
    {
        id: 'attending',
        label: 'Attending, and membership',
        entries: [
            {
                id: 'where',
                question: 'Where is it held, and how do I register?',
                answer: (
                    <>
                        Our venue partner hosts us in Austin. Each meetup is published with its
                        date, start time and address on{' '}
                        <a href={LUMA_CALENDAR_URL} target="_blank" rel="noopener noreferrer" className={linkStyles}>
                            Luma<span className="sr-only"> (opens in a new tab)</span>
                        </a>{' '}
                        and on{' '}
                        <a href={MEETUP_URL} target="_blank" rel="noopener noreferrer" className={linkStyles}>
                            Meetup<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        . Registering on either one is all that is needed.
                    </>
                ),
            },
            {
                id: 'time',
                question: 'How much time does this take?',
                answer: (
                    <>
                        One evening a month if you only come to the meetup. Members can add the monthly
                        office-hours call. Nothing else is required, and nobody is counting your attendance.
                    </>
                ),
            },
            {
                id: 'fee',
                question: 'Is there a membership fee?',
                answer: (
                    <>
                        The meetups are free to attend. You never need to be a member to walk in. Membership is
                        a separate, optional layer:{' '}
                        <strong className="font-semibold tabular-nums">{MEMBERSHIP_PRICE_STANDARD} a year</strong>. It
                        adds the private member channel on Slack/Discord, the resource library, and monthly
                        members-only office hours.{' '}
                        <Link to="/membership" className={linkStyles}>
                            See what membership includes
                        </Link>
                        .
                    </>
                ),
            },
        ],
    },
    {
        /**
         * The section's emotional centre, and the only cluster that carries the
         * accent. Both of its answers are denials, both denials are checkable,
         * and each carries exactly one mark. See the budget note on `FAQ` below.
         */
        id: 'limits',
        label: 'What IFN does not do',
        entries: [
            {
                id: 'visas',
                question: 'Can IFN help with visas, U.S. banking, or incorporating?',
                answer: (
                    <>
                        Not as a professional service. Nobody at IFN is an immigration lawyer, an
                        accountant or a banker, and nothing we publish is legal or financial advice. What you
                        get is the next best thing: people in the room who have already been through the same
                        visa process, opened the same accounts and registered the same kind of company, telling
                        you plainly what happened to them, and an introduction to the attorney or accountant
                        they used. Members also get a resource library of notes and templates on immigration,
                        U.S. banking, hiring and raising here, written out of those conversations.
                    </>
                ),
            },
            {
                id: 'austin',
                question: 'I am not in Austin. Is IFN useful to me?',
                answer: (
                    <>
                        We would rather say this plainly: the in-person part of IFN is Austin
                        only. There are no other chapters, and we are not opening any right
                        now. Everything else works from anywhere: the member channel, the resource library and
                        the monthly office-hours call are all remote. The in-person evenings are the strongest
                        part of IFN, and they happen here.
                    </>
                ),
            },
        ],
    },
];

/**
 * FAQ. REDESIGN-PLAN.md section 5, row 8: an interactive disclosure register on
 * the `--band` ground, open answers indenting into a 7-of-12 column so an open
 * panel differs in STRUCTURE and not only in height. Phase 1 built the shell.
 * This is the composition.
 *
 * LAYOUT FAMILY: clustered disclosure register. Nothing else on the page is an
 * accordion, and nothing else on the page groups its rows under named labels
 * with a single rule per group, so the family is distinct from the other eight
 * per skill 4.7.
 *
 * **Three deviations from the plan's printed geometry, each named rather than
 * quietly taken, because the plan is otherwise binding.**
 *
 * 1. Section 5 prints this section as "full-width rows ON HAIRLINES". It is now
 *    full-width rows in three clusters with ONE hairline per cluster and none
 *    between rows. Authority: skill 9.F bans `border-t` plus `border-b` on every
 *    row of a long list, and skill 4.9 calls a ten-row list with a hairline
 *    under every row "the WORST default" and names grouping into clusters with
 *    one divider each as the fix. Three rules for eight rows instead of nine.
 * 2. Section 4.4 specifies the hover affordance as the row's 1px `--rule`
 *    hairline PROMOTING to a 2px `--edge`. With no resting hairline left to
 *    promote, it degrades to reveal-on-hover: nothing at rest, 2px `--edge` at
 *    the row's top edge on hover. Same token, same measurement (4.495 light,
 *    4.363 dark on `--band`), same reason for not swapping the ground (a
 *    `--band` hover ground on a `--band` section measures 1.000 against itself).
 * 3. The eight entries are reordered into topical clusters. Nothing outside this
 *    file reads that order.
 *
 * **What is preserved byte for byte**, per section 8's named-affordance list
 * item 7 and section 5's FAQ note: `hidden="until-found"` set imperatively
 * because React 19 coerces the prop to a boolean, the `beforematch` listener
 * that syncs state when Chrome reveals a panel via find-in-page, the re-hide in
 * `onAnimationComplete`, the `<h3>`-WRAPPED TRIGGER AT THAT EXACT LEVEL,
 * `aria-expanded`, `aria-controls`, `role="region"` with `aria-labelledby`, ids
 * from `useId`, the two entries open by default, and `outline-hidden` rather
 * than `outline-none`. The cluster label is therefore a `<p>` inside a
 * `role="group"` with `aria-labelledby` and NOT an `<h3>`, which would have
 * pushed the triggers to `<h4>`. Grouping is added semantics; it does not get to
 * move a heading level the plan names.
 *
 * **Mark budget: zero, and this section is the reason that sentence needs
 * explaining.** It used to be two, one per denial answer, stated in those terms
 * because the READER, not the layout, decided how many marks were on screen
 * here, which was true of no other section: both marked answers were the only
 * two entries in the "What IFN does not do" cluster, so the only way to get two
 * marks into one viewport was to deliberately open both adjacent denials.
 *
 * The founder's highlight audit set the page's complete list of marked phrases
 * and neither of this section's two is on it, so the budget is now zero and the
 * reader-controlled density question disappears with it. That is compliant
 * rather than a gap, on the rule this repo has now applied four times over:
 * REDESIGN-PLAN.md section 2 makes the licence a cap and not a quota.
 *
 * Do not restore a mark here to "balance" the page. One candidate was already
 * considered and cut on density grounds when the budget was two: `different`
 * opens "Two things, and you can check both", which is the most explicitly
 * checkable sentence in the section. It stays unmarked, and now so does
 * everything else.
 *
 * No eyebrow. The plan's budget is 2 of 3 and both are spent on Hero and
 * PartnersStrip. No section numbers, no decorative dots, no icons on the rows.
 */
export function FAQ() {
    const reduce = useReducedMotion();

    return (
        <section className="bg-band py-28 md:py-36" id="faq">
            <Container size="md">
                {/* Header is left aligned, stacked headline over deck, because the
                    rows beneath it are a left-aligned full-width register and a
                    centred header would not share an edge with anything. Stacked
                    rather than split, per the skill's split-header ban.

                    A plain div, not a `<header>`. HTML-AAM maps `<header>` to the
                    `banner` landmark unless it descends from article, aside, main,
                    nav or section. This one does descend from a section, so it
                    should map to generic, but the page already has exactly one
                    banner and a second one would be an accessibility regression if
                    any AT got that ancestry check wrong. There is nothing to gain
                    by taking the bet.

                    Motion: the plan's behaviour 3, `y` 16px plus opacity, once.
                    Justification, one sentence: it establishes that the header is
                    read before the register under it. Not an LCP concern, this is
                    section 8 of 9 and is lazily imported besides. */}
                <motion.div
                    className="max-w-[65ch]"
                    initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
                        Questions founders ask us
                    </h2>
                    <p className="mt-5 text-[1.0625rem] leading-[1.6] text-muted">
                        Direct answers about what IFN is, what it costs (nothing for the meetups,{' '}
                        {MEMBERSHIP_PRICE_STANDARD} a year for optional membership), and what it does
                        not do.
                    </p>
                </motion.div>

                <div className="mt-16 space-y-14">
                    {CLUSTERS.map((cluster) => (
                        <FAQClusterGroup key={cluster.id} cluster={cluster} />
                    ))}
                </div>

                <p className="mt-14 max-w-[65ch] text-[1.0625rem] leading-[1.6] text-muted">
                    Something else on your mind?{' '}
                    <Link to="/contact" className={linkStyles}>
                        Write to us
                    </Link>
                    . A founder reads it, not a support desk.
                </p>
            </Container>
        </section>
    );
}

/**
 * One cluster: a single 1px `--rule` hairline, a label, and its rows.
 *
 * The hairline is the cluster's TOP border and it is the only rule the cluster
 * draws. Full opacity 1px, never an alpha or an `opacity` utility: plan section
 * 4.2 measured `--rule` at 75% antialiased pixel coverage down to 2.665 light
 * and 2.764 dark, both under the 3.0 floor, and no grey in this palette is
 * generous enough to survive partial coverage. At full opacity it measures 3.682
 * light and 3.638 dark on `--band`.
 *
 * `pt-10` under the rule and `mt-6` under the label put roughly 88px between the
 * cluster hairline and the first row's top edge, which matters because the first
 * row's hover rule is also drawn at ITS top edge. Two horizontal lines 88px
 * apart cannot be mistaken for one line thickening.
 *
 * `role="group"` with `aria-labelledby` is the same idiom section 8 items 9 and
 * 14 already require of the resources filter set and the snap rail, so a screen
 * reader gets the same grouping a sighted reader gets from the label and the
 * rule. This is added, not preserved: the shipped section had one flat list.
 *
 * Motion: behaviour 3 again, label then rows on a 60ms stagger, `once`,
 * `amount: 0.25`. Justification, one sentence: the stagger reveals the cluster
 * in reading order, label before questions, which is the order the grouping
 * asks to be read in. The stagger index is per cluster rather than per section
 * because clusters are 300 to 640px tall and enter the viewport separately, so a
 * section-wide index would only add dead delay to whichever one you scrolled to.
 *
 * No `overflow-hidden` anywhere on this subtree. The trigger's focus ring is
 * drawn outside its border box and any clipping ancestor would eat it.
 */
function FAQClusterGroup({ cluster }: { cluster: FaqCluster }) {
    const reduce = useReducedMotion();
    const uid = useId();
    const labelId = `faq-cluster-${uid}`;

    const reveal = (index: number) => ({
        initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 } as const,
        transition: reduce
            ? { duration: 0 }
            : { duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    });

    return (
        <div role="group" aria-labelledby={labelId} className="border-t border-rule pt-10">
            <motion.p
                id={labelId}
                className="text-[0.9375rem] font-semibold leading-[1.4] text-muted"
                {...reveal(0)}
            >
                {cluster.label}
            </motion.p>

            <div className="mt-6">
                {cluster.entries.map((faq, index) => (
                    <motion.div key={faq.id} {...reveal(index + 1)}>
                        <FAQItem
                            question={faq.question}
                            answer={faq.answer}
                            defaultOpen={faq.defaultOpen}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function FAQItem({
    question,
    answer,
    defaultOpen = false,
}: {
    question: string;
    answer: ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const panelRef = useRef<HTMLDivElement>(null);
    const uid = useId();
    const triggerId = `faq-trigger-${uid}`;
    const panelId = `faq-panel-${uid}`;

    // Collapsed answers stay in the document. `hidden="until-found"` keeps them
    // out of the tab order and off the accessibility tree while leaving the text
    // findable by the browser's find-in-page and readable by crawlers. The plain
    // `hidden` attribute and unmounting both lose that. It has to be set
    // imperatively because React 19 coerces the `hidden` prop to a boolean, which
    // would throw the "until-found" value away.
    useEffect(() => {
        const panel = panelRef.current;
        if (panel && !defaultOpen) panel.setAttribute('hidden', 'until-found');
    }, [defaultOpen]);

    // Chrome reveals an `until-found` subtree itself when find-in-page matches
    // inside it, then fires `beforematch`. Sync our state so the trigger's
    // aria-expanded and its icon agree with what the user is now looking at.
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const reveal = () => setIsOpen(true);
        panel.addEventListener('beforematch', reveal);
        return () => panel.removeEventListener('beforematch', reveal);
    }, []);

    const toggle = () => {
        // Unhide before the height animation reads the panel: a `display: none`
        // element measures as zero and the open animation would go nowhere.
        if (!isOpen) panelRef.current?.removeAttribute('hidden');
        setIsOpen(!isOpen);
    };

    return (
        // No `overflow-hidden` on this wrapper and no card. The trigger's focus
        // ring is drawn OUTSIDE its border box and any clipping ancestor would
        // eat it.
        <div>
            <h3>
                <button
                    type="button"
                    id={triggerId}
                    onClick={toggle}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group relative flex w-full items-start justify-between gap-8 py-6 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                    {/* The hover affordance, and the reason it is a positioned
                        element rather than a border.

                        Plan 4.4: a full-width interactive row never takes a ground
                        swap on hover. This row sits on `--band`, so a `--band`
                        hover ground measures 1.000 against its own section. The
                        mechanism is a 2px `--edge` rule at the row's top edge,
                        measuring 4.495 light and 4.363 dark against `--band`.

                        It is REVEALED rather than promoted, which is deviation 2
                        in the note on `FAQ`: clustering took away the resting 1px
                        hairline this was specified to grow out of. Same token,
                        same measurement, one fewer line at rest.

                        A real `border-t` growing from 0 to 2px would shift every
                        row below it by two pixels on hover. Absolutely positioned,
                        the height change costs no layout. Nothing transitions:
                        the height snaps, because nothing in the plan sanctions
                        animating geometry on a control state.

                        Full opacity at both heights. Plan 4.2 measured `--rule` at
                        75% pixel coverage down to 2.665, so no hairline on this
                        page is ever expressed with `opacity` or an alpha colour. */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-0 bg-edge group-hover:h-0.5"
                    />
                    <span className="text-[1.25rem] font-medium leading-[1.3] text-ink lg:text-[1.375rem]">
                        {question}
                    </span>
                    {/* One glyph that rotates, not two glyphs that swap.
                        Justification, one sentence: rotating the same mark through
                        45 degrees shows the control changing state, where swapping
                        plus for minus shows one control being replaced by another.
                        `lucide-react`'s Plus is a symmetric cross, so 45 degrees
                        lands exactly on a close mark with no second import.

                        Reduced motion needs no hook here: this is a CSS transition
                        and `src/index.css` flattens every transition on the page to
                        0.01ms under `prefers-reduced-motion: reduce`, so it becomes
                        an instant state change. `--ink` on `--band` measures 16.281
                        light and 16.318 dark, well over the 3.0 non-text floor.
                        `aria-hidden`, because `aria-expanded` on the button is
                        already the accessible name for this state. */}
                    <span
                        aria-hidden="true"
                        className={cn(
                            'mt-0.5 shrink-0 text-ink transition-transform duration-200',
                            isOpen && 'rotate-45',
                        )}
                    >
                        <Plus size={24} strokeWidth={1.5} />
                    </span>
                </button>
            </h3>

            {/* This element must never carry a `display` utility. In Chrome
                `hidden="until-found"` hides via `content-visibility: hidden`, but
                every other engine falls back to the UA sheet's
                `[hidden] { display: none }`, and an author `display` declaration
                beats it on origin. A `grid` class here would render every
                collapsed panel open outside Chrome while looking correct in it.
                The grid lives one level down. `overflow-hidden` declares no
                display and is required by the height animation. */}
            <motion.div
                ref={panelRef}
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="overflow-hidden"
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onAnimationComplete={() => {
                    if (!isOpen) panelRef.current?.setAttribute('hidden', 'until-found');
                }}
            >
                {/* The 7-of-12 indent. Columns 6 through 12, so the open answer
                    shares its right edge with the trigger's icon and steps in from
                    the question above it: an open panel differs in structure, not
                    only in height. It is also what carries the section's geometry
                    now that the per-row hairlines are gone, so it is not optional
                    decoration.

                    Mobile and tablet collapse, declared here per the plan's
                    per-component rule: below `lg` the answer runs full width with
                    no indent, and it is the only multi-column construction in this
                    section. Measured rather than guessed, at the 0.529em body
                    advance printed in plan section 5. Inside `Container size="md"`
                    a 7-of-12 column is 410px at 768px wide, which is 45.6
                    characters and too narrow for five-sentence answers. At 1024px
                    and above it is 550px, or 61.2 characters. So the indent starts
                    at `lg`, where it fits, and the 65ch cap below governs the
                    full-width case (80.1 characters unaided at 767px). There used
                    to be a third measure here, a 32 character cap on a marked
                    phrase computed against the full-width case at 320px; it
                    retired with this section's marks. */}
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
                    <div className="max-w-[65ch] pb-10 text-[1.0625rem] leading-[1.6] text-ink lg:col-span-7 lg:col-start-6">
                        {answer}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
