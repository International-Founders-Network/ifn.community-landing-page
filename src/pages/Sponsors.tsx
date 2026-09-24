import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { Link } from 'react-router-dom';

/**
 * /sponsors — category sponsorship with starting-at floors (Venkat Q2).
 * Full SKU / Signal / Content / 3-night stay deck-only.
 */
const DELIVERABLES = [
    {
        title: 'Logo on the meetup listing',
        detail: 'Presence on the Luma (and Meetup) event page for the covered nights.',
    },
    {
        title: 'Host shoutout in the room',
        detail: 'A short, scoped mention from the host — not a sales pitch.',
    },
    {
        title: 'Thank-you email mention',
        detail: 'Logo or one-liner in the post-meetup note to attendees who opted in.',
    },
    {
        title: 'Member-channel mention when live',
        detail: 'A factual listing in the member channel when that surface is live — never framed as IFN advice.',
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
        name: 'Night',
        price: 'from $1,000',
        summary: 'One meetup night — logo, shoutout, listing presence.',
    },
    {
        name: 'Workshop',
        price: 'from $2,000',
        summary: 'Underwrite a practical workshop session.',
    },
    {
        name: 'Category Exclusive',
        price: 'from $3,500',
        summary:
            'Own a category for a window. Housing / immigration / banking categories from $4,500.',
    },
    {
        name: 'Title / annual',
        price: 'from $12,000/yr',
        summary: 'Year-long title association.',
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
                            Put your brand in a room that already has the{' '}
                            <Emphasis>problem you solve</Emphasis>
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            One flagship meetup a month in Austin. International and immigrant founders.
                            Sponsorship ≠ Partners — paid seat, clear deliverables, starting-at prices
                            below.
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-20">
                <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl font-bold tracking-tight text-ink">Audience</h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            About <span className="font-semibold text-ink">100–300</span> people on the
                            meetup and newsletter list. Attendees: international/immigrant founders and
                            operators, plus attorneys, investors, and operators who work with them.
                            Meetups free; membership optional.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            Cadence: usually <span className="font-semibold text-ink">4th Thursday</span>{' '}
                            each month · Station Austin / Capital Factory pattern · always{' '}
                            <span className="font-semibold text-ink">confirm on Luma</span> (source of
                            truth).
                        </p>

                        <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink">
                            Deliverables you can buy
                        </h2>
                        <ul className="mt-6 space-y-5">
                            {DELIVERABLES.map((item) => (
                                <li
                                    key={item.title}
                                    className="border-t border-rule pt-5 first:border-t-0 first:pt-0"
                                >
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
                                <li>
                                    Advertising / event presence — not IFN endorsing outcomes.
                                </li>
                                <li>Not a law firm, CPA, bank, or immigration practice.</li>
                                <li>No scraped attendee lists; no guaranteed lead counts.</li>
                                <li>
                                    Station Austin / Reuneo roles are not logo buyouts.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </Container>

            <Container className="mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                    Packages (starting-at floors)
                </h2>
                <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
                    Full deliverable matrix and add-ons (Signal, content, multi-night, etc.) stay on the
                    private rate card — ask and we send the deck.
                </p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.name}
                            className="flex flex-col rounded-2xl border border-rule bg-paper p-8"
                        >
                            <h3 className="text-xl font-bold text-ink">{pkg.name}</h3>
                            <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{pkg.price}</p>
                            <p className="mt-3 flex-grow leading-relaxed text-muted">{pkg.summary}</p>
                        </div>
                    ))}
                </div>
            </Container>

            <Container className="text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold text-ink">Request a package</h2>
                    <p className="mt-4 text-muted">
                        Tell us category + package (Night, Workshop, Category Exclusive, or Title). A
                        person from IFN replies with the full deck and available nights.
                    </p>
                    <ButtonLink
                        to="/contact?intent=sponsor"
                        variant="primary"
                        size="lg"
                        className="mt-8 shadow-lg"
                    >
                        Request sponsorship
                    </ButtonLink>
                    <p className="mt-6 text-sm text-muted">
                        Looking for a working collaboration (not a paid buy)? See{' '}
                        <Link
                            to="/partners"
                            className="font-semibold text-ink underline underline-offset-4"
                        >
                            Partners
                        </Link>
                        .
                    </p>
                </div>
            </Container>
        </div>
    );
}
