import { useSearchParams } from 'react-router-dom';
import { Clock, Lock } from 'lucide-react';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';

/**
 * THE MEMBER CENTER IS A SCAFFOLD. There is no entitlement check here yet.
 *
 * What this page settles, and what it deliberately does not:
 *
 *   SETTLED: full guides are delivered from a member center on ifn.community,
 *   not from Gumroad or any other storefront. A reader who is not entitled sees
 *   a soft call to action, never a paywall wall or an error.
 *
 *   NOT SETTLED: how a real member is recognised. See MEMBER-CENTER-IA.md for
 *   the three open questions (sign-in mechanism, Stripe entitlement source,
 *   PDF storage). Until the first of those is answered, entitlement is a stub.
 *
 * THE ADMIN ALLOWLIST IS NOT MEMBERSHIP. `netlify/functions/_lib/auth.ts`
 * exports `isAllowedEmail`, which answers "is this person an IFN operator with
 * dashboard access". It must never be used to answer "has this person paid
 * $149". The two sets have almost no overlap, and conflating them would hand
 * the member library to staff and withhold it from every paying member. The
 * session PLUMBING in that file (sign, verify, httpOnly cookie) is a fine model
 * to copy; the allowlist is not.
 */

/**
 * The stub entitlement default, for the deploy preview.
 *
 * `false` means every visitor sees the non-member view, which is the correct
 * public behaviour. Flip it to `true` only in a local checkout to work on the
 * entitled layout without appending a query string on every reload. Do not
 * commit it as `true`: it would publish the member view to everyone.
 *
 * The `?stubMember=1` query parameter turns the entitled view on for one page
 * view. It is a preview affordance, not access control, and there is nothing
 * behind it to protect yet: the downloads are disabled placeholders and the
 * PDFs are not deployed. When a real entitlement check lands, this constant and
 * the query parameter both go, in the same commit that adds the check.
 */
const STUB_MEMBER_DEFAULT = false;

interface MemberDownload {
    /** Matches the resource id in src/data/resourcesData.ts, so the two can be joined later. */
    id: string;
    title: string;
    description: string;
}

/**
 * The three guides that go behind membership first. Ids match the entries in
 * `src/data/resourcesData.ts` on purpose: when the PDFs exist, the public
 * resource card and the member download will resolve to the same record rather
 * than to two hand-kept copies of one title.
 */
const MEMBER_DOWNLOADS: readonly MemberDownload[] = [
    {
        id: 'visa-pathways',
        title: 'US Visa Pathways for Entrepreneurs',
        description: 'O-1, E-2, L-1, H-1B, EB-5: which visa fits your situation and timeline.',
    },
    {
        id: 'entity-selection',
        title: 'Business Entity Selection Guide',
        description: 'LLC vs. C-Corp vs. S-Corp: which structure is right for your situation.',
    },
    {
        id: 'austin-ecosystem-map',
        title: 'Startup Ecosystem Map: Austin',
        description: 'The people, programs and rooms that actually matter in Austin.',
    },
] as const;

function NonMemberView() {
    return (
        <>
            <Container className="mb-16">
                <div className="mx-auto max-w-2xl rounded-2xl border border-rule bg-paper p-8">
                    <h2 className="text-2xl font-bold text-ink">This is a members area</h2>
                    <p className="mt-4 leading-relaxed text-muted">
                        The full guides are delivered here, to members, on this site. Meetups stay
                        free and the public resource library stays open. Membership is what unlocks
                        the complete PDFs.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <ButtonLink to="/membership" variant="primary" size="lg">
                            Become a member ({MEMBERSHIP_PRICE_STANDARD}/year)
                        </ButtonLink>
                        <ButtonLink to="/resources" variant="outline" size="lg">
                            Browse free resources
                        </ButtonLink>
                    </div>
                </div>
            </Container>

            <Container>
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-xl font-bold text-ink">What is behind this page</h2>
                    <ul className="mt-4 flex flex-col gap-4">
                        {MEMBER_DOWNLOADS.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-2xl border border-rule bg-paper p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-paper">
                                        <Lock size={12} aria-hidden="true" />
                                        Members
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-muted">
                                    {item.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </>
    );
}

function MemberView() {
    return (
        <Container>
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-rule bg-band p-6">
                    <p className="text-sm leading-relaxed text-muted">
                        Preview only. Entitlement is stubbed and the PDFs are not uploaded yet, so
                        every download below is disabled. Nothing here reflects your real
                        membership status.
                    </p>
                </div>

                <h2 className="mt-12 text-xl font-bold text-ink">Your downloads</h2>
                <ul className="mt-4 flex flex-col gap-4">
                    {MEMBER_DOWNLOADS.map((item) => (
                        <li key={item.id} className="rounded-2xl border border-rule bg-paper p-6">
                            <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                {item.description}
                            </p>
                            <div className="mt-4 border-t border-rule pt-4">
                                {/* Not a disabled <a>: an anchor with no href is not a
                                    control, and a disabled button is announced as one that
                                    exists but cannot be used, which is the truth here. */}
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted disabled:cursor-not-allowed"
                                >
                                    <Clock size={16} aria-hidden="true" />
                                    PDF not uploaded yet
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <p className="mt-10 text-sm leading-relaxed text-muted">
                    Questions about your membership go to hello@ifn.community.
                </p>
            </div>
        </Container>
    );
}

export function Members() {
    const [searchParams] = useSearchParams();

    /**
     * TODO(stripe-entitlement): replace this with a server answer.
     *
     * The shape it should become: a signed-in reader's email is checked against
     * the Stripe subscription state IFN already receives in
     * `netlify/functions/stripe-webhook.ts`, and the function returns
     * `{ entitled: boolean }` plus short-lived signed URLs for the PDFs. The
     * browser must not decide this, and the PDFs must not sit at a guessable
     * public path. `isAllowedEmail` from `_lib/auth.ts` is NOT the check.
     */
    const isEntitled = STUB_MEMBER_DEFAULT || searchParams.get('stubMember') === '1';

    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--muted),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Member center
                        </p>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            {isEntitled ? 'Your member library' : 'Member library'}
                        </h1>
                        <p className="text-xl leading-relaxed text-muted">
                            The full guides live here. Nothing is sold through a storefront.
                        </p>
                    </div>
                </Container>
            </section>

            {isEntitled ? <MemberView /> : <NonMemberView />}
        </div>
    );
}
