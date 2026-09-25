import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Loader2, Lock } from 'lucide-react';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { MEMBER_DOWNLOADS } from '../data/memberDownloads';

/**
 * THE MEMBER CENTER. Entitlement is now a server answer, not a client guess.
 *
 * `/api/member-me` verifies the `ifn_member_session` cookie and looks the
 * signed-in email up against the `memberships` table that
 * `netlify/functions/stripe-webhook.ts` keeps current. This page renders what
 * that function says and decides nothing itself.
 *
 *   SETTLED: full guides are delivered from a member center on ifn.community,
 *   not from Gumroad or any other storefront. A reader who is not entitled sees
 *   a soft call to action, never a paywall wall or an error.
 *
 *   STILL OPEN: how a real member signs in (there is no sign-in UI yet, only
 *   the preview-only `/api/member-auth-stub`), and where the PDFs live. See
 *   MEMBER-CENTER-IA.md.
 *
 * THE ADMIN ALLOWLIST IS NOT MEMBERSHIP. `netlify/functions/_lib/auth.ts`
 * exports `isAllowedEmail`, which answers "is this person an IFN operator with
 * dashboard access". It is not used anywhere in the member path, and must not
 * be: the two sets barely overlap, so conflating them would hand the member
 * library to staff and withhold it from every paying member.
 */

/**
 * The client-side preview default.
 *
 * `false` means every visitor sees whatever the server says, which is the
 * correct public behaviour. Flip it to `true` only in a local checkout to work
 * on the entitled layout without appending a query string on every reload. Do
 * not commit it as `true`.
 *
 * `?stubMember=1` does the same for one page view. NEITHER GRANTS ANYTHING.
 * They change the layout and nothing else: a download still goes through
 * `/api/member-download`, which refuses without a real session and a real
 * entitlement, so a preview cannot produce a file. The server-side counterpart
 * for previewing a signed-in state is `/api/member-auth-stub`.
 *
 * All four of these (this constant, the query parameter, the stub endpoint and
 * ALLOW_MEMBER_STUB_AUTH) are deleted together in the commit that lands real
 * sign-in.
 */
const STUB_MEMBER_DEFAULT = false;

/** What `/api/member-me` returns. Mirrors netlify/functions/member-me.ts. */
interface MemberMeResponse {
    email: string;
    stub: boolean;
    entitled: boolean;
    status?: string;
    currentPeriodEnd?: string | null;
    reason?: string;
}

type MemberState =
    | { kind: 'loading' }
    /** No member session. The soft public view: not an error, not a wall. */
    | { kind: 'anonymous' }
    | { kind: 'signed-in'; member: MemberMeResponse };

