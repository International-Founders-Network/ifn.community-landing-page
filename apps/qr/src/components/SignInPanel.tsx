import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../lib/authContext';

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

const GSI_SCRIPT_ID = 'google-identity-services';

function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
    const buttonRef = useRef<HTMLDivElement>(null);
    // The client ID is public by design; it is the only auth value the browser gets.
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    useEffect(() => {
        if (!clientId) return;
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

        const existing = document.getElementById(GSI_SCRIPT_ID);
        if (existing) {
            if (window.google) init();
            else existing.addEventListener('load', init, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = GSI_SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = init;
        document.head.appendChild(script);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    if (!clientId) {
        return <p className="text-sm text-slate-500">Google Sign-In is not configured for this build.</p>;
    }
    return <div ref={buttonRef} />;
}

/**
 * Shown wherever a short link would be created, edited or viewed. Static QR
 * codes never need it.
 */
export function SignInPanel({ reason }: { reason: string }) {
    const { status, signIn } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (status === 'checking') {
        return (
            <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Checking sign-in...
            </p>
        );
    }

    if (status === 'unavailable') {
        return (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle size={14} /> Admin sign-in is not configured on this site, so trackable links are unavailable.
            </p>
        );
    }

    async function handleCredential(credential: string) {
        setBusy(true);
        setError(null);
        try {
            await signIn(credential);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign-in failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-3" data-testid="sign-in-panel">
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
                <Lock size={14} /> {reason}
            </p>
            <GoogleSignInButton onCredential={handleCredential} />
            {busy && (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin" /> Signing in...
                </p>
            )}
            {error && (
                <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle size={14} /> {error}
                </p>
            )}
        </div>
    );
}
