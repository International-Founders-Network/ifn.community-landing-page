import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Container } from '../Container';
import { Button } from '../Button';
import { ButtonLink } from '../ButtonLink';

/**
 * Admin sign-in and chrome, shared by /admin and /admin/blog/:slug so every
 * admin route runs the same session check (GET /api/auth-me) and shows the
 * same Google sign-in when it fails. None of this is access control: that is
 * the signed, httpOnly session cookie checked server-side on every
 * /api/admin-* request.
 */

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
            <p className="max-w-sm text-center text-sm text-ink">
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
            <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-rule bg-paper p-10">
                <h2 className="text-2xl font-bold text-ink">Sign in</h2>
                <p className="text-center text-sm text-muted">
                    Sign in with an authorized Google account to view form submissions.
                </p>
                <GoogleSignInButton onCredential={handleCredential} />
                {loading && (
                    <p role="status" className="flex items-center gap-2 text-sm text-muted">
                        <Loader2 className="h-4 w-4 animate-spin motion-status" aria-hidden="true" />
                        Signing in&hellip;
                    </p>
                )}
                {error && (
                    <p role="alert" className="text-center text-sm text-ink">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}


/**
 * The chrome shared by all three states (checking, signed out, signed in), so
 * the surface carries exactly one <h1> in the DOM at every moment.
 *
 * It also supplies the <main> landmark. Page components normally must not, but
 * `/admin` is routed outside `<Layout>` (App.tsx), so nothing else provides one
 * on this route and there is no second landmark to collide with.
 */
export function AdminShell({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-band">
            <header className="border-b border-rule bg-paper">
                <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <h1 className="text-xl font-bold text-ink">IFN Admin</h1>
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
            <span className="text-sm text-muted">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
            </Button>
        </>
    );
}

/**
 * Checks the session, then renders the sign-in or `children(email, signOut)`
 * inside the shell. signOut is also what a 401 from any admin call should
 * invoke: it drops back to the sign-in screen.
 */
export function AdminGate({
    children,
}: {
    children: (email: string, signOut: () => void) => ReactNode;
}) {
    const [email, setEmail] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        fetch('/api/auth-me', { credentials: 'same-origin' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setEmail(data?.email ?? null))
            .catch(() => setEmail(null))
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <AdminShell>
                <Container className="py-24">
                    <p role="status" className="flex items-center justify-center gap-3 text-sm text-muted">
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

    const signOut = () => setEmail(null);
    return (
        <AdminShell actions={<SignedInActions email={email} onLoggedOut={signOut} />}>
            {children(email, signOut)}
        </AdminShell>
    );
}
