export interface CreateLinkResponse {
    code: string;
    editToken: string;
    shortUrl: string;
}

export async function createDynamicLink(targetUrl: string, label?: string): Promise<CreateLinkResponse> {
    const response = await fetch('/api/qr-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, label }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create link');
    return data as CreateLinkResponse;
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

export async function getLinkByToken(token: string): Promise<LinkDetails> {
    const response = await fetch(`/api/qr-manage?token=${encodeURIComponent(token)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Link not found');
    return data as LinkDetails;
}

export async function updateLinkTarget(token: string, targetUrl: string): Promise<LinkDetails> {
    const response = await fetch(`/api/qr-manage?token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update link');
    return data as LinkDetails;
}
