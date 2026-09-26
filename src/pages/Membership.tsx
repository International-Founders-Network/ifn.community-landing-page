import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { ButtonLink } from '../components/ButtonLink';
import { MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/** The one published plan slug. Resolved server-side; see netlify/functions/checkout.ts. */
const PLAN_SLUG = 'founding-member';

const GUEST_INCLUSIONS = [
    'Free monthly meetups in Austin (confirm dates on Luma)',
    'Open workshops when a session is open to guests',
    'Public site resources you can browse anytime',
] as const;

const MEMBER_INCLUSIONS = [
    'Private member channel (access after checkout)',
    'Monthly members-only call',
    'Member resources as we publish them',
    'Workshop member pricing when a session offers it',
] as const;

const FIR_INCLUSIONS = [
    'Everything in Member',
    'Priority workshop seats (before general registration)',
    'Up to 4 curated warm intros per year, each with a written ask',
    'Co-host one workshop or fireside with IFN this year',
    'Open-to-intros badge in the member channel',
] as const;

/**
 * Every tier card repeats the same header rows in the same order, so the title,
 * the price and the horizontal rule land on one Y across all three columns.
 * The min-heights reserve the tallest wrap a row reaches at that breakpoint: a
 * card whose eyebrow or title is shorter would otherwise pull its rule upward.
 */
const EYEBROW_ROW =
    'min-h-8 text-xs font-bold uppercase leading-4 tracking-[0.1em] text-muted lg:min-h-4';
const TITLE_ROW = 'mt-2 min-h-16 text-2xl font-bold leading-8 text-ink xl:min-h-8';
const PRICE_ROW =
    'mt-2 min-h-14 text-lg font-semibold leading-7 tabular-nums text-ink xl:min-h-7';
/** One line of text-sm/leading-relaxed; two below xl, where the FiR quote wraps. */
const PRICE_DETAIL_ROW =
    'mt-1 min-h-[2.875rem] text-sm leading-relaxed text-muted xl:min-h-[1.4375rem]';
const CARD_RULE = 'mt-6 border-0 border-t border-rule';
const BLURB_ROW = 'mt-6 leading-relaxed text-muted';

function InclusionList({ items }: { items: readonly string[] }) {
    return (
        <ul className="mt-6 flex flex-col gap-3">
            {items.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <Check
                        className="mt-1 h-4 w-4 shrink-0 text-muted"
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                    <span>{line}</span>
                </li>
            ))}
        </ul>
    );
}

