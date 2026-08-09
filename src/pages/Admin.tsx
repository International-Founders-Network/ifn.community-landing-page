import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { ButtonLink } from '../components/ButtonLink';
import { ROADMAP_TIERS } from '../data/roadmapData';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }) => void;
                    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
                };
            };
        };
    }
}

interface JoinApplication {
    id: number;
    name: string;
    email: string;
    linkedin: string | null;
    stage: string | null;
    created_at: string;
}

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    message: string;
    created_at: string;
}

interface EventSignup {
    id: number;
    email: string;
    created_at: string;
}

interface Submissions {
    joinApplications: JoinApplication[];
    contactMessages: ContactMessage[];
    eventSignups: EventSignup[];
}

type Tab = 'contact' | 'join' | 'events' | 'roadmap';
type DataTab = Exclude<Tab, 'roadmap'>;

const TAB_META: Record<Tab, { label: string; one: string; many: string }> = {
    contact: { label: 'Contact messages', one: 'contact message', many: 'contact messages' },
    join: { label: 'Join applications', one: 'join application', many: 'join applications' },
    events: { label: 'Event signups', one: 'event signup', many: 'event signups' },
    roadmap: { label: 'Roadmap', one: 'tier', many: 'tiers' },
};

function countLabel(n: number, tab: Tab) {
    return `${n} ${n === 1 ? TAB_META[tab].one : TAB_META[tab].many}`;
}

/** Timestamps carry their zone, as `/events` does — an unlabelled time is ambiguous. */
function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

/** Case-insensitive substring match across a row's searchable fields. */
function matches(query: string, fields: (string | null)[]) {
    if (!query) return true;
    return fields.filter(Boolean).join(' ').toLowerCase().includes(query);
}

const TH = 'py-2 pr-4 font-semibold';

function EmptyRow({ colSpan, searching }: { colSpan: number; searching: boolean }) {
    return (
        <tr>
            <td colSpan={colSpan} className="py-8 text-center text-slate-500">
                {searching ? 'Nothing matches this search.' : 'Nothing here yet.'}
            </td>
        </tr>
    );
}

