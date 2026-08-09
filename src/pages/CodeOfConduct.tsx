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
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-5xl">
                        Code of <Emphasis>Conduct</Emphasis>
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
                        The International Founders Network (IFN) exists so that founders who are new to a
                        country have somewhere safe to ask questions. Everyone is welcome at our events and in
                        our member spaces, whatever their nationality, immigration status, first language,
                        gender, orientation, disability, appearance, race, or religion.
                    </p>
                    <p className="mt-6 text-sm text-slate-500">Last updated: August 8, 2026</p>
                </div>

                <div className="space-y-16">
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-lg bg-slate-100 p-2 text-primary">
                                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-primary">What we expect</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-slate-600">
                            These are the behaviors that make IFN worth attending:
                        </p>
                        <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
                            {POSITIVE_STANDARDS.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <Heart className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-lg bg-red-50 p-2 text-red-700">
                                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-primary">What is not allowed</h2>
                        </div>
                        <p className="mb-6 text-lg leading-relaxed text-slate-600">
                            The following count as harassment or misuse of the community, and they are not
                            tolerated anywhere IFN operates:
                        </p>
                        <ul className="list-disc space-y-3 pl-6 text-slate-700 marker:text-slate-400">
                            {UNACCEPTABLE.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-lg bg-slate-100 p-2 text-primary">
                                <Flag className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl font-bold text-primary">Reporting a problem</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-slate-600">
                            If you are being harassed, if you see someone else being harassed, or if something
                            at an IFN event made you uncomfortable, write to{' '}
                            <a
                                href="mailto:hello@ifn.community"
                                className="rounded-sm font-semibold text-primary underline decoration-slate-300 underline-offset-4 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                hello@ifn.community
                            </a>
                            . That address reaches the founding team directly.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            IFN is run by a small team, so we will not pretend there is a duty desk waiting.
                            What we can promise is that every report is read, kept private, and answered by a
                            person. Depending on what happened, we take one of these three steps:
                        </p>
                        <ol className="mt-8 list-none space-y-4 p-0">
                            {ENFORCEMENT_LADDER.map((step, index) => (
                                <li
                                    key={step.title}
                                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-primary"
                                        aria-hidden="true"
                                    >
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="mb-2 text-xl font-bold text-primary">{step.title}</h3>
                                        <p className="text-slate-600">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="rounded-3xl bg-primary p-10 text-center text-white">
                        <Users className="mx-auto mb-6 h-12 w-12 text-accent" aria-hidden="true" />
                        <h2 className="mb-4 text-2xl font-bold text-white">Not sure about something?</h2>
                        <p className="mx-auto max-w-2xl leading-relaxed text-slate-300">
                            Ask. If you are unsure whether something belongs at an IFN event — a pitch, a
                            photograph, a recruiting message — it is easier to check first than to undo it
                            afterwards. Write to{' '}
                            <a
                                href="mailto:hello@ifn.community"
                                className="rounded-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
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
