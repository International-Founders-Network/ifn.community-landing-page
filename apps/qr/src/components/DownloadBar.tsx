import { Download } from 'lucide-react';

interface DownloadBarProps {
    onDownload: (extension: 'png' | 'svg' | 'jpeg') => void;
    disabled?: boolean;
}

export function DownloadBar({ onDownload, disabled }: DownloadBarProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {(['png', 'svg', 'jpeg'] as const).map((ext) => (
                <button
                    key={ext}
                    type="button"
                    disabled={disabled}
                    onClick={() => onDownload(ext)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Download size={14} />
                    {ext.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
