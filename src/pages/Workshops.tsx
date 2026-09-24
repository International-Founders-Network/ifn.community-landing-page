import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';
import { WORKSHOP_PILLARS } from '../data/workshopsData';

/**
 * /workshops — Venkat-approved pack 2026-09-24-workshops-v2.
 *
 * Order: Hero → How it works → 7 pillars → Upcoming (Luma) → Host once →
 * Membership teaser once. Kill list applied (no meetup digression, no duplicate
 * propose, no fake dates/$ table). Luma calendar URL is the shared site SoT.
 */
export function Workshops() {
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
                            Workshops — the skill and ops <Emphasis>track</Emphasis>
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            Meetups are the room. Membership is the private channel and member call.
                            Workshops are where we dig into one founder problem for one session —
                            visas, banking, housing, hiring, fundraising, US go-to-market, entity and
                            tax.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            IFN hosts most sessions. Guest and member hosts are welcome when the topic
                            is useful. Price is set per workshop on Luma. Members usually get a
                            discount or free entry, depending on the session.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <ButtonLink
                                href={LUMA_CALENDAR_URL}
                                external
                                variant="primary"
                                size="lg"
                                className="shadow-lg"
                            >
                                See upcoming on Luma
                            </ButtonLink>
                            <ButtonLink to="/membership" variant="outline" size="lg">
                                Become a member — $149/year
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
                        <span className="text-ink">Pick a session on Luma</span> — topic, date, host,
                        and price live there.
                    </li>
                    <li>
                        RSVP and pay on that session page. There is no public price menu on this site.
                    </li>
                    <li>
                        Members get better pricing when the session offers it (discount or free). That
                        offer is listed on the Luma page for that workshop.
                    </li>
                </ol>
                <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted">
                    What this is not: a course catalog with invented dates, and not licensed legal,
                    tax, or immigration advice. Bring your situation; leave with next steps and people
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

            {/* Upcoming — Luma only */}
            <Container className="mb-16">
                <div className="rounded-2xl border border-rule bg-band p-8 md:p-10">
                    <h2 className="text-2xl font-bold tracking-tight text-ink">
                        Upcoming workshops
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                        Dates, prices, and seats live on Luma. We do not mirror a second calendar
                        here.
                    </p>
                    <ButtonLink
                        href={LUMA_CALENDAR_URL}
                        external
                        variant="primary"
                        size="lg"
                        className="mt-6 shadow-lg"
                    >
                        Browse workshops on Luma
                    </ButtonLink>
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
                            Membership is $149/year. When a workshop offers member pricing, you get
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
                        Become a member — $149/year
                    </ButtonLink>
                </div>
            </Container>
        </div>
    );
}