export function Membership() {
    const [searchParams] = useSearchParams();
    const checkoutResult = searchParams.get('checkout');
    const [checkoutState, setCheckoutState] = useState<'idle' | 'starting' | 'error'>('idle');

    /**
     * Starts Stripe Checkout. The browser sends a plan SLUG and nothing else:
     * no price, no amount, no Stripe id. The server resolves the slug through
     * its own allowlist.
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

    const checkoutLabel =
        checkoutState === 'starting' ? 'Opening checkout…' : 'Become a member';

    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-20 overflow-hidden bg-band py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--muted),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Guest · Member · Founder in Residence
                        </p>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Membership
                        </h1>
                        <p className="text-xl leading-relaxed text-muted">
                            Guest for free meetups. Member for year-round access. Founder in Residence when you want priority seats and warm intros. Application required.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Where Stripe sends the reader back to. Reports what STRIPE said,
                not what IFN's database knows yet. */}
            {checkoutResult === 'success' && (
                <Container className="mb-12">
                    <div
                        role="status"
                        className="mx-auto max-w-2xl rounded-2xl border border-rule bg-paper p-6"
                    >
                        <h2 className="mb-2 text-lg font-bold text-ink">Payment received</h2>
                        <p className="leading-relaxed text-muted">
                            Thank you for joining IFN. Stripe has emailed you a receipt. Private member
                            channel access comes after checkout. Details for the next members-only call
                            land in the channel when scheduled. Cancel anytime via the Stripe customer
                            portal or email hello@ifn.community.
                        </p>
                    </div>
                </Container>
            )}

            {checkoutResult === 'cancelled' && (
                <Container className="mb-12">
                    <div
                        role="status"
                        className="mx-auto max-w-2xl rounded-2xl border border-rule bg-paper p-6"
                    >
                        <h2 className="mb-2 text-lg font-bold text-ink">Checkout cancelled</h2>
                        <p className="leading-relaxed text-muted">
                            Nothing was charged. You are welcome to start again below, or{' '}
                            <Link to="/contact" className="underline underline-offset-2">
                                send us a message
                            </Link>{' '}
                            if you would rather arrange it with a person.
                        </p>
                    </div>
                </Container>
            )}

            {/* Purchase / tier block hidden after successful checkout so a just-paid
                member cannot start a second subscription from the same page. */}
            {checkoutResult !== 'success' && (
                <>
                    <Container className="mb-16">
                        {/* Guest | Member | FiR: exactly three tier cards. */}
                        <div className="grid items-stretch gap-8 md:grid-cols-3">
                            {/* Guest */}
                            <div className="flex h-full flex-col rounded-2xl border border-rule bg-paper p-8">
                                <p className={EYEBROW_ROW} aria-hidden="true">
                                    &nbsp;
                                </p>
                                <h2 className={TITLE_ROW}>Guest</h2>
                                <p className={PRICE_ROW}>Free</p>
                                <p className={PRICE_DETAIL_ROW} aria-hidden="true">
                                    &nbsp;
                                </p>
                                <hr className={CARD_RULE} />
                                <p className={BLURB_ROW}>
                                    Meetup access. Paid tiers unlock the rest.
                                </p>
                                <InclusionList items={GUEST_INCLUSIONS} />
                                <div className="mt-auto pt-8">
                                    <ButtonLink
                                        href={LUMA_CALENDAR_URL}
                                        variant="secondary"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Register on Luma
                                    </ButtonLink>
                                </div>
                            </div>

                            {/* Member (default / emphasized) */}
                            <div className="flex h-full flex-col rounded-2xl border border-ink bg-paper p-8 shadow-lg ring-1 ring-ink">
                                <p className={EYEBROW_ROW}>Popular</p>
                                <h2 className={TITLE_ROW}>Member</h2>
                                <p className={PRICE_ROW}>{MEMBERSHIP_PRICE_STANDARD}/year</p>
                                <p className={PRICE_DETAIL_ROW} aria-hidden="true">
                                    &nbsp;
                                </p>
                                <hr className={CARD_RULE} />
                                <p className={BLURB_ROW}>
                                    Year-round IFN. Channel, call, and member resources.
                                </p>
                                <InclusionList items={MEMBER_INCLUSIONS} />
                                <div className="mt-auto pt-8">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full shadow-lg"
                                        onClick={startCheckout}
                                        disabled={checkoutState === 'starting'}
                                    >
                                        {checkoutLabel}
                                    </Button>
                                </div>
                            </div>

                            {/* Founder in Residence */}
                            <div
                                id="founder-in-residence"
                                className="flex h-full flex-col rounded-2xl border border-rule bg-paper p-8"
                            >
                                <p className={EYEBROW_ROW}>Limited seats · Apply</p>
                                <h2 className={TITLE_ROW}>Founder in Residence</h2>
                                <p className={PRICE_ROW}>Starting from $1,800/year</p>
                                <p className={PRICE_DETAIL_ROW} aria-hidden="true">
                                    &nbsp;
                                </p>
                                <hr className={CARD_RULE} />
                                <p className={BLURB_ROW}>
                                    Priority workshop seats, capped warm intros, one co-host
                                    slot per year. Seats limited.
                                </p>
                                <InclusionList items={FIR_INCLUSIONS} />
                                <div className="mt-auto pt-8">
                                    <ButtonLink
                                        to="/contact?intent=founder-in-residence"
                                        variant="outline"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Apply for Founder in Residence
                                    </ButtonLink>
                                </div>
                            </div>
                        </div>

                        {checkoutState === 'error' && (
                            <p
                                role="alert"
                                className="mx-auto mt-8 max-w-xl text-center leading-relaxed text-muted"
                            >
                                We could not open checkout just now. Please try again, or{' '}
                                <Link to="/contact" className="underline underline-offset-2">
                                    send us a message
                                </Link>{' '}
                                and a person from the IFN team will help you join.
                            </p>
                        )}

                        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted">
                            Billed yearly through Stripe. Cancel anytime.
                        </p>
                    </Container>

                    <Container className="mb-16">
                        <div className="mx-auto max-w-2xl rounded-2xl border border-rule bg-paper p-8">
                            <h2 className="text-xl font-bold text-ink">After you join</h2>
                            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-muted">
                                <li>You&apos;ll get a receipt from Stripe.</li>
                                <li>We&apos;ll open your private member channel after checkout.</li>
                                <li>
                                    When the next members-only call is set, details show up in the
                                    channel.
                                </li>
                                <li>Cancel anytime in Stripe, or email hello@ifn.community.</li>
                            </ol>
                        </div>
                    </Container>
                </>
            )}
        </div>
    );
}