function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    useEffect(() => {
        if (!clientId) return;

        const scriptId = 'google-identity-services';
        const init = () => {
            if (!window.google || !buttonRef.current) return;
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => onCredential(response.credential),
            });
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
            });
        };

        if (document.getElementById(scriptId)) {
            init();
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = init;
        document.head.appendChild(script);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    if (!clientId) {
        return (
            <p className="max-w-sm text-center text-sm text-red-700">
                Google Sign-In is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in the environment.
            </p>
        );
    }

    return <div ref={buttonRef} />;
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (email: string) => void }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCredential = async (credential: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth-google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ credential }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Sign-in failed');
            }
            onAuthenticated(data.email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
            <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-10">
                <h2 className="text-2xl font-bold text-primary">Sign in</h2>
                <p className="text-center text-sm text-slate-600">
                    Sign in with an authorized Google account to view form submissions.
                </p>
                <GoogleSignInButton onCredential={handleCredential} />
                {loading && (
                    <p role="status" className="flex items-center gap-2 text-sm text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin motion-status" aria-hidden="true" />
                        Signing in&hellip;
                    </p>
                )}
                {error && (
                    <p role="alert" className="text-center text-sm text-red-700">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

interface FilteredRows {
    contact: ContactMessage[];
    join: JoinApplication[];
    events: EventSignup[];
}

function SubmissionTable({
    tab,
    rows,
    searching,
}: {
    tab: DataTab;
    rows: FilteredRows;
    searching: boolean;
}) {
    if (tab === 'contact') {
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                        <th scope="col" className={TH}>Date</th>
                        <th scope="col" className={TH}>Name</th>
                        <th scope="col" className={TH}>Email</th>
                        <th scope="col" className={TH}>Phone</th>
                        <th scope="col" className={TH}>Company</th>
                        <th scope="col" className={TH}>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.contact.length === 0 && <EmptyRow colSpan={6} searching={searching} />}
                    {rows.contact.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100 align-top">
                            <td className="whitespace-nowrap py-2 pr-4 text-slate-500">
                                <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                            </td>
                            <td className="py-2 pr-4 font-medium">{r.name}</td>
                            <td className="py-2 pr-4">{r.email}</td>
                            <td className="py-2 pr-4">{r.phone || '—'}</td>
                            <td className="py-2 pr-4">{r.company || '—'}</td>
                            <td className="max-w-md whitespace-pre-wrap py-2 pr-4">{r.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    if (tab === 'join') {
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                        <th scope="col" className={TH}>Date</th>
                        <th scope="col" className={TH}>Name</th>
                        <th scope="col" className={TH}>Email</th>
                        <th scope="col" className={TH}>LinkedIn</th>
                        <th scope="col" className={TH}>Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.join.length === 0 && <EmptyRow colSpan={5} searching={searching} />}
                    {rows.join.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100">
                            <td className="whitespace-nowrap py-2 pr-4 text-slate-500">
                                <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                            </td>
                            <td className="py-2 pr-4 font-medium">{r.name}</td>
                            <td className="py-2 pr-4">{r.email}</td>
                            <td className="py-2 pr-4">
                                {r.linkedin ? (
                                    // Navy, not amber: this is 14px body text, so it needs 4.5:1 —
                                    // #ea580c only reaches 3.56:1 — and one amber link per row would
                                    // break the Rationed Amber Rule outright.
                                    <a
                                        href={r.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-sm text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    >
                                        Profile
                                        <span className="sr-only"> for {r.name} (opens in a new tab)</span>
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </td>
                            <td className="py-2 pr-4">{r.stage || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={TH}>Email</th>
                </tr>
            </thead>
            <tbody>
                {rows.events.length === 0 && <EmptyRow colSpan={2} searching={searching} />}
                {rows.events.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                        <td className="whitespace-nowrap py-2 pr-4 text-slate-500">
                            <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                        </td>
                        <td className="py-2 pr-4">{r.email}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function RoadmapPanel() {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th scope="col" className={TH}>Tier</th>
                    <th scope="col" className={TH}>Stage</th>
                    <th scope="col" className={TH}>Includes</th>
                </tr>
            </thead>
            <tbody>
                {ROADMAP_TIERS.map((row) => (
                    <tr key={row.tier} className="border-b border-slate-100 align-top">
                        <td className="whitespace-nowrap py-2 pr-4 font-medium">{row.tier}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-slate-500">{row.stage}</td>
                        <td className="py-2 pr-4">{row.includes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/**
 * Placeholder rows while the first load runs. `motion-status` keeps the pulse
 * alive under prefers-reduced-motion — the global rule collapses animations to
 * one 0.01ms iteration, which would freeze this into a static grey block. The
 * pulse never carries the message on its own: the panel's status line says
 * "Loading submissions…" in text, and this is hidden from assistive tech.
 */
function TableSkeleton() {
    return (
        <div className="motion-status animate-pulse space-y-3" aria-hidden="true">
            <div className="h-4 w-full rounded bg-slate-100" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded bg-slate-100" />
            ))}
        </div>
    );
}

const TAB_BASE =
    'h-11 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

function Dashboard({ onLogout }: { onLogout: () => void }) {
    const [data, setData] = useState<Submissions | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>('contact');
    const [search, setSearch] = useState('');

    const load = async () => {
        setError(null);
        setRefreshing(true);
        try {
            const res = await fetch('/api/admin-submissions', { credentials: 'same-origin' });
            if (res.status === 401) {
                onLogout();
                return;
            }
            if (!res.ok) throw new Error('Failed to load submissions');
            setData(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load submissions');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tabs = useMemo(
        () => [
            { key: 'contact' as Tab, count: data?.contactMessages.length ?? null },
            { key: 'join' as Tab, count: data?.joinApplications.length ?? null },
            { key: 'events' as Tab, count: data?.eventSignups.length ?? null },
            { key: 'roadmap' as Tab, count: null },
        ],
        [data]
    );

    const query = search.trim().toLowerCase();

    const filtered = useMemo<FilteredRows | null>(() => {
        if (!data) return null;
        return {
            contact: data.contactMessages.filter((r) =>
                matches(query, [r.name, r.email, r.company, r.message])
            ),
            join: data.joinApplications.filter((r) =>
                matches(query, [r.name, r.email, r.linkedin, r.stage])
            ),
            events: data.eventSignups.filter((r) => matches(query, [r.email])),
        };
    }, [data, query]);

    const totals: Record<DataTab, number> = {
        contact: data?.contactMessages.length ?? 0,
        join: data?.joinApplications.length ?? 0,
        events: data?.eventSignups.length ?? 0,
    };

    /**
     * One persistent status line, announced politely. It mounts with the panel
     * and only its text changes, so the loading → loaded transition is spoken
     * once instead of a region appearing and disappearing.
     */
    const statusText = (() => {
        if (tab === 'roadmap') return countLabel(ROADMAP_TIERS.length, 'roadmap');
        if (!filtered) return error ? 'Could not load submissions.' : 'Loading submissions…';
        const shown = filtered[tab].length;
        return query
            ? `Showing ${shown} of ${countLabel(totals[tab], tab)}`
            : countLabel(totals[tab], tab);
    })();

    return (
        <Container className="py-8">
            {error && (
                <p
                    role="alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </p>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div role="group" aria-label="Choose what to view" className="flex flex-wrap gap-2">
                    {tabs.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setTab(t.key)}
                                aria-pressed={active}
                                className={`${TAB_BASE} ${
                                    active
                                        ? 'bg-primary text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {TAB_META[t.key].label}
                                {t.count !== null ? ` (${t.count})` : ''}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {tab !== 'roadmap' && (
                        <>
                            <label htmlFor="admin-search" className="sr-only">
                                Search {TAB_META[tab].many}
                            </label>
                            <input
                                id="admin-search"
                                type="search"
                                placeholder="Search…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 w-48 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            />
                        </>
                    )}
                    <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin motion-status' : ''}`}
                            aria-hidden="true"
                        />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </Button>
                </div>
            </div>

            <section
                aria-labelledby="admin-panel-heading"
                className="rounded-xl border border-slate-200 bg-white"
            >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 px-4 py-3">
                    <h2 id="admin-panel-heading" className="text-sm font-bold text-primary">
                        {TAB_META[tab].label}
                    </h2>
                    <p role="status" className="text-sm text-slate-600">
                        {statusText}
                    </p>
                </div>
                <div className="overflow-x-auto p-4">
                    {tab === 'roadmap' ? (
                        <RoadmapPanel />
                    ) : filtered ? (
                        <SubmissionTable tab={tab} rows={filtered} searching={query !== ''} />
                    ) : (
                        <TableSkeleton />
                    )}
                </div>
            </section>
        </Container>
    );
}

/**
 * The chrome shared by all three states — checking, signed out, signed in — so
 * the surface carries exactly one <h1> in the DOM at every moment.
 *
 * It also supplies the <main> landmark. Page components normally must not, but
 * `/admin` is routed outside `<Layout>` (App.tsx), so nothing else provides one
 * on this route and there is no second landmark to collide with.
 */
function AdminShell({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <h1 className="text-xl font-bold text-primary">IFN Admin</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <ButtonLink to="/" variant="ghost" size="sm">
                            Back to the site
                        </ButtonLink>
                        {actions}
                    </div>
                </Container>
            </header>
            <main className="flex-grow">{children}</main>
        </div>
    );
}

/** Who is signed in, and the way out. Lives in the shell header, beside the <h1>. */
function SignedInActions({ email, onLoggedOut }: { email: string; onLoggedOut: () => void }) {
    const handleLogout = async () => {
        await fetch('/api/auth-logout', { method: 'POST', credentials: 'same-origin' });
        onLoggedOut();
    };

    return (
        <>
            <span className="text-sm text-slate-600">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
            </Button>
        </>
    );
}

export function Admin() {
    const [email, setEmail] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    /**
     * `/admin` is an internal surface. Netlify already sends
     * `X-Robots-Tag: noindex, nofollow` for this path and robots.txt disallows
     * it; this covers crawlers that execute JavaScript. Both the tag and the
     * previous <title> are restored on unmount.
     *
     * None of this is access control — that is the signed, httpOnly session
     * cookie checked server-side on every /api/admin-* request.
     */
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Admin — International Founders Network';

        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex, nofollow';
        document.head.appendChild(robots);

        return () => {
            document.title = previousTitle;
            robots.remove();
        };
    }, []);

    useEffect(() => {
        fetch('/api/auth-me', { credentials: 'same-origin' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setEmail(data?.email ?? null))
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <AdminShell>
                <Container className="py-24">
                    <p
                        role="status"
                        className="flex items-center justify-center gap-3 text-sm text-slate-600"
                    >
                        <Loader2 className="h-5 w-5 animate-spin motion-status" aria-hidden="true" />
                        Checking your sign-in&hellip;
                    </p>
                </Container>
            </AdminShell>
        );
    }

    if (!email) {
        return (
            <AdminShell>
                <LoginScreen onAuthenticated={setEmail} />
            </AdminShell>
        );
    }

    return (
        <AdminShell actions={<SignedInActions email={email} onLoggedOut={() => setEmail(null)} />}>
            <Dashboard onLogout={() => setEmail(null)} />
        </AdminShell>
    );
}
