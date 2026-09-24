import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { Link } from 'react-router-dom';

/**
 * /sponsors — category sponsorship, distinct from /partners.
 *
 * /partners is for working collaborators (Station Austin, Reuneo, Yani Partners).
 * This page is for professionals who already serve international founders and
 * want a clear seat around the monthly room. Draft dollar amounts exist in
 * off-repo outreach packs as hypotheses — they are not a public offer, so this
 * page publishes deliverables and package shape without inventing prices.
 */
const DELIVERABLES = [
    {
        title: 'Logo on the meetup listing',
        detail: 'Presence on the Luma (and Meetup) event page for the covered nights.',
    },
    {
        title: 'Verbal shoutout in the room',
        detail: 'A short, scoped mention from the host — not a sales pitch.',
    },
    {
        title: 'Thank-you email mention',
        detail: 'Logo or one-liner in the post-meetup note to attendees who opted in.',
    },
    {
        title: 'Member-channel mention when live',
        detail: 'A factual listing in the member channel / resource surfaces when those are published — never framed as IFN advice.',
    },
    {
        title: 'Table or booth (higher packages)',
        detail: 'Physical presence at a covered meetup when the package includes it.',
    },
    {
        title: 'Optional short founder Q&A',
        detail: 'A scoped 5-minute seat on a relevant night — education, not a pitch deck.',
    },
] as const;

const PACKAGES = [
    {
        name: 'Presence',
        summary: 'Listing logo and a shoutout — light footprint for a first night.',
    },
    {
        name: 'Featured',
        summary: 'Presence plus thank-you email and channel mention when those surfaces are live.',
    },
    {
        name: 'Category exclusive',
        summary: 'Featured deliverables plus category exclusivity for the package window, and table / Q&A where included.',
    },
] as const;

export function Sponsors() {
    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Category sponsorship
                        </p>
                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Reach founders who already have the <Emphasis>problem you solve</Emphasis>
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            IFN gathers international and immigrant founders in Austin every month — visas,
                            banking, hiring across borders, fundraising when nobody knows your last company.
                            Sponsorship is a clear seat in that room. It is not the same as a working
                            collaborator role on{' '}
                            <Link
                                to="/partners"
                                className="font-semibold text-ink underline underline-offset-4 decoration-rule hover:decoration-ink"
                            >
                                /partners
                            </Link>
                            .
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-20">
                <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl font-bold tracking-tight text-ink">Audience (honest)</h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            About <span className="font-semibold text-ink">100 to 300</span> people are on the
                            meetup and newsletter list — a real range we would rather print than round up.
                            Attendees are international and immigrant founders and operators building in the
                            U.S., plus attorneys, investors, and operators who work with them. Meetups are
                            free to attend; membership is optional.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            Cadence: one flagship meetup per month in Austin (Station Austin / Capital
                            Factory pattern). Confirm the next date on Luma — that calendar is the source of
                            record.
                        </p>

                        <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink">
                            What you can buy
                        </h2>
                        <ul className="mt-6 space-y-5">
                            {DELIVERABLES.map((item) => (
                                <li key={item.title} className="border-t border-rule pt-5 first:border-t-0 first:pt-0">
                                    <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                                    <p className="mt-1 leading-relaxed text-muted">{item.detail}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <aside className="lg:col-span-5">
                        <div className="rounded-2xl border border-rule bg-paper p-8">
                            <h2 className="text-xl font-bold text-ink">Hard boundaries</h2>
                            <ul className="mt-4 space-y-3 leading-relaxed text-muted">
                                <li>Sponsorship is advertising and event presence — not IFN endorsing your outcomes.</li>
                                <li>IFN is not a law firm, CPA firm, bank, or immigration practice.</li>
                                <li>We do not sell scraped attendee lists or guaranteed lead counts.</li>
                                <li>
                                    Station Austin&apos;s venue role and Reuneo&apos;s format role are not for
                                    sale as logo buyouts on the home page.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </Container>

            <Container className="mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink">Package shape</h2>
                <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
                    Three package levels mirror how we talk about sponsorship in outreach. Public dollar
                    amounts are not listed here — rates are still being stress-tested with category buyers.
                    Packages start on request.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.name}
                            className="flex flex-col rounded-2xl border border-rule bg-paper p-8"
                        >
                            <h3 className="text-xl font-bold text-ink">{pkg.name}</h3>
                            <p className="mt-3 flex-grow leading-relaxed text-muted">{pkg.summary}</p>
                            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.08em] text-muted">
                                Pricing on request
                            </p>
                        </div>
                    ))}
                </div>
            </Container>

            <Container className="text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold text-ink">Talk sponsorship</h2>
                    <p className="mt-4 text-muted">
                        Tell us your category and which package shape you care about. A person from IFN will
                        follow up — this is not an automated media kit blast.
                    </p>
                    <ButtonLink
                        to="/contact?intent=sponsor"
                        variant="primary"
                        size="lg"
                        className="mt-8 shadow-lg"
                    >
                        Contact us about sponsoring
                    </ButtonLink>
                    <p className="mt-6 text-sm text-muted">
                        Looking for a working collaboration (venue, format, ops) instead? See{' '}
                        <Link
                            to="/partners"
                            className="font-semibold text-ink underline underline-offset-4"
                        >
                            partners
                        </Link>
                        .
                    </p>
                </div>
            </Container>
        </div>
    );
}
