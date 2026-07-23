import { useRef } from 'react';
import { ImageUp, X, Palette } from 'lucide-react';
import clsx from 'clsx';
import {
    cornerDotOptions,
    cornerSquareOptions,
    dotTypeOptions,
    type QRStyle,
} from '../lib/qrStyle';

interface StylePanelProps {
    style: QRStyle;
    onChange: (style: QRStyle) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
            {children}
        </div>
    );
}

function SegmentedControl<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div className="grid grid-cols-3 gap-1.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={clsx(
                        'px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        value === opt.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">{label}</span>
            <span className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs font-mono text-slate-500 uppercase">{value}</span>
            </span>
        </label>
    );
}

export function StylePanel({ style, onChange }: StylePanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function set<K extends keyof QRStyle>(key: K, value: QRStyle[K]) {
        onChange({ ...style, [key]: value });
    }

    function handleLogoFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => set('logo', reader.result as string);
        reader.readAsDataURL(file);
    }

    return (
        <div className="space-y-6">
            <Section title="Shape">
                <div>
                    <p className="text-sm text-slate-600 mb-2">Dot style</p>
                    <SegmentedControl value={style.dotType} options={dotTypeOptions} onChange={(v) => set('dotType', v)} />
                </div>
                <div>
                    <p className="text-sm text-slate-600 mb-2">Corner square</p>
                    <SegmentedControl
                        value={style.cornerSquareType}
                        options={cornerSquareOptions}
                        onChange={(v) => set('cornerSquareType', v)}
                    />
                </div>
                <div>
                    <p className="text-sm text-slate-600 mb-2">Corner dot</p>
                    <SegmentedControl value={style.cornerDotType} options={cornerDotOptions} onChange={(v) => set('cornerDotType', v)} />
                </div>
            </Section>

            <Section title="Color">
                <ColorField label="Foreground" value={style.fgColor} onChange={(v) => set('fgColor', v)} />
                <ColorField label="Background" value={style.bgColor} onChange={(v) => set('bgColor', v)} />
                <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Palette size={14} /> Use gradient
                    </span>
                    <input
                        type="checkbox"
                        checked={style.useGradient}
                        onChange={(e) => set('useGradient', e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                    />
                </label>
                {style.useGradient && (
                    <>
                        <ColorField label="Gradient end" value={style.gradientColor2} onChange={(v) => set('gradientColor2', v)} />
                        <div>
                            <p className="text-sm text-slate-600 mb-2">Gradient type</p>
                            <SegmentedControl
                                value={style.gradientType}
                                options={[
                                    { value: 'linear', label: 'Linear' },
                                    { value: 'radial', label: 'Radial' },
                                ]}
                                onChange={(v) => set('gradientType', v)}
                            />
                        </div>
                    </>
                )}
            </Section>

            <Section title="Logo">
                {style.logo ? (
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                        <img src={style.logo} alt="Logo preview" className="w-10 h-10 object-contain rounded" />
                        <div className="flex-grow">
                            <p className="text-xs text-slate-500 mb-1">Logo size</p>
                            <input
                                type="range"
                                min={0.15}
                                max={0.45}
                                step={0.01}
                                value={style.logoSize}
                                onChange={(e) => set('logoSize', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => set('logo', null)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove logo"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary transition-colors"
                    >
                        <ImageUp size={16} />
                        Upload logo
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoFile(file);
                        e.target.value = '';
                    }}
                />
                {style.logo && (
                    <p className="text-xs text-slate-400">
                        Tip: error correction is set to High automatically when a logo is present, so the code still scans.
                    </p>
                )}
            </Section>

            <Section title="Size & quality">
                <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Size</span>
                        <span className="font-mono text-xs">{style.size}px</span>
                    </div>
                    <input
                        type="range"
                        min={200}
                        max={800}
                        step={10}
                        value={style.size}
                        onChange={(e) => set('size', Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Margin</span>
                        <span className="font-mono text-xs">{style.margin}px</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={40}
                        step={2}
                        value={style.margin}
                        onChange={(e) => set('margin', Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                </div>
                {!style.logo && (
                    <div>
                        <p className="text-sm text-slate-600 mb-2">Error correction</p>
                        <SegmentedControl
                            value={style.errorCorrectionLevel}
                            options={[
                                { value: 'L', label: 'L' },
                                { value: 'M', label: 'M' },
                                { value: 'Q', label: 'Q' },
                                { value: 'H', label: 'H' },
                            ]}
                            onChange={(v) => set('errorCorrectionLevel', v)}
                        />
                    </div>
                )}
            </Section>
        </div>
    );
}
