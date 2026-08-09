import { cn } from './cn';

/**
 * Styling source of truth shared by `Button` (a <button>) and `ButtonLink`
 * (an <a>/<Link>), so the two can never drift.
 *
 * This lives outside the component files on purpose: exporting non-component
 * values from a component module breaks React Fast Refresh
 * (react-refresh/only-export-components).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

// Welcome Amber carries the primary action. Its label is Deep Harbor, not white:
// white on #f97316 measures 2.80:1 and fails WCAG AA 1.4.3, navy measures 6.37:1.
const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-accent hover:bg-accent-hover text-accent-ink focus-visible:ring-accent',
    secondary: 'bg-primary hover:bg-primary-light text-white focus-visible:ring-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary',
    ghost: 'text-slate-600 hover:text-primary hover:bg-slate-100 focus-visible:ring-slate-400',
};

// On dark surfaces a navy ring is invisible — --color-primary IS slate-900.
const ON_DARK: Record<ButtonVariant, string> = {
    primary: 'focus-visible:ring-accent focus-visible:ring-offset-primary',
    secondary: 'bg-white text-primary hover:bg-slate-100 focus-visible:ring-white focus-visible:ring-offset-primary',
    outline: 'border-2 border-white/40 text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-primary',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-primary',
};

// Every size clears the 44px WCAG 2.5.5 touch target.
const SIZES: Record<ButtonSize, string> = {
    sm: 'h-11 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
};

export interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    /** Use on Deep Harbor / slate-900 surfaces. */
    onDark?: boolean;
    className?: string;
}

export function buttonClasses({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    onDark = false,
    className,
}: ButtonStyleOptions = {}) {
    return cn(
        BASE,
        VARIANTS[variant],
        onDark ? ON_DARK[variant] : '',
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className
    );
}
