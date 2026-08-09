import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { MEMBERSHIP_PRICE_ATTENDEE, MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

const MEETUP_URL = 'https://www.meetup.com/international-founders-network-austin/';

/** Shared link styling. Underlined so the link is not signalled by colour alone. */
const linkStyles =
    'font-medium text-primary underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-primary rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

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
                Station Austin hosts us — they are our venue partner. Each meetup is published with its
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
                The meetups are free to attend — you never need to be a member to walk in. Membership is
                a separate, optional layer:{' '}
                <strong className="font-semibold text-slate-900">{MEMBERSHIP_PRICE_STANDARD} a year</strong>, or{' '}
                <strong className="font-semibold text-slate-900">{MEMBERSHIP_PRICE_ATTENDEE} a year</strong>{' '}
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
                other chapters, and we are not opening any right now. Membership works from anywhere —
                the member channel, the library and the monthly office-hours call are all remote — but
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
                Two things, and you can check both. It has run every month for more than six months —
                the past meetups are listed publicly on Meetup and Luma. And everyone in the room is
                building in the United States from somewhere else, so the conversation starts at work
                authorization, opening a bank account and hiring across borders instead of arriving
                there at the end of the night.
            </>
        ),
    },
];

export function FAQ() {
    return (
        <section className="py-24 bg-slate-50" id="faq">
            <Container size="md">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Questions founders ask us
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Direct answers about what IFN is, what it costs (nothing for the meetups,{' '}
                        {MEMBERSHIP_PRICE_STANDARD} a year for optional membership), and what it does
                        not do.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            defaultOpen={faq.defaultOpen}
                        />
                    ))}
                </div>

                <p className="mt-10 text-center text-slate-600">
                    Something else on your mind?{' '}
                    <Link to="/contact" className={linkStyles}>
                        Write to us
                    </Link>{' '}
                    — a founder reads it, not a support desk.
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
    // findable by the browser's find-in-page and readable by crawlers — the plain
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
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-colors hover:border-slate-300">
            <h3>
                <button
                    type="button"
                    id={triggerId}
                    onClick={toggle}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                    <span className="font-semibold text-lg text-slate-900">{question}</span>
                    <span
                        aria-hidden="true"
                        className={`shrink-0 p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                            }`}
                    >
                        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </span>
                </button>
            </h3>

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
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">{answer}</div>
            </motion.div>
        </div>
    );
}
