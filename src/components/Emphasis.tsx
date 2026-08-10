interface EmphasisProps {
    children: React.ReactNode;
    /**
     * Retained but no longer read. There is one accent per mode and it measures
     * on both grounds, so there is nothing left for a ground flag to select.
     * Kept on the interface because REDESIGN-PLAN.md section 4.3 assigns this
     * component's rewrite to Phase 3; removing the member is that phase's call,
     * not this one's.
     */
    onDark?: boolean;
}

/**
 * Exactly one marked word inside an otherwise upright headline.
 *
 * The colour no longer depends on the ground, which is the whole point of the
 * Phase 2 token sweep. `--accent` measures 7.054 on `--paper` and 6.393 on
 * `--band` in light mode, and 5.517 and 5.011 in dark, so one token clears the
 * 4.5:1 floor in all four combinations. The two-branch colour logic that stood
 * here selected the retired Welcome Amber alias on light grounds, measured at
 * 2.679 against a 3:1 floor, and is deleted rather than repaired.
 *
 * The italic is untouched here. Section 4.3 retires italic from display type,
 * and that is a composition change owned by Phase 3.
 */
export function Emphasis({ children }: EmphasisProps) {
    return <span className="italic text-accent">{children}</span>;
}
