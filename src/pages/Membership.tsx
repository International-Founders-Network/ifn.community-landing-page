import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import {
    MEMBERSHIP_BENEFITS,
    MEMBERSHIP_PRICE_STANDARD,
    MEMBERSHIP_TIER_NAME,
} from '../data/membershipData';

export function Membership() {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="pt-24 pb-20">
            <section className="bg-band py-20 mb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--muted),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6 tracking-tight">
                            IFN <Emphasis>Membership</Emphasis>
                        </h1>
                        <p className="text-xl text-muted leading-relaxed">
                            The monthly IFN meetup in Austin is open to everyone, and it stays that way.
                            Membership is what happens in between: a private channel with other international
                            founders, a written library built from six months of those meetups, and one
                            members-only call a month.
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-24">
                <div className="max-w-3xl mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">
                        What you get for the year
                    </h2>
                    <p className="text-lg text-muted leading-relaxed">
                        Three things, and only three. All of them cover the weeks between one monthly
                        meetup and the next.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {MEMBERSHIP_BENEFITS.map((benefit) => (
                        <motion.div
                            key={benefit.id}
                            variants={item}
                            className="p-8 rounded-2xl border border-rule bg-paper hover:shadow-xl hover:border-edge transition-all flex flex-col gap-4"
                        >
                            <h3 className="text-xl font-bold text-ink">{benefit.title}</h3>
                            <p className="text-muted leading-relaxed">{benefit.description}</p>
                            <ul className="mt-2 flex flex-col gap-3 border-t border-rule pt-6">
                                {benefit.included.map((line) => (
                                    <li key={line} className="flex gap-3 text-sm text-muted leading-relaxed">
                                        <Check
                                            className="w-4 h-4 mt-1 shrink-0 text-muted"
                                            strokeWidth={2}
                                            aria-hidden="true"
                                        />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>

            <section className="bg-band py-20">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">
                            What it costs
                        </h2>
                        <p className="text-lg text-muted leading-relaxed mb-10">
                            Membership runs for a full year.
                        </p>

                        {/* One price plate, not a tier grid: this was a `grid sm:grid-cols-2` and
                            only one price is public. See membershipData.ts for the standing rule.
                            There is no multi-column layout left in this block, so the plate is a
                            single centred column at every width and nothing collapses.
                            The 1px `--rule` border is mandatory rather than decorative, per
                            REDESIGN-PLAN section 4.2: `--band` against `--paper` is 1.103:1, so
                            ground tone alone cannot make a plate perceivable. */}
                        <div className="mx-auto max-w-sm p-8 rounded-2xl border border-rule bg-paper flex flex-col gap-3 text-left">
                            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
                                {MEMBERSHIP_TIER_NAME}
                            </h3>
                            <p className="text-4xl font-bold text-ink tracking-tight tabular-nums">
                                {MEMBERSHIP_PRICE_STANDARD}
                                <span className="text-base font-semibold text-muted"> / year</span>
                            </p>
                        </div>

                        <p className="mt-6 text-sm text-muted leading-relaxed">
                            The price covers a full year and is charged once. IFN does not take equity in your
                            company, and you do not need to be a member to come to a meetup.
                        </p>

                        <div className="mt-12">
                            {/* A link, not a <Button>: this is navigation to /contact, so it must be
                                openable in a new tab and copyable. It deliberately does not point at
                                Stripe: the payment link is not wired, see PRODUCT.md. shadow-* is
                                DESIGN.md's Action Glow, which buttonClasses() does not carry. */}
                            <ButtonLink to="/contact" variant="primary" size="lg" className="shadow-lg">
                                Request your membership link
                            </ButtonLink>
                            <p className="mt-6 mx-auto max-w-xl text-muted leading-relaxed">
                                Membership is arranged by hand while we finish setting up online payment. Send a
                                message through the contact form and a person from the IFN team will reply with a
                                payment link for the price above.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}
