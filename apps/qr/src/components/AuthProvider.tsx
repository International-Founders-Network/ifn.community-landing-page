import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState } from '../lib/authContext';
import { getSessionEmail, signInWithGoogle, signOut as apiSignOut } from '../lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthState['status']>('checking');
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        getSessionEmail()
            .then((current) => {
                setEmail(current);
                setStatus(current ? 'signed-in' : 'signed-out');
            })
            .catch(() => setStatus('unavailable'));
    }, []);

    const signIn = useCallback(async (credential: string) => {
        const signedIn = await signInWithGoogle(credential);
        setEmail(signedIn);
        setStatus('signed-in');
    }, []);

    const markSignedOut = useCallback(() => {
        setEmail(null);
        setStatus((prev) => (prev === 'unavailable' ? prev : 'signed-out'));
    }, []);

    const signOut = useCallback(async () => {
        try {
            await apiSignOut();
        } finally {
            markSignedOut();
        }
    }, [markSignedOut]);

    const value = useMemo(
        () => ({ status, email, signIn, signOut, markSignedOut }),
        [status, email, signIn, signOut, markSignedOut]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
