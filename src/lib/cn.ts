import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The single class-name merger for the whole app.
 *
 * `clsx` resolves conditionals, `twMerge` then drops earlier Tailwind utilities
 * that a later one overrides — which is what lets callers pass a `className`
 * escape hatch (or an `onDark` override block) that genuinely wins instead of
 * producing two competing utilities whose outcome depends on stylesheet order.
 *
 * It lives here rather than in a component file because exporting non-component
 * values from a component module breaks React Fast Refresh
 * (react-refresh/only-export-components), and because three call sites had
 * independently declared their own byte-identical copy.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
