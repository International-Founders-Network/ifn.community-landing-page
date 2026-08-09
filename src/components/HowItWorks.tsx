import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';

interface HowItWorksProps {
    onJoinClick?: () => void;
}

export function HowItWorks({ onJoinClick }: HowItWorksProps = {}) {
    // The join form asks for four things (name, work email, LinkedIn, stage) —
    // see JoinModal.tsx. There is no founder profile and no matching engine, so
    // these steps describe the meetup as it actually runs.
    const steps = [
        {
            number: '01',
            title: 'Sign up',
            description:
                'A short form: your name, your email, your LinkedIn address, and the stage your company is at. Nothing else.',
        },
        {
            number: '02',
            title: 'Come to a meetup',
            description:
                'We meet in person in Austin once a month at Station Austin. The speed-networking part is run with Reuneo, so you are paired into short one-to-one conversations rather than left to introduce yourself to strangers on your own.',
        },
        {
            number: '03',
            title: 'Keep the conversations going',
            description:
                'Stay on the list for the next meetup, or take up membership for the private member channel, the resource library, and a members-only call each month.',
        },
    ];

    return (
        <section className="py-24 lg:py-32 bg-slate-900 text-white relative overflow-hidden">
            {/* Atmosphere only: a single warm orb at 10% bleeding in from the
                corner. The previous navy orb was invisible against navy. */}
            <div
                className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
                aria-hidden="true"
            />

            <Container className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-5">
                            How it works
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                            What actually happens
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                            There is no application to pass and no profile to fill in. You sign up, you come to a meetup,
                            and you decide from there whether the rest of it is worth paying for.
                        </p>
                        <Button variant="primary" onDark onClick={onJoinClick}>
                            Join the community
                            <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} aria-hidden="true" />
                        </Button>
                    </div>

                    <ol className="lg:w-2/3 grid md:grid-cols-3 gap-8 list-none">
                        {steps.map((step) => (
                            <li
                                key={step.number}
                                className="relative p-6 lg:p-8 rounded-2xl bg-white/5 border border-white/10 transition-colors duration-300 hover:bg-white/10 hover:border-white/20"
                            >
                                <div
                                    className="text-6xl font-bold tracking-tight text-white/10 absolute top-3 right-5 pointer-events-none select-none"
                                    aria-hidden="true"
                                >
                                    {step.number}
                                </div>
                                <h3 className="relative z-10 text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="relative z-10 text-slate-300 leading-relaxed">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </Container>
        </section>
    );
}
