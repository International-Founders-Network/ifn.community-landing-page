import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { EventCard } from '../components/EventCard';
import { WORKSHOP_PILLARS, upcomingWorkshops } from '../data/workshopsData';

/**
 * /workshops. Copy and section order from
 * ifn-copy/workshops/2026-11-25-workshops-concise.md (draft preview).
 *
 * Order: Hero (H1 plus one line) → Upcoming (Luma cards) → What we cover →
 * Host a workshop → Membership teaser. How it works is gone. The Upcoming
 * cards are IFN's Claude workshops synced from Luma into
 * src/data/workshops.json, rendered with the meetup EventCard.
 */
export function Workshops() {
    // Each card drops off once its own Luma end time has passed.
    const scheduled = upcomingWorkshops();

    return (
        <div className="pt-24 pb-20">
            {/* Hero: H1 plus one line. No eyebrow, no extra paragraphs, no buttons. */}
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Workshops
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            One problem per session, for international founders in Austin.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Upcoming. With no workshops left, only the heading remains. */}
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

            {/* What we cover: titles and type bullets only, then the disclaimer. */}
            <Container className="mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink">What we cover</h2>

                <div className="mt-12 space-y-12">
                    {WORKSHOP_PILLARS.map((pillar) => (
                        <section
                            key={pillar.id}
                            aria-labelledby={`pillar-${pillar.id}`}
                            className="border-t border-rule pt-10"
                        >
                            <h3
                                id={`pillar-${pillar.id}`}
                                className="text-xl font-bold tracking-tight text-ink md:text-2xl"
                            >
                                {pillar.title}
                            </h3>
                            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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

                <p className="mt-12 max-w-2xl text-base leading-relaxed text-muted">
                    This is not licensed legal, tax, or immigration advice. Bring your
                    situation. Leave with next steps and people who have done it.
                </p>
            </Container>

            {/* Host once */}
            <Container className="mb-16">
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold tracking-tight text-ink">Host a workshop</h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        IFN runs most sessions. To propose a practical 60 to 90 minute session,
                        tell us the pillar, the problem you solve, and whether it is free, paid,
                        or members-preferred.
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
                            When a session has a member price, it is listed on its Luma page.
                            Members also get the private member channel and the monthly
                            members-only call.
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
