import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/**
 * /workshops — IFN-hosted practical sessions + guest hosts.
 *
 * Locked (Venkat Q1, 2026-09-24): price per workshop on the Luma session page;
 * members get discount or free, session-dependent. No public $ table. No fake
 * dated catalog.
 */
export function Workshops() {
    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Between the monthly meetups
                        </p>
                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Practical workshops — one problem, one <Emphasis>session</Emphasis>
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            IFN hosts most sessions. Members and guests can propose one too. Price is set
                            per workshop on Luma. Members usually get a discount or free entry — depends on
                            the session.
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink">How it works</h2>
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full min-w-[36rem] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-rule">
                                <th className="py-3 pr-4 text-sm font-bold text-ink">Layer</th>
                                <th className="py-3 pr-4 text-sm font-bold text-ink">What it is</th>
                                <th className="py-3 text-sm font-bold text-ink">How to get in</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted">
                            <tr className="border-b border-rule align-top">
                                <td className="py-4 pr-4 font-semibold text-ink">Monthly meetup</td>
                                <td className="py-4 pr-4">Free open room</td>
                                <td className="py-4">Register on Luma</td>
                            </tr>
                            <tr className="border-b border-rule align-top">
                                <td className="py-4 pr-4 font-semibold text-ink">Monthly members-only call</td>
                                <td className="py-4 pr-4">Online, members only · no fixed day published</td>
                                <td className="py-4">Become a member ($149/yr)</td>
                            </tr>
                            <tr className="align-top">
                                <td className="py-4 pr-4 font-semibold text-ink">Public workshop</td>
                                <td className="py-4 pr-4">Dated IFN or guest-hosted session</td>
                                <td className="py-4">
                                    Luma RSVP · <span className="font-semibold text-ink">price on that session page</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-16 grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl font-bold tracking-tight text-ink">Pricing (honest)</h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            No public price menu on this site. When a workshop is scheduled, its Luma page
                            shows the price. Members get better pricing (discount or free) when that session
                            offers it.
                        </p>

                        <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink">
                            Host or propose a workshop
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            IFN runs most workshops. If you want to host one for the room, propose the topic
                            and format.
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

                    <aside className="lg:col-span-5">
                        <div className="rounded-2xl border border-rule bg-paper p-8">
                            <h2 className="text-xl font-bold text-ink">What this is not</h2>
                            <p className="mt-3 leading-relaxed text-muted">
                                Not a course catalog with invented dates. Not licensed legal, tax, or
                                immigration advice.
                            </p>
                        </div>
                    </aside>
                </div>
            </Container>

            <Container className="mb-24">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-rule bg-paper p-8">
                        <h2 className="text-xl font-bold text-ink">Next meetup</h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            Come to the free monthly meetup in Austin. Register on Luma — that calendar is
                            the source of truth.
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
                        <h2 className="text-xl font-bold text-ink">Propose a workshop</h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            Members and guests can propose a topic and format. Tell us what you want to host.
                        </p>
                        <ButtonLink to="/contact?intent=workshops" variant="outline" size="lg" className="mt-6">
                            Propose a workshop
                        </ButtonLink>
                    </div>
                    <div className="rounded-2xl border border-rule bg-paper p-8">
                        <h2 className="text-xl font-bold text-ink">Membership</h2>
                        <p className="mt-3 leading-relaxed text-muted">
                            Monthly members-only call plus member workshop pricing when a session offers it.
                        </p>
                        <ButtonLink to="/membership" variant="outline" size="lg" className="mt-6">
                            Become a member
                        </ButtonLink>
                    </div>
                </div>
            </Container>
        </div>
    );
}
