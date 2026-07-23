import type { CornerDotType, CornerSquareType, DotType, GradientType, Options } from 'qr-code-styling';

export interface QRStyle {
    size: number;
    margin: number;
    dotType: DotType;
    cornerSquareType: CornerSquareType;
    cornerDotType: CornerDotType;
    fgColor: string;
    bgColor: string;
    useGradient: boolean;
    gradientColor2: string;
    gradientType: GradientType;
    logo: string | null;
    logoSize: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export const defaultStyle: QRStyle = {
    size: 320,
    margin: 16,
    dotType: 'rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    useGradient: false,
    gradientColor2: '#f97316',
    gradientType: 'linear',
    logo: null,
    logoSize: 0.35,
    errorCorrectionLevel: 'Q',
};

export const dotTypeOptions: { value: DotType; label: string }[] = [
    { value: 'square', label: 'Square' },
    { value: 'dots', label: 'Dots' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'classy', label: 'Classy' },
    { value: 'classy-rounded', label: 'Classy Rounded' },
    { value: 'extra-rounded', label: 'Extra Rounded' },
];

export const cornerSquareOptions: { value: CornerSquareType; label: string }[] = [
    { value: 'square', label: 'Square' },
    { value: 'dot', label: 'Dot' },
    { value: 'extra-rounded', label: 'Rounded' },
];

export const cornerDotOptions: { value: CornerDotType; label: string }[] = [
    { value: 'square', label: 'Square' },
    { value: 'dot', label: 'Dot' },
];

export function buildQrOptions(data: string, style: QRStyle): Partial<Options> {
    return {
        width: style.size,
        height: style.size,
        data,
        margin: style.margin,
        type: 'canvas',
        qrOptions: { errorCorrectionLevel: style.logo ? 'H' : style.errorCorrectionLevel },
        dotsOptions: style.useGradient
            ? {
                type: style.dotType,
                gradient: {
                    type: style.gradientType,
                    colorStops: [
                        { offset: 0, color: style.fgColor },
                        { offset: 1, color: style.gradientColor2 },
                    ],
                },
            }
            : { type: style.dotType, color: style.fgColor },
        backgroundOptions: { color: style.bgColor },
        cornersSquareOptions: { type: style.cornerSquareType, color: style.fgColor },
        cornersDotOptions: { type: style.cornerDotType, color: style.fgColor },
        image: style.logo ?? undefined,
        imageOptions: { crossOrigin: 'anonymous', margin: 8, imageSize: style.logoSize, hideBackgroundDots: true },
    };
}
