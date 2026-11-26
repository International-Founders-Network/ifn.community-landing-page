import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { EventCard } from '../components/EventCard';
import { WORKSHOP_PILLARS, upcomingWorkshops } from '../data/workshopsData';

/**
 * /workshops — Venkat-approved pack 2026-09-24-workshops-v2.
 *
 * Order: Hero → How it works → 7 pillars → Upcoming (Luma) → Host once →
 * Membership teaser once. Kill list applied (no meetup digression, no duplicate
 * propose, no fake dates/$ table).
 *
 * Hero and how-it-works copy are from
 * ifn-copy/workshops/2026-11-25-dec-workshops-listing.md (draft preview).
 * The Upcoming cards are IFN's Claude workshops synced from Luma into
 * src/data/workshops.json, rendered with the meetup EventCard: Luma title,
 * date and time in CT, Luma cover (or a poster from
 * workshop-image-overrides.ts), and a link to that event's own Luma page,
 * never the IFN_ATX meetup calendar.
 */
export function Workshops() {
    // Each card drops off once its own Luma end time has passed.
    const scheduled = upcomingWorkshops();

    return (
        <div className="pt-24 pb-20">
            {/* Hero */}
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Skill and ops track
                        </p>
                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Workshops: the skill and ops <Emphasis>track</Emphasis>
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            Meetups are the room. Membership is the private channel and member call.
                            Workshops are where we dig into one problem for one session.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            Two free Claude workshops are scheduled in Austin this December. Dates and
                            RSVP links are below. The rest of this page is the longer skill and ops
                            track: visas, banking, housing, hiring, fundraising, US go-to-market,
                            entity and tax.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            IFN hosts most sessions. Guest and member hosts are welcome when the topic
                            is useful. The December Claude workshops are free. When another session
                            has a price or a member offer, that is listed on its Luma page.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <ButtonLink
                                to="/workshops#upcoming-workshops"
                                variant="primary"
                                size="lg"
                                className="shadow-lg"
                            >
                                See the December workshops
                            </ButtonLink>
                            <ButtonLink to="/membership" variant="outline" size="lg">
                                Become a member
                            </ButtonLink>
                        </div>
                    </div>
                </Container>
            </section>

            {/* How it works */}
            <Container className="mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink">How it works</h2>
                <ol className="mt-8 max-w-2xl list-decimal space-y-4 pl-5 text-lg leading-relaxed text-muted">
                    <li>
                        <span className="text-ink">Pick a session</span>. When a date is set, the
                        topic, date, and host are on this page, and on Luma.
                    </li>
                    <li>
                        RSVP on Luma. The December Claude workshops are free and need host approval.
                    </li>
                    <li>
                        When a session offers a member price, that offer is listed on its Luma page.
                    </li>
                </ol>
                <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted">
                    This is not a course catalog with invented dates. It is not licensed legal,
                    tax, or immigration advice. Bring your situation. Leave with next steps and people
                    who have done it.
                </p>
            </Container>

            {/* Seven pillars */}
            <Container className="mb-20">
                <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold tracking-tight text-ink">What we cover</h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        Seven pillars. When we schedule a session, it lands under one of these.
                    </p>
                </div>

                <div className="mt-12 space-y-12">
                    {WORKSHOP_PILLARS.map((pillar, index) => (
                        <section
                            key={pillar.id}
                            aria-labelledby={`pillar-${pillar.id}`}
                            className="border-t border-rule pt-10"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                                Pillar {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3
                                id={`pillar-${pillar.id}`}
                                className="mt-2 text-xl font-bold tracking-tight text-ink md:text-2xl"
                            >
                                {pillar.title}
                            </h3>
                            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                                {pillar.summary}
                            </p>
                            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.08em] text-muted">
                                Workshop types
                            </p>
                            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                {pillar.types.map((type) => (
                                    <li
                                        key={type.label}
                                        className="rounded-2xl border border-rule bg-paper px-5 py-4 text-base leading-snug text-ink"
                                    >
                                        {type.label}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </Container>

            {/* Upcoming. The hero button jumps here. With no workshops left, only
                the heading remains: no stand-in copy. */}
            <Container className="mb-16">
                <div className="rounded-2xl border border-rule bg-band p-8 md:p-10">
                    <h2
                        id="upcoming-workshops"
                        className="scroll-mt-28 text-2xl font-bold tracking-tight text-ink"
                    >
                        Upcoming workshops
                    </h2>
                    {scheduled.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {scheduled.map((workshop, index) => (
                                <EventCard
                                    key={workshop.id}
                                    event={workshop}
                                    index={index}
                                    upcomingOnly
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Container>

            {/* Host once */}
            <Container className="mb-16">
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold tracking-tight text-ink">Host a workshop</h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        IFN runs most sessions. If you have a topic that fits a pillar above and you
                        can run a practical 60–90 minute session for founders, propose it.
                    </p>
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        Tell us the pillar, the problem you solve in one sitting, and whether you want
                        it free, paid, or members-preferred.
                    </p>
                    <ButtonLink
                        to="/contact?intent=workshops"
                        variant="outline"
                        size="lg"
                        className="mt-6"
                    >
                        Propose a workshop
                    </ButtonLink>
                </div>
            </Container>

            {/* Membership teaser once */}
            <Container className="mb-8">
                <div className="rounded-2xl border border-rule bg-paper p-8 md:flex md:items-center md:justify-between md:gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold text-ink">
                            Members get better workshop access
                        </h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            Optional membership unlocks member pricing when a workshop offers it. You get
                            the discount or free entry listed on that Luma page. You also get the
                            private member channel and the monthly members-only call.
                        </p>
                    </div>
                    <ButtonLink
                        to="/membership"
                        variant="outline"
                        size="lg"
                        className="mt-6 shrink-0 md:mt-0"
                    >
                        Become a member
                    </ButtonLink>
                </div>
            </Container>
        </div>
    );
}
