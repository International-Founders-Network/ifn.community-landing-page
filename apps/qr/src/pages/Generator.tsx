import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as LinkIcon, Loader2, Check, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import type QRCodeStyling from 'qr-code-styling';
import { ContentTypeTabs } from '../components/ContentTypeTabs';
import { ContentFields } from '../components/ContentFields';
import { StylePanel } from '../components/StylePanel';
import { DownloadBar } from '../components/DownloadBar';
import { QRCodePreview } from '../components/QRCodePreview';
import { buildQrData, emptyFields, isFieldsEmpty, type QRContentType, type QRFieldsByType } from '../lib/qrContent';
import { buildQrOptions, defaultStyle, type QRStyle } from '../lib/qrStyle';
import { createDynamicLink, updateLinkTarget, type CreateLinkResponse } from '../lib/api';

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function Generator() {
    const [contentType, setContentType] = useState<QRContentType>('url');
    const [fields, setFields] = useState<QRFieldsByType>(emptyFields);
    const [style, setStyle] = useState<QRStyle>(defaultStyle);

    const [dynamicMode, setDynamicMode] = useState(false);
    const [dynamicResult, setDynamicResult] = useState<CreateLinkResponse | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [copied, setCopied] = useState<'short' | 'manage' | null>(null);

    const qrRef = useRef<QRCodeStyling | null>(null);
    const syncedUrlRef = useRef<string>('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const staticData = useMemo(
        () => buildQrData(contentType, fields[contentType]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [contentType, JSON.stringify(fields[contentType])]
    );
    const empty = isFieldsEmpty(contentType, fields[contentType]);

    const qrData = dynamicMode && dynamicResult ? dynamicResult.shortUrl : staticData || 'https://ifn.community';
    const options = useMemo(() => buildQrOptions(qrData, style), [qrData, style]);

    // Reset dynamic link state when switching away from URL or turning dynamic mode off
    useEffect(() => {
        if (contentType !== 'url' || !dynamicMode) {
            setDynamicResult(null);
            setCreateError(null);
            setSyncStatus('idle');
            syncedUrlRef.current = '';
        }
    }, [contentType, dynamicMode]);

    // Keep an already-created dynamic link's destination in sync as the user edits the URL
    useEffect(() => {
        if (!dynamicResult) return;
        const url = fields.url.url.trim();
        if (!url || !isValidHttpUrl(url) || url === syncedUrlRef.current) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSyncStatus('saving');
        debounceRef.current = setTimeout(async () => {
            try {
                await updateLinkTarget(dynamicResult.editToken, url);
                syncedUrlRef.current = url;
                setSyncStatus('saved');
            } catch {
                setSyncStatus('error');
            }
        }, 700);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.url.url, dynamicResult]);

    async function handleCreateDynamicLink() {
        const url = fields.url.url.trim();
        if (!isValidHttpUrl(url)) {
            setCreateError('Enter a valid URL starting with http:// or https:// first');
            return;
        }
        setCreating(true);
        setCreateError(null);
        try {
            const result = await createDynamicLink(url);
            setDynamicResult(result);
            syncedUrlRef.current = url;
            setSyncStatus('saved');
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create trackable link');
        } finally {
            setCreating(false);
        }
    }

    async function handleCopy(text: string, which: 'short' | 'manage') {
        await navigator.clipboard.writeText(text);
        setCopied(which);
        setTimeout(() => setCopied(null), 1500);
    }

    async function handleDownload(extension: 'png' | 'svg' | 'jpeg') {
        await qrRef.current?.download({ name: `ifn-qr-${contentType}`, extension });
    }

    const manageUrl = dynamicResult ? `${window.location.origin}/manage/${dynamicResult.editToken}` : null;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">QR Code Generator</h1>
                <p className="text-slate-500 mt-2">Design a beautiful, on-brand QR code in seconds &mdash; free, no account required.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-8 items-start">
                {/* Content */}
                <div className="space-y-6 order-1">
                    <ContentTypeTabs value={contentType} onChange={setContentType} />

                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <ContentFields
                            type={contentType}
                            fields={fields[contentType]}
                            onChange={(value) => setFields((prev) => ({ ...prev, [contentType]: value }))}
                        />
                    </div>

                    {contentType === 'url' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dynamicMode}
                                    onChange={(e) => setDynamicMode(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 accent-primary cursor-pointer"
                                />
                                <span>
                                    <span className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <LinkIcon size={14} /> Make it a trackable (dynamic) QR
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-0.5">
                                        The QR image stays the same forever &mdash; you can change where it points and see scan
                                        counts, without reprinting.
                                    </span>
                                </span>
                            </label>

                            {dynamicMode && !dynamicResult && (
                                <div>
                                    <button
                                        type="button"
                                        disabled={creating || empty}
                                        onClick={handleCreateDynamicLink}
                                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                                    >
                                        {creating ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                                        {creating ? 'Creating...' : 'Generate trackable link'}
                                    </button>
                                    {createError && (
                                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                            <AlertCircle size={12} /> {createError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {dynamicResult && (
                                <div className="space-y-2 bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                                    <div className="flex items-center justify-between gap-2">
                                        <a
                                            href={dynamicResult.shortUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-mono text-primary hover:underline flex items-center gap-1 truncate"
                                        >
                                            {dynamicResult.shortUrl.replace(/^https?:\/\//, '')}
                                            <ExternalLink size={12} className="flex-shrink-0" />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(dynamicResult.shortUrl, 'short')}
                                            className="text-slate-400 hover:text-primary p-1"
                                        >
                                            {copied === 'short' ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {syncStatus === 'saving' && 'Saving destination...'}
                                        {syncStatus === 'saved' && 'Destination in sync.'}
                                        {syncStatus === 'error' && 'Could not save latest destination &mdash; try again.'}
                                    </div>
                                    <div className="pt-1 border-t border-slate-200 flex items-center justify-between gap-2">
                                        <span className="text-xs text-slate-500">Save this link to edit or view scans later:</span>
                                        <button
                                            type="button"
                                            onClick={() => manageUrl && handleCopy(manageUrl, 'manage')}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                                        >
                                            {copied === 'manage' ? <Check size={12} /> : <Copy size={12} />}
                                            Copy manage link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="order-3 lg:order-2 lg:sticky lg:top-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center gap-5">
                        <div className="rounded-xl overflow-hidden shadow-sm">
                            <QRCodePreview options={options} onReady={(qr) => (qrRef.current = qr)} />
                        </div>
                        <DownloadBar onDownload={handleDownload} disabled={empty} />
                        {empty && <p className="text-xs text-slate-400 text-center">Fill in the fields to generate your QR code.</p>}
                    </div>
                </div>

                {/* Style */}
                <div className="order-2 lg:order-3 bg-white rounded-2xl border border-slate-200 p-5">
                    <StylePanel style={style} onChange={setStyle} />
                </div>
            </div>
        </div>
    );
}
