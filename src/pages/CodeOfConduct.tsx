import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';
import { ShieldAlert, Heart, Users, ShieldCheck, Flag } from 'lucide-react';

const POSITIVE_STANDARDS = [
    'Showing empathy and kindness toward other founders',
    'Respecting different opinions, experiences, and ways of working',
    'Giving useful feedback, and accepting it without taking offense',
    'Taking responsibility and apologizing when we get something wrong',
    'Thinking about what is best for the whole community, not only ourselves',
    'Keeping private what other founders share about their companies',
];

const UNACCEPTABLE = [
    'Sexual language or imagery, and unwelcome sexual attention or advances',
    'Deliberately provoking people, insults, and personal or political attacks',
    'Harassment of any kind, in public or in private',
    "Publishing someone else's private information without their permission",
    'Pressuring anyone to invest, buy, or sign anything at an IFN event',
    'Any other behavior that would be out of place in a professional setting',
];

const ENFORCEMENT_LADDER = [
    {
        title: 'Correction',
        body: 'A private, written note explaining what happened and why the behavior was not acceptable.',
    },
    {
        title: 'Warning',
        body: 'A written warning that sets out what happens if it continues. Contact with the people involved is paused for a set period.',
    },
    {
        title: 'Removal',
        body: 'A permanent ban from IFN events, from the members-only channel, and from every other IFN space.',
    },
];

export function CodeOfConduct() {
    return (
        <Container size="md" className="py-24">
            <div className="mx-auto max-w-4xl">
                <div className="mb-16 text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
                        Code of <Emphasis>Conduct</Emphasis>
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted">
                        The International Founders Network (IFN) exists so that founders who are new to a
                        country have somewhere safe to ask questions. Everyone is welcome at our events and in
                        our member spaces, whatever their nationality, immigration status, first language,
                        gender, orientation, disability, appearance, race, or religion.
                    </p>
                    <p className="mt-6 text-sm text-muted">Last updated: August 8, 2026</p>
                </div>

                <div className="space-y-16">
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-lg bg-band p-2 text-ink">
                                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-ink">What we expect</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-muted">
                            These are the behaviors that make IFN worth attending:
                        </p>
                        <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
                            {POSITIVE_STANDARDS.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 rounded-xl border border-rule bg-band p-4"
                                >
                                    <Heart className="mt-1 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
                                    <span className="text-ink">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-rule bg-band p-8">
                        <div className="mb-6 flex items-center gap-3">
                            {/* A decorative heading chip, not an error state, so it takes no
                                3px rule. Tokenised in Phase 2: it was a stock red-50 fill with
                                red-700 type, a second brand hue banned by section 11's Color
                                Consistency Lock and a fixed light chip once dark mode is on.
                                The class names are described rather than spelled because
                                Tailwind v4 scans raw text and would re-emit them as dead CSS.

                                `--paper` rather than `--band` because this section's ground IS
                                `--band`, so a `--band` chip would measure 1.000 and disappear.
                                As written it is 1.103, the same one-step-off-ground delta the
                                two other heading chips on this page carry, in the opposite
                                direction. Deliberately borderless: section 4.2's mandatory 1px
                                `--rule` plate border governs recessed content surfaces, and
                                adding one here would make this the only bordered chip of the
                                three. What is perceived is the glyph at 17.965 light and
                                16.318 dark, not the tone step. If that rule is meant to bind
                                on icon chips too, Phase 3 applies it to all three at once. */}
                            <span className="rounded-lg bg-paper p-2 text-ink">
                                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-ink">What is not allowed</h2>
                        </div>
                        <p className="mb-6 text-lg leading-relaxed text-muted">
                            The following count as harassment or misuse of the community, and they are not
                            tolerated anywhere IFN operates:
                        </p>
                        <ul className="list-disc space-y-3 pl-6 text-ink marker:text-muted">
                            {UNACCEPTABLE.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-lg bg-band p-2 text-ink">
                                <Flag className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-ink">Reporting a problem</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-muted">
                            If you are being harassed, if you see someone else being harassed, or if something
                            at an IFN event made you uncomfortable, write to{' '}
                            <a
                                href="mailto:hello@ifn.community"
                                className="rounded-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                            >
                                hello@ifn.community
                            </a>
                            . That address reaches the founding team directly.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            IFN is run by a small team, so we will not pretend there is a duty desk waiting.
                            What we can promise is that every report is read, kept private, and answered by a
                            person. Depending on what happened, we take one of these three steps:
                        </p>
                        <ol className="mt-8 list-none space-y-4 p-0">
                            {ENFORCEMENT_LADDER.map((step, index) => (
                                <li
                                    key={step.title}
                                    className="flex gap-4 rounded-2xl border border-rule bg-paper p-6"
                                >
                                    <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-band text-sm font-bold text-ink"
                                        aria-hidden="true"
                                    >
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="mb-2 text-xl font-bold text-ink">{step.title}</h3>
                                        <p className="text-muted">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="rounded-3xl bg-band p-10 text-center text-ink">
                        <Users className="mx-auto mb-6 h-12 w-12 text-accent" aria-hidden="true" />
                        <h2 className="mb-4 text-2xl font-bold text-ink">Not sure about something?</h2>
                        <p className="mx-auto max-w-2xl leading-relaxed text-muted">
                            Ask. If you are unsure whether something belongs at an IFN event (a pitch, a
                            photograph, a recruiting message), it is easier to check first than to undo it
                            afterwards. Write to{' '}
                            <a
                                href="mailto:hello@ifn.community"
                                className="rounded-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                            >
                                hello@ifn.community
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </Container>
    );
}
