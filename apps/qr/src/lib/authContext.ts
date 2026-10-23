import { createContext, useContext } from 'react';

/**
 * Who is signed in to qr.ifn.community. Nothing here is access control: the
 * server checks the httpOnly session cookie on every short-link request. This
 * only decides whether to show the sign-in prompt.
 */
export interface AuthState {
    /** 'checking' until /api/auth-me answers; 'unavailable' when admin sign-in is not configured. */
    status: 'checking' | 'signed-out' | 'signed-in' | 'unavailable';
    email: string | null;
    signIn: (credential: string) => Promise<void>;
    signOut: () => Promise<void>;
    /** Call when an API request answers 401: the session expired or was revoked. */
    markSignedOut: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
    const value = useContext(AuthContext);
    if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
    return value;
}
