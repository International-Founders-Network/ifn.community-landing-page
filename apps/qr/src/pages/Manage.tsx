import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Check, Loader2, Save, ExternalLink, AlertCircle } from 'lucide-react';
import { getLinkByToken, updateLinkTarget, type LinkDetails } from '../lib/api';

export function Manage() {
    const { token } = useParams<{ token: string }>();
    const [details, setDetails] = useState<LinkDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draftUrl, setDraftUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!token) return;
        getLinkByToken(token)
            .then((d) => {
                setDetails(d);
                setDraftUrl(d.targetUrl);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load link'))
            .finally(() => setLoading(false));
    }, [token]);

    async function handleSave() {
        if (!token) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await updateLinkTarget(token, draftUrl);
            setDetails(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 flex justify-center">
                <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
        );
    }

    if (error && !details) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <AlertCircle className="mx-auto text-red-400 mb-4" size={32} />
                <h1 className="text-xl font-bold text-slate-800 mb-2">Link not found</h1>
                <p className="text-slate-500">{error}</p>
            </div>
        );
    }

    if (!details) return null;

    const shortUrl = `${window.location.origin}/r/${details.code}`;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Manage QR link</h1>
            <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary font-mono text-sm hover:underline mb-8"
            >
                {shortUrl.replace(/^https?:\/\//, '')}
                <ExternalLink size={13} />
            </a>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Destination</h2>
                <p className="text-xs text-slate-500 -mt-2">
                    The QR image never changes. Update where it points here, any time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="url"
                        value={draftUrl}
                        onChange={(e) => setDraftUrl(e.target.value)}
                        className="flex-grow px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                    />
                    <button
                        type="button"
                        disabled={saving || draftUrl.trim() === details.targetUrl}
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                        {saved ? 'Saved' : 'Save'}
                    </button>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BarChart3 size={14} /> Scans
                </h2>
                <p className="text-4xl font-extrabold text-slate-900">{details.scanCount}</p>
                {details.recentScans.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {details.recentScans.map((scan, i) => (
                            <div key={i} className="py-2.5 text-sm text-slate-600 flex justify-between gap-4">
                                <span>{new Date(scan.scannedAt).toLocaleString()}</span>
                                <span className="text-slate-400 truncate max-w-[50%]" title={scan.userAgent ?? undefined}>
                                    {scan.referrer || 'Direct scan'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">No scans yet. Share your QR code to start tracking.</p>
                )}
            </div>
        </div>
    );
}
