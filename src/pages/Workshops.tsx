import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/**
 * /workshops — conversion page for practical sessions and member office hours.
 *
 * Honest inventory: this repository and sibling strategy docs do not publish
 * concrete public workshop dates, prices, or named instructors. The page
 * therefore sells interest and fit (how workshops sit beside the free monthly
 * meetup and paid membership), not a fabricated catalog. When a dated offer
 * exists, add it here from a real source — do not invent one.
 */
export function Workshops() {
    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Practical sessions for international founders
                        </p>
                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Workshops that fit how IFN <Emphasis>actually</Emphasis> runs
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            IFN is a monthly room in Austin plus the work between meetups. Workshops and
                            office hours are the practical layer: shorter, focused sessions on the problems
                            international founders bring to the room — visas and status questions, U.S.
                            banking, hiring across borders, fundraising without a local network.
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-20">
                <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl font-bold tracking-tight text-ink">Who this is for</h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            Founders who moved to the U.S. (or are building into it) and need answers from
                            people who have already done the same step — not a generic startup curriculum.
                            Typical stages: first U.S. entity, first U.S. hire, first U.S. raise, or the
                            paperwork that sits in front of all three.
                        </p>

                        <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink">
                            How workshops sit next to the meetup
                        </h2>
                        <ul className="mt-4 space-y-4 text-lg leading-relaxed text-muted">
                            <li>
                                <span className="font-semibold text-ink">Monthly meetup (free).</span> The
                                open room at Station Austin — structured intros, peer conversations, the
                                calendar on Luma.
                            </li>
                            <li>
                                <span className="font-semibold text-ink">Office hours &amp; practical sessions.</span>{' '}
                                Smaller, topic-scoped time for members (and, when we publish a public session,
                                for RSVPs on Luma). Same problems as the meetup; more room to go deep.
                            </li>
                            <li>
                                <span className="font-semibold text-ink">Membership.</span> Private channel
                                between meetups, members-only calls, and first access to guides when we
                                publish them.
                            </li>
                        </ul>
                    </div>

                    <aside className="lg:col-span-5">
                        <div className="rounded-2xl border border-rule bg-paper p-8">
                            <h2 className="text-xl font-bold text-ink">What we will not invent</h2>
                            <p className="mt-3 leading-relaxed text-muted">
                                There is no public workshop calendar with prices or named instructors on this
                                site today. When we schedule a dated session, it will appear on Luma and here
                                with real details — not placeholders.
                            </p>
                            <p className="mt-4 leading-relaxed text-muted">
                                IFN is a founder community. Workshops are peer and operator practice,{' '}
                                <span className="font-semibold text-ink">not immigration, legal, tax, or
                                financial advice</span>
                                . Hire licensed professionals for those outcomes.
                            </p>
                        </div>
                    </aside>
                </div>
            </Container>

            <Container className="mb-24">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-rule bg-paper p-8">
                        <h2 className="text-xl font-bold text-ink">Next meetup</h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            The surest way to see how IFN works is to come to the next free monthly meetup in
                            Austin. Register on Luma — that calendar is the source of record.
                        </p>
                        <ButtonLink
                            href={LUMA_CALENDAR_URL}
                            external
                            variant="primary"
                            size="lg"
                            className="mt-6 shadow-lg"
                        >
                            Register on Luma
                        </ButtonLink>
                    </div>
                    <div className="rounded-2xl border border-rule bg-paper p-8">
                        <h2 className="text-xl font-bold text-ink">Membership &amp; interest</h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            Members get the private channel and members-only calls where practical sessions
                            land first. If you want to be notified when a public workshop is scheduled, send
                            a short note.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <ButtonLink to="/membership" variant="primary" size="lg" className="shadow-lg">
                                Become a member
                            </ButtonLink>
                            <ButtonLink
                                to="/contact?intent=workshops"
                                variant="outline"
                                size="lg"
                            >
                                Tell us you are interested
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