function useMemberStatus(): MemberState {
    const [state, setState] = useState<MemberState>({ kind: 'loading' });

    useEffect(() => {
        let cancelled = false;

        fetch('/api/member-me', { credentials: 'same-origin' })
            .then(async (res) => {
                if (cancelled) return;
                if (!res.ok) {
                    // 401 is the ordinary case for a visitor with no session, so
                    // it is not logged and not shown as a failure.
                    setState({ kind: 'anonymous' });
                    return;
                }
                const member = (await res.json()) as MemberMeResponse;
                if (!cancelled) setState({ kind: 'signed-in', member });
            })
            .catch(() => {
                // A network failure is indistinguishable from "not signed in"
                // from here, and the safe reading is the public one.
                if (!cancelled) setState({ kind: 'anonymous' });
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}

/** What a member sees after clicking a download. Never a raw error code. */
const DOWNLOAD_MESSAGES: Record<string, string> = {
    pdf_not_deployed:
        'This guide is not uploaded yet. Members get an email the day it goes live.',
    stub_session_cannot_download:
        'This is a preview session, so downloads are disabled. Nothing here reflects a real membership.',
    not_entitled:
        'We could not confirm an active membership for this account. Email hello@ifn.community and we will sort it out.',
    not_authenticated: 'Your session has expired. Reload the page and try again.',
    unknown_download: 'That guide is not in the member library.',
};

const DOWNLOAD_FALLBACK_MESSAGE =
    'Something went wrong fetching that guide. Try again, or email hello@ifn.community.';

interface DownloadState {
    pending: boolean;
    message?: string;
}

function DownloadRow({ id, title, description }: { id: string; title: string; description: string }) {
    const [state, setState] = useState<DownloadState>({ pending: false });

    const onDownload = useCallback(async () => {
        setState({ pending: true });
        try {
            const res = await fetch(`/api/member-download?id=${encodeURIComponent(id)}`, {
                credentials: 'same-origin',
            });
            const payload = (await res.json().catch(() => ({}))) as {
                error?: string;
                url?: string;
            };

            if (res.ok && payload.url) {
                window.location.href = payload.url;
                setState({ pending: false });
                return;
            }

            setState({
                pending: false,
                message:
                    (payload.error && DOWNLOAD_MESSAGES[payload.error]) ||
                    DOWNLOAD_FALLBACK_MESSAGE,
            });
        } catch {
            setState({ pending: false, message: DOWNLOAD_FALLBACK_MESSAGE });
        }
    }, [id]);

    return (
        <li className="rounded-2xl border border-rule bg-paper p-6">
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            <div className="mt-4 border-t border-rule pt-4">
                <button
                    type="button"
                    onClick={onDownload}
                    disabled={state.pending}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 disabled:cursor-wait disabled:text-muted disabled:no-underline"
                >
                    {state.pending ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Clock size={16} aria-hidden="true" />
                    )}
                    {state.pending ? 'Checking' : `Download ${title}`}
                </button>
                {/* aria-live, because the result of pressing the button is this
                    line of text and nothing else moves on the page. */}
                <p className="mt-3 text-sm leading-relaxed text-muted" aria-live="polite">
                    {state.message}
                </p>
            </div>
        </li>
    );
}

/** The public view. Also the view for a network failure, on purpose. */
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
                    {/* No sign-in button, because there is no sign-in. Offering a
                        control that cannot work is worse than saying so. */}
                    <p className="mt-6 text-sm leading-relaxed text-muted">
                        Already a member? Member sign in is not live on the site yet. Email
                        hello@ifn.community from the address you paid with and we will send your
                        guides directly.
                    </p>
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

/**
 * Signed in, but the membership record says no. Distinct copy from the
 * anonymous view: telling someone who is signed in to "become a member" with no
 * acknowledgement that we know who they are reads as a bug when the real cause
 * is usually a lapsed card or a different email on the Stripe receipt.
 */
function SignedInNotEntitledView({ member }: { member: MemberMeResponse }) {
    const onSignOut = useCallback(async () => {
        await fetch('/api/member-logout', { method: 'POST', credentials: 'same-origin' });
        window.location.reload();
    }, []);

    return (
        <Container>
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-rule bg-paper p-8">
                    <h2 className="text-2xl font-bold text-ink">
                        We could not find an active membership
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted">
                        You are signed in as {member.email}, but that address does not have an
                        active membership on file. If you paid with a different email address, that
                        is usually the reason. Email hello@ifn.community and we will link the two.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <ButtonLink to="/membership" variant="primary" size="lg">
                            Become a member ({MEMBERSHIP_PRICE_STANDARD}/year)
                        </ButtonLink>
                        <ButtonLink to="/resources" variant="outline" size="lg">
                            Browse free resources
                        </ButtonLink>
                    </div>
                    <button
                        type="button"
                        onClick={onSignOut}
                        className="mt-6 min-h-11 text-sm font-medium text-muted underline underline-offset-4"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </Container>
    );
}

function MemberView({ preview, email }: { preview: boolean; email?: string }) {
    return (
        <Container>
            <div className="mx-auto max-w-2xl">
                {preview ? (
                    <div className="rounded-2xl border border-rule bg-band p-6">
                        <p className="text-sm leading-relaxed text-muted">
                            Preview only. This is the entitled layout shown for design review.
                            Nothing here reflects your real membership status, and every download
                            is refused by the server.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-rule bg-band p-6">
                        <p className="text-sm leading-relaxed text-muted">
                            Your membership is active{email ? ` (${email})` : ''}. The guides are
                            still being finished, so downloads below will report that they are not
                            uploaded yet. Members get an email the day each one goes live.
                        </p>
                    </div>
                )}

                <h2 className="mt-12 text-xl font-bold text-ink">Your downloads</h2>

                {MEMBER_DOWNLOADS.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-rule bg-paper p-6">
                        <p className="text-sm leading-relaxed text-muted">
                            There is nothing in the library yet. Your membership is active and the
                            first guides land here as soon as they are ready.
                        </p>
                    </div>
                ) : (
                    <ul className="mt-4 flex flex-col gap-4">
                        {MEMBER_DOWNLOADS.map((item) => (
                            <DownloadRow
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                description={item.description}
                            />
                        ))}
                    </ul>
                )}

                <p className="mt-10 text-sm leading-relaxed text-muted">
                    Questions about your membership go to hello@ifn.community.
                </p>
            </div>
        </Container>
    );
}

function LoadingView() {
    return (
        <Container>
            <div className="mx-auto max-w-2xl rounded-2xl border border-rule bg-paper p-8">
                <p className="flex items-center gap-2 text-sm leading-relaxed text-muted">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Checking your membership
                </p>
            </div>
        </Container>
    );
}

export function Members() {
    const [searchParams] = useSearchParams();
    const state = useMemberStatus();

    /**
     * The preview flag only ever ADDS a view, and only when the server has not
     * already granted one. It cannot downgrade a real member, and it cannot
     * unlock a file: `/api/member-download` never sees it.
     */
    const previewRequested = STUB_MEMBER_DEFAULT || searchParams.get('stubMember') === '1';
    const serverEntitled = state.kind === 'signed-in' && state.member.entitled;
    const preview = previewRequested && !serverEntitled;
    const showMemberView = serverEntitled || preview;

    function body() {
        if (showMemberView) {
            return (
                <MemberView
                    preview={preview}
                    email={state.kind === 'signed-in' ? state.member.email : undefined}
                />
            );
        }
        if (state.kind === 'loading') return <LoadingView />;
        if (state.kind === 'signed-in') return <SignedInNotEntitledView member={state.member} />;
        return <NonMemberView />;
    }

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
                            {showMemberView ? 'Your member library' : 'Member library'}
                        </h1>
                        <p className="text-xl leading-relaxed text-muted">
                            The full guides live here. Nothing is sold through a storefront.
                        </p>
                    </div>
                </Container>
            </section>

            {body()}
        </div>
    );
}
