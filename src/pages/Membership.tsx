import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { Emphasis } from '../components/Emphasis';
import {
    MEMBERSHIP_BENEFITS,
    MEMBERSHIP_PRICE_STANDARD,
    MEMBERSHIP_TIER_NAME,
} from '../data/membershipData';

/** The one published plan slug. Resolved server-side; see netlify/functions/checkout.ts. */
const PLAN_SLUG = 'founding-member';

export function Membership() {
    const [searchParams] = useSearchParams();
    const checkoutResult = searchParams.get('checkout');
    const [checkoutState, setCheckoutState] = useState<'idle' | 'starting' | 'error'>('idle');

    /**
     * Starts Stripe Checkout. The browser sends a plan SLUG and nothing else —
     * no price, no amount, no Stripe id — because a client that can name a price
     * can choose what it pays. The server resolves the slug through its own
     * allowlist.
     *
     * On failure this deliberately does not retry silently or leave a dead
     * button: it surfaces a plain message and keeps /contact reachable, which is
     * the flow that sold every membership before this existed.
     */
    async function startCheckout() {
        setCheckoutState('starting');
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: PLAN_SLUG }),
            });
            const data: { url?: string } = await response.json();

            if (!response.ok || !data.url) {
                setCheckoutState('error');
                return;
            }
            // A full navigation, not a router push: Stripe Checkout is not our app.
            window.location.href = data.url;
        } catch {
            setCheckoutState('error');
        }
    }

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

            {/* Where Stripe sends the reader back to. Without this a member who has
                just paid lands on an unchanged pricing page and cannot tell whether
                it worked — the single most alarming moment in any checkout.

                This reports what STRIPE said, not what IFN's database knows. The
                webhook that records the membership may not have landed yet, and it
                arrives out of band, so promising "you are now a member" here would
                be a claim this page cannot check. It confirms the payment and says
                what happens next instead. */}
            {checkoutResult === 'success' && (
                <Container className="mb-12">
                    <div
                        role="status"
                        className="mx-auto max-w-2xl p-6 rounded-2xl border border-rule bg-paper"
                    >
                        <h2 className="text-lg font-bold text-ink mb-2">Payment received</h2>
                        <p className="text-muted leading-relaxed">
                            Thank you for joining IFN. Stripe has emailed you a receipt. A person from the
                            IFN team will be in touch with your invitation to the private member channel
                            and the resource library.
                        </p>
                    </div>
                </Container>
            )}

            {checkoutResult === 'cancelled' && (
                <Container className="mb-12">
                    <div
                        role="status"
                        className="mx-auto max-w-2xl p-6 rounded-2xl border border-rule bg-paper"
                    >
                        <h2 className="text-lg font-bold text-ink mb-2">Checkout cancelled</h2>
                        <p className="text-muted leading-relaxed">
                            Nothing was charged. You are welcome to start again below, or{' '}
                            <Link to="/contact" className="underline underline-offset-2">
                                send us a message
                            </Link>{' '}
                            if you would rather arrange it with a person.
                        </p>
                    </div>
                </Container>
            )}

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

                        {/* "charged once" was true of the one-off annual charge this page
                            used to describe. Billing is a Stripe subscription now, so the
                            sentence would be false: it renews. Saying so here rather than
                            only on Stripe's page is the point — the reader agrees to a
                            recurring charge before they reach checkout, not during it. */}
                        <p className="mt-6 text-sm text-muted leading-relaxed">
                            The price covers a full year and renews annually until you cancel. IFN does not take
                            equity in your company, and you do not need to be a member to come to a meetup.
                        </p>

                        <div className="mt-12">
                            {/* A <Button>, where this was a <ButtonLink to="/contact">.
                                The old comment argued for a link because the CTA was
                                navigation and had to be copyable and openable in a new tab.
                                That reasoning was right and no longer applies: this performs
                                an action — it POSTs, gets a single-use session URL back, and
                                redirects. A URL like that is meaningless copied or shared, so
                                a button is the honest element and the correct role to
                                announce. shadow-* is DESIGN.md's Action Glow, which
                                buttonClasses() does not carry. */}
                            <Button
                                variant="primary"
                                size="lg"
                                className="shadow-lg"
                                onClick={startCheckout}
                                disabled={checkoutState === 'starting'}
                            >
                                {checkoutState === 'starting' ? 'Opening checkout…' : 'Become a member'}
                            </Button>

                            {checkoutState === 'error' && (
                                <p
                                    role="alert"
                                    className="mt-6 mx-auto max-w-xl text-muted leading-relaxed"
                                >
                                    We could not open checkout just now. Please try again, or{' '}
                                    <Link to="/contact" className="underline underline-offset-2">
                                        send us a message
                                    </Link>{' '}
                                    and a person from the IFN team will help you join.
                                </p>
                            )}

                            <p className="mt-6 mx-auto max-w-xl text-muted leading-relaxed">
                                Payment is handled by Stripe. You will be asked to confirm the price before
                                anything is charged, and you can cancel your membership at any time.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}
