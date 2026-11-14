export interface CreateLinkResponse {
    code: string;
    editToken: string;
    shortUrl: string;
}

/** Thrown on 401 so callers can drop back to the sign-in prompt. */
export class AuthRequiredError extends Error {}

async function request<T>(path: string, init: RequestInit = {}, fallbackError = 'Request failed'): Promise<T> {
    const response = await fetch(path, { credentials: 'same-origin', ...init });
    let data: { error?: string } = {};
    try {
        data = await response.json();
    } catch {
        data = {};
    }
    if (response.status === 401) throw new AuthRequiredError(data.error || 'Sign in first');
    if (!response.ok) throw new Error(data.error || fallbackError);
    return data as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export function createDynamicLink(targetUrl: string, label?: string): Promise<CreateLinkResponse> {
    return request('/api/qr-create', jsonInit('POST', { targetUrl, label }), 'Failed to create link');
}

export interface ScanEntry {
    scannedAt: string;
    userAgent: string | null;
    referrer: string | null;
}

export interface LinkDetails {
    code: string;
    targetUrl: string;
    label: string | null;
    createdAt: string;
    updatedAt: string;
    scanCount: number;
    recentScans: ScanEntry[];
}

export function getLinkByToken(token: string): Promise<LinkDetails> {
    return request(`/api/qr-manage?token=${encodeURIComponent(token)}`, {}, 'Link not found');
}

export function updateLinkTarget(token: string, targetUrl: string): Promise<LinkDetails> {
    return request(`/api/qr-manage?token=${encodeURIComponent(token)}`, jsonInit('PUT', { targetUrl }), 'Failed to update link');
}

/** The signed-in admin's email; null when signed out. Throws when sign-in is not configured. */
export async function getSessionEmail(): Promise<string | null> {
    try {
        const data = await request<{ email: string }>('/api/auth-me', {}, 'Admin sign-in is not available');
        return data.email;
    } catch (err) {
        if (err instanceof AuthRequiredError) return null;
        throw err;
    }
}

export async function signInWithGoogle(credential: string): Promise<string> {
    const data = await request<{ email: string }>('/api/auth-google', jsonInit('POST', { credential }), 'Sign-in failed');
    return data.email;
}

export async function signOut(): Promise<void> {
    await request('/api/auth-logout', jsonInit('POST', {}), 'Sign-out failed');
}
