import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { MEMBERSHIP_PRICE_ATTENDEE, MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

const MEETUP_URL = 'https://www.meetup.com/international-founders-network-austin/';

/**
 * Shared inline-link styling.
 *
 * Colour: `--ink`, not `--accent`. REDESIGN-PLAN.md section 4.1 names "accent
 * links" in the `--accent-press` row, but section 2 licenses the accent to
 * three roles "and no others" and caps marks at two per viewport. That cap is
 * countable only once Phase 3 has placed this section's marks, so a Phase 1
 * shell restyle does not spend budget it cannot audit. Ink on `--band`
 * measures 16.281. Deferred, not decided: whoever sets this section's mark
 * budget in Phase 3 owns the accent-link question.
 *
 * The underline is therefore the sole affordance and has to clear the 3:1
 * non-text floor on its own. `--rule` measures 3.682 on `--band` at rest and
 * promotes to `--ink` at 16.281 on hover. The outgoing underline was a 300-step
 * grey from the retired ramp and measured 1.485 against the white card it sat
 * on, so it was effectively invisible. (That class name is deliberately not
 * spelled out here: Phase 2's colour gate greps the whole tree for it and a
 * comment would count against the sweep.)
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
 * `outline-hidden` rather than the bare outline reset it replaces: only
 * `outline-hidden` keeps `outline: 2px solid transparent` under
 * `forced-colors: active`, and a forced colours UA drops box-shadow, which is
 * what a ring compiles to. Under the bare reset these links and the disclosure
 * trigger below had no focus indicator at all in Windows High Contrast Mode.
 */
const linkStyles =
    'font-medium text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

interface FaqEntry {
    id: string;
    question: string;
    answer: ReactNode;
    /** Open on load. Kept to two so the section still reads as a list. */
    defaultOpen?: boolean;
}

/**
 * Every answer here has to survive a member asking "is that actually true?".
 * What is claimed: a monthly in-person Austin meetup with six-plus months of
 * history, Station Austin as venue partner, Reuneo as format partner, listings
 * on Luma and Meetup, free attendance, and a paid membership at the price
 * `/membership` charges. Nothing else. See PRODUCT.md, "Evidence on Hand".
 *
 * Copy is unchanged in Phase 1 except for punctuation: five em-dashes were
 * substituted for a full stop, a colon or a parenthetical. No word was added,
 * removed or reordered. The accent mark and the 3px rule that section 5 puts
 * under the denials in these answers are Phase 3 composition and are not here.
 */
const FAQS: FaqEntry[] = [
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
                IFN meets once a month, in person, in Austin. The center of the evening is structured
                one-to-one networking run with Reuneo, our format partner: you are paired with one
                person at a time for a short conversation, then paired again. Nobody has to walk up to
                a circle of strangers and introduce themselves. Around that there is open conversation
                with founders who have already worked through the problem you are on now.
            </>
        ),
        defaultOpen: true,
    },
    {
        id: 'where',
        question: 'Where is it held, and how do I register?',
        answer: (
            <>
                Station Austin hosts us. They are our venue partner. Each meetup is published with its
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
        id: 'fee',
        question: 'Is there a membership fee?',
        answer: (
            <>
                The meetups are free to attend. You never need to be a member to walk in. Membership is
                a separate, optional layer:{' '}
                <strong className="font-semibold tabular-nums">{MEMBERSHIP_PRICE_STANDARD} a year</strong>, or{' '}
                <strong className="font-semibold tabular-nums">{MEMBERSHIP_PRICE_ATTENDEE} a year</strong>{' '}
                if you already come to the meetups or are on our list. It adds the private member channel on
                Slack/Discord, the resource library, and monthly members-only office hours.{' '}
                <Link to="/membership" className={linkStyles}>
                    See what membership includes
                </Link>
                .
            </>
        ),
    },
    {
        id: 'visas',
        question: 'Can IFN help with visas, U.S. banking, or incorporating?',
        answer: (
            <>
                Not as a professional service. Nobody at IFN is an immigration lawyer, an accountant or a
                banker, and nothing we publish is legal or financial advice. What you get is the next
                best thing: people in the room who have already been through the same visa process,
                opened the same accounts and registered the same kind of company, telling you plainly
                what happened to them. Members also get a resource library of notes and templates on
                immigration, U.S. banking and hiring, written out of those conversations.
            </>
        ),
    },
    {
        id: 'austin',
        question: 'I am not in Austin. Is IFN useful to me?',
        answer: (
            <>
                We would rather say this plainly: the in-person part of IFN is Austin only. There are no
                other chapters, and we are not opening any right now. Membership works from anywhere
                (the member channel, the library and the monthly office-hours call are all remote), but
                the meetups are the strongest part of IFN, and they happen here.
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
];

/**
 * FAQ. Section 8 of REDESIGN-PLAN.md: an interactive disclosure register on
 * the `--band` ground, full-width rows on hairlines, open answers indenting
 * into a 7-of-12 column so an open panel differs in STRUCTURE and not only in
 * height.
 *
 * Phase 1 scope is the shell: tokens, type and the disclosure chrome. The
 * composition (marks under the denials, the mark-draw motion) is Phase 3.
 *
 * Skill 4.9 wants a real UI component rather than a longer list above five
 * items. A disclosure accordion is one of that section's own four sanctioned
 * alternatives, so the eight entries here are already compliant and are not
 * regrouped into clusters. Regrouping would be Phase 3 composition anyway.
 *
 * No eyebrow. The plan's budget is 2 of 3 and both are spent on Hero and
 * PartnersStrip.
 */
export function FAQ() {
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
                    by taking the bet. */}
                <div className="max-w-[65ch]">
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
                        Questions founders ask us
                    </h2>
                    <p className="mt-5 text-[1.0625rem] leading-[1.6] text-muted">
                        Direct answers about what IFN is, what it costs (nothing for the meetups,{' '}
                        {MEMBERSHIP_PRICE_STANDARD} a year for optional membership), and what it does
                        not do.
                    </p>
                </div>

                {/* Each row draws its own 1px `--rule` hairline along its top edge.
                    The list carries the closing rule for the last row, so there is
                    exactly one hairline between adjacent rows and one at each end,
                    never a doubled `border-t` plus `border-b` per row. */}
                <div className="mt-16 border-b border-rule">
                    {FAQS.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            defaultOpen={faq.defaultOpen}
                        />
                    ))}
                </div>

                <p className="mt-12 max-w-[65ch] text-[1.0625rem] leading-[1.6] text-muted">
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
                    className="group relative flex w-full items-start justify-between gap-8 py-7 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                    {/* The hover affordance, and the reason it is a positioned
                        element rather than a border.

                        Plan 4.4: a full-width interactive row never takes a ground
                        swap on hover. This row sits on `--band`, so a `--band`
                        hover ground measures 1.000 against its own section. The
                        mechanism is the hairline instead: 1px `--rule` at 3.682 on
                        `--band` promoting to 2px `--edge` at 4.495.

                        Growing a real `border-t` from 1px to 2px would shift every
                        row below by a pixel on hover. Absolutely positioned, the
                        height change costs no layout. Only `background-color`
                        transitions (150ms, motion behaviour 6); the height snaps,
                        because nothing in the plan sanctions animating geometry on
                        a control state.

                        Full opacity at both widths. Plan 4.2 measured `--rule` at
                        75% pixel coverage down to 2.665, so a hairline is never
                        expressed with `opacity` or an alpha colour. */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-rule transition-colors duration-150 group-hover:h-0.5 group-hover:bg-edge"
                    />
                    <span className="text-[1.25rem] font-medium leading-[1.3] text-ink lg:text-[1.375rem]">
                        {question}
                    </span>
                    <span aria-hidden="true" className="mt-0.5 shrink-0 text-ink">
                        {isOpen ? <Minus size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
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
                    only in height.

                    Mobile and tablet collapse, declared here per the plan's
                    per-component rule: below `lg` the answer runs full width with
                    no indent. Measured rather than guessed, at the 0.529em body
                    advance printed in plan section 5. Inside `Container size="md"`
                    a 7-of-12 column is 410px at 768px wide, which is 45.6
                    characters and too narrow for five-sentence answers. At 1024px
                    and above it is 550px, or 61.2 characters. So the indent starts
                    at `lg`, where it fits, and the 65ch cap below governs the
                    full-width case (80.1 characters unaided at 767px). */}
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
                    <div className="max-w-[65ch] pb-10 text-[1.0625rem] leading-[1.6] text-ink lg:col-span-7 lg:col-start-6">
                        {answer}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
