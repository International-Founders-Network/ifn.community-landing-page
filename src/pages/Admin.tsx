import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';

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

type Tab = 'contact' | 'join' | 'events';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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
            <p className="text-sm text-red-600 max-w-sm text-center">
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center gap-6 max-w-sm w-full">
                <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
                <p className="text-sm text-slate-500 text-center">
                    Sign in with an authorized Google account to view form submissions.
                </p>
                <GoogleSignInButton onCredential={handleCredential} />
                {loading && (
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                    </p>
                )}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
        </div>
    );
}

function SubmissionTable({ tab, data, search }: { tab: Tab; data: Submissions; search: string }) {
    const q = search.trim().toLowerCase();

    if (tab === 'contact') {
        const rows = data.contactMessages.filter(
            (r) => !q || [r.name, r.email, r.company, r.message].join(' ').toLowerCase().includes(q)
        );
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Phone</th>
                        <th className="py-2 pr-4">Company</th>
                        <th className="py-2 pr-4">Message</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100 align-top">
                            <td className="py-2 pr-4 whitespace-nowrap text-slate-500">{formatDate(r.created_at)}</td>
                            <td className="py-2 pr-4 font-medium">{r.name}</td>
                            <td className="py-2 pr-4">{r.email}</td>
                            <td className="py-2 pr-4">{r.phone || '—'}</td>
                            <td className="py-2 pr-4">{r.company || '—'}</td>
                            <td className="py-2 pr-4 max-w-md whitespace-pre-wrap">{r.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    if (tab === 'join') {
        const rows = data.joinApplications.filter(
            (r) => !q || [r.name, r.email, r.linkedin, r.stage].join(' ').toLowerCase().includes(q)
        );
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">LinkedIn</th>
                        <th className="py-2 pr-4">Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100">
                            <td className="py-2 pr-4 whitespace-nowrap text-slate-500">{formatDate(r.created_at)}</td>
                            <td className="py-2 pr-4 font-medium">{r.name}</td>
                            <td className="py-2 pr-4">{r.email}</td>
                            <td className="py-2 pr-4">
                                {r.linkedin ? (
                                    <a href={r.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                        Profile
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

    const rows = data.eventSignups.filter((r) => !q || r.email.toLowerCase().includes(q));
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Email</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4 whitespace-nowrap text-slate-500">{formatDate(r.created_at)}</td>
                        <td className="py-2 pr-4">{r.email}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-100 rounded w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded w-full" />
            ))}
        </div>
    );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
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
            { key: 'contact' as Tab, label: 'Contact Messages', count: data?.contactMessages.length ?? 0 },
            { key: 'join' as Tab, label: 'Join Applications', count: data?.joinApplications.length ?? 0 },
            { key: 'events' as Tab, label: 'Event Signups', count: data?.eventSignups.length ?? 0 },
        ],
        [data]
    );

    const handleLogout = async () => {
        await fetch('/api/auth-logout', { method: 'POST', credentials: 'same-origin' });
        onLogout();
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="border-b border-slate-200 bg-white">
                <Container className="py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary">Admin · Form Submissions</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{email}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Log out
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="py-8">
                {error && <p className="text-red-600 mb-4">{error}</p>}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    tab === t.key
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {t.label} ({t.count})
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-x-auto">
                    {data ? (
                        <div className={refreshing ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                            <SubmissionTable tab={tab} data={data} search={search} />
                        </div>
                    ) : (
                        <TableSkeleton />
                    )}
                </div>
            </Container>
        </div>
    );
}

export function Admin() {
    const [email, setEmail] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        fetch('/api/auth-me', { credentials: 'same-origin' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setEmail(data?.email ?? null))
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!email) {
        return <LoginScreen onAuthenticated={setEmail} />;
    }

    return <Dashboard email={email} onLogout={() => setEmail(null)} />;
}
