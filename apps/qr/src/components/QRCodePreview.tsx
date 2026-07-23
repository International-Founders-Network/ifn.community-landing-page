import { useEffect, useRef } from 'react';
import QRCodeStyling, { type Options } from 'qr-code-styling';

interface QRCodePreviewProps {
    options: Partial<Options>;
    className?: string;
    onReady?: (qr: QRCodeStyling) => void;
}

export function QRCodePreview({ options, className, onReady }: QRCodePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);
    const optionsKey = JSON.stringify(options);

    useEffect(() => {
        if (!containerRef.current) return;
        qrRef.current = new QRCodeStyling(options);
        containerRef.current.innerHTML = '';
        qrRef.current.append(containerRef.current);
        onReady?.(qrRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        qrRef.current?.update(options);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsKey]);

    return <div ref={containerRef} className={className} />;
}

export function useDownloadableQr() {
    const instanceRef = useRef<QRCodeStyling | null>(null);

    return {
        setInstance: (qr: QRCodeStyling) => {
            instanceRef.current = qr;
        },
        download: async (name: string, extension: 'png' | 'svg' | 'jpeg' | 'webp') => {
            await instanceRef.current?.download({ name, extension });
        },
        getBlob: async (extension: 'png' | 'svg' | 'jpeg' | 'webp') => {
            return instanceRef.current?.getRawData(extension) ?? null;
        },
    };
}
