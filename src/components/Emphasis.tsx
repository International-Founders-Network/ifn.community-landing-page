interface EmphasisProps {
    children: React.ReactNode;
    /** Set on Deep Harbor / slate-900 grounds. */
    onDark?: boolean;
}

/**
 * DESIGN.md's signature typographic move: exactly one italicised word inside an
 * otherwise upright headline, set in Welcome Amber.
 *
 * The colour depends on the ground, which is why this is a component rather than
 * a class string. Welcome Amber (#f97316) measures 2.80:1 on white and 2.68:1 on
 * Harbor Mist — both below the 3:1 WCAG 1.4.3 floor for large text. Welcome
 * Amber Deep (#ea580c) clears it at 3.56:1 and 3.40:1 and is already a token in
 * the system, so no new hue enters the palette.
 *
 * On dark grounds the original #f97316 is correct and measures 5.9:1, so it stays.
 */
export function Emphasis({ children, onDark = false }: EmphasisProps) {
    return (
        <span className={onDark ? 'italic text-accent' : 'italic text-accent-on-light'}>
            {children}
        </span>
    );
}
