import { useRef, useState } from 'react';
import JSZip from 'jszip';
import type QRCodeStyling from 'qr-code-styling';
import { Loader2, Download, Wand2, AlertCircle } from 'lucide-react';
import { StylePanel } from '../components/StylePanel';
import { QRCodePreview } from '../components/QRCodePreview';
import { buildQrOptions, defaultStyle, type QRStyle } from '../lib/qrStyle';
import { createDynamicLink } from '../lib/api';

interface BulkResult {
    input: string;
    qrData: string;
    error?: string;
}

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function Bulk() {
    const [raw, setRaw] = useState('');
    const [style, setStyle] = useState<QRStyle>({ ...defaultStyle, size: 220 });
    const [dynamicMode, setDynamicMode] = useState(false);
    const [results, setResults] = useState<BulkResult[]>([]);
    const [generating, setGenerating] = useState(false);
    const [zipping, setZipping] = useState(false);

    const instancesRef = useRef<Map<number, QRCodeStyling>>(new Map());

    const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    async function handleGenerate() {
        instancesRef.current.clear();
        setGenerating(true);
        const urls = Array.from(new Set(lines));

        if (!dynamicMode) {
            setResults(
                urls.map((url) => ({
                    input: url,
                    qrData: url,
                    error: isValidHttpUrl(url) ? undefined : 'Not a valid URL',
                }))
            );
            setGenerating(false);
            return;
        }

        const settled = await Promise.allSettled(
            urls.map(async (url) => {
                if (!isValidHttpUrl(url)) throw new Error('Not a valid URL');
                const link = await createDynamicLink(url);
                return link.shortUrl;
            })
        );

        setResults(
            settled.map((res, i) => ({
                input: urls[i],
                qrData: res.status === 'fulfilled' ? res.value : urls[i],
                error: res.status === 'rejected' ? (res.reason instanceof Error ? res.reason.message : 'Failed') : undefined,
            }))
        );
        setGenerating(false);
    }

    async function handleDownloadZip() {
        setZipping(true);
        try {
            const zip = new JSZip();
            let count = 0;
            for (const [index, result] of results.entries()) {
                if (result.error) continue;
                const instance = instancesRef.current.get(index);
                if (!instance) continue;
                const blob = await instance.getRawData('png');
                if (!blob) continue;
                const safeName = result.input.replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]+/gi, '_').slice(0, 60);
                zip.file(`${safeName || `qr-${index + 1}`}.png`, blob as Blob);
                count += 1;
            }
            if (count === 0) return;
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'ifn-qr-codes.zip';
            link.click();
            URL.revokeObjectURL(link.href);
        } finally {
            setZipping(false);
        }
    }

    const successCount = results.filter((r) => !r.error).length;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Bulk QR Generator</h1>
                <p className="text-slate-500 mt-2">Paste a list of URLs, style them once, and export every QR code as a ZIP.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                        <label className="block text-sm font-medium text-slate-700">URLs (one per line)</label>
                        <textarea
                            rows={8}
                            value={raw}
                            onChange={(e) => setRaw(e.target.value)}
                            placeholder={'https://ifn.community/events\nhttps://ifn.community/resources\nhttps://lu.ma/IFN_ATX'}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm font-mono resize-none"
                        />
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dynamicMode}
                                    onChange={(e) => setDynamicMode(e.target.checked)}
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                />
                                Make each one trackable (dynamic)
                            </label>
                            <button
                                type="button"
                                disabled={generating || lines.length === 0}
                                onClick={handleGenerate}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                            >
                                {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                {generating ? 'Generating...' : `Generate ${lines.length || ''} QR code${lines.length === 1 ? '' : 's'}`}
                            </button>
                        </div>
                    </div>

                    {results.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {successCount} of {results.length} generated
                                </p>
                                <button
                                    type="button"
                                    disabled={zipping || successCount === 0}
                                    onClick={handleDownloadZip}
                                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                                >
                                    {zipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                    Download all (ZIP)
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {results.map((result, index) => (
                                    <div
                                        key={`${result.input}-${index}`}
                                        className="border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2"
                                    >
                                        {result.error ? (
                                            <div className="w-full aspect-square flex flex-col items-center justify-center text-red-500 text-xs gap-1 text-center px-2">
                                                <AlertCircle size={18} />
                                                {result.error}
                                            </div>
                                        ) : (
                                            <QRCodePreview
                                                options={buildQrOptions(result.qrData, style)}
                                                onReady={(qr) => instancesRef.current.set(index, qr)}
                                            />
                                        )}
                                        <p className="text-xs text-slate-500 truncate w-full text-center" title={result.input}>
                                            {result.input}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <StylePanel style={style} onChange={setStyle} />
                </div>
            </div>
        </div>
    );
}
