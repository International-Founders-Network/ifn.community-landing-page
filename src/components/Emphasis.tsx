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
 * THE ITALIC IS GONE, AND THIS COMMENT USED TO SAY IT WAS DEFERRED. It read
 * "The italic is untouched here. Section 4.3 retires italic from display type,
 * and that is a composition change owned by Phase 3." That is the change, made
 * at the founder's direction: every emphasised word in a page title now sets
 * upright.
 *
 * ONE CLASS WAS REMOVED AND NOTHING ELSE. `text-accent` stays, so the word is
 * still marked and still measures as documented above; no call site moved, no
 * word changed, and the eleven titles using this component keep the exact
 * phrases they had.
 *
 * IT IS ALSO WHAT SECTION 4.3 ASKED FOR ALL ALONG. That section retires italic
 * from display type, and the hero's own weight-ladder note gives the reason in
 * terms this component shares: italic clipped a descender there, and it carried
 * emphasis in a hue, which a colourblind reader cannot see. The second half
 * still applies here, because `--accent` alone is what marks the word once the
 * italic is gone. That is a smaller worry on a display-scale title than in body
 * copy (the accent-on-ink 2.547 reading that drives the 3px rule elsewhere is a
 * body-copy measurement), but it is the reason not to reach for italic again as
 * a "safe" second signal: the fix for a title needing more emphasis is a weight
 * step, which is what the rest of this page's headings already use.
 */
export function Emphasis({ children }: EmphasisProps) {
    return <span className="text-accent">{children}</span>;
}
