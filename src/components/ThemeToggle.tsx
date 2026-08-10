import { useEffect, useState } from 'react';
import { Sun, Monitor, Moon, type LucideIcon } from 'lucide-react';

/**
 * The theme control. Closes the "Dark Mode Support: theme toggle" item in
 * BACKLOG.md and the last outstanding piece of Phase 2 in REDESIGN-PLAN.md
 * section 9.
 *
 * THREE STATES, NOT TWO, and the third is the default. A two state switch
 * cannot express "follow my OS", which is what most readers actually want and
 * what skill section 8.C makes the default behaviour. So the choice is light,
 * system or dark, and `system` is what an absent stored value means.
 *
 * HOW THE CHOICE REACHES THE PAGE. This component sets exactly one thing: the
 * `data-theme` attribute on the document element. `src/index.css` does the rest
 * and needs no change, because it already declares the two halves that make an
 * override win in BOTH directions:
 *
 *   choice   OS      selector that governs                        result
 *   system   light   bare `:root`                                 light
 *   system   dark    `@media (prefers-color-scheme: dark)`        dark
 *                    scoped to `:root:not([data-theme="light"])`
 *   light    dark    the media guard FAILS, nothing else matches, light
 *                    so the bare `:root` values stand
 *   dark     light   `:root[data-theme="dark"]`                   dark
 *
 * That is why `system` REMOVES the attribute rather than writing
 * `data-theme="system"`: the media guard is spelled as a negation of
 * `[data-theme="light"]`, so any value other than `light` would leave the guard
 * passing, but an absent attribute is the only value that also leaves the
 * `[data-theme="dark"]` rule unmatched. Absence is the system state, in the
 * stylesheet and in `localStorage` alike.
 *
 * WHAT THIS COMPONENT DELIBERATELY DOES NOT DO. It never resolves the theme.
 * There is no `matchMedia` listener, no `getComputedStyle`, and no notion here
 * of which mode is currently painted, because nothing in the UI depends on it:
 * the three controls reflect the CHOICE, and CSS resolves the choice into a
 * palette. A resolved-theme mirror in React state would be a second source of
 * truth that can disagree with the stylesheet, which is the failure this whole
 * token layer is built to avoid.
 */

type ThemeChoice = 'light' | 'system' | 'dark';

/**
 * Shared with the inline bootstrap script in `index.html`, which reads this
 * exact key before first paint. Changing it here without changing it there
 * reintroduces the flash of the wrong theme.
 */
const STORAGE_KEY = 'ifn-theme';

/**
 * Lucide, permitted by skill section 3.C because this project already depends
 * on it, and it is the one icon family in the tree. `strokeWidth` is 1.5
 * everywhere per plan section 11, and every glyph is `aria-hidden` because the
 * accessible name is carried by the sr-only text beside it.
 *
 * The names are self sufficient rather than relying on the group label: a
 * button announced as "Light" alone is ambiguous out of context, and not every
 * screen reader announces the enclosing group on entry.
 */
const CHOICES: { id: ThemeChoice; name: string; Icon: LucideIcon }[] = [
    { id: 'light', name: 'Light theme', Icon: Sun },
    { id: 'system', name: 'Match system theme', Icon: Monitor },
    { id: 'dark', name: 'Dark theme', Icon: Moon },
];

function isThemeChoice(value: string | null): value is ThemeChoice {
    return value === 'light' || value === 'system' || value === 'dark';
}

/**
 * Reads the stored choice, tolerating both a missing key and storage being
 * unavailable outright (Safari private browsing throws on access, it does not
 * return null). Anything unrecognised degrades to `system`, which is also what
 * the bootstrap script in `index.html` does with a value it does not know.
 */
function readStoredChoice(): ThemeChoice {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isThemeChoice(stored) ? stored : 'system';
    } catch {
        /* Storage unavailable. The system default is the correct fallback. */
        return 'system';
    }
}

/**
 * The two layer focus ring from plan section 4.2: 2px `--paper` inner, 2px
 * `--ink` outer, no ring offset, identical in both modes and NOT reversed for
 * dark (the two tokens already swap, so a reversal inverts it twice and
 * collapses the outer layer into the page ground at 1.000).
 *
 * `src/lib/buttonStyles.ts` holds the canonical write up of why this is an
 * arbitrary property rather than the `shadow-[...]` utility (the utility form
 * routes both layers through `--tw-shadow-color`, so any shadow-colour utility
 * reaching the element repaints the whole ring in one colour) and why
 * `outline-hidden` is the spelling that keeps a focus indicator under
 * `forced-colors: active`. That constant is module private there, and
 * `Footer.tsx` already carries the same duplicate for the same reason; what
 * matters is that all three emit identical geometry.
 *
 * The novel case here is the ring around the SELECTED chip, which is an
 * `--ink` fill sitting on the footer's `--paper` ground. Both layers measure:
 * the outer `--ink` reads 17.965 against the `--paper` ground it extends onto,
 * and the inner `--paper` reads 17.965 against the `--ink` chip it hugs. This
 * is not the "outer --ink is 1.000" row in `buttonStyles.ts`, which describes a
 * control sitting ON an ink GROUND. Here the ground is paper and the fill is
 * ink, so the layer that vanishes there is the layer that carries it here.
 */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

/**
 * `h-11 w-11` is the 44px minimum target, the same floor the footer's channel
 * row and text links already hold. `rounded-full` because plan section 4.4
 * gives every discrete interactive control the full pill and reserves radius 0
 * for surfaces and full-width rows; three 44px chips are discrete controls.
 *
 * The colour pairs are `buttonStyles.ts`'s own vocabulary rather than new
 * decisions. Selected is the `secondary` variant (`--paper` on an `--ink`
 * fill, 17.965 in both modes, fill boundary 17.965 against the `--paper`
 * ground). Unselected is `ghost` (`--muted` glyph at 6.601 light and 7.496
 * dark, promoting to `--ink` on a `--band` hover fill at 16.281 and 16.318).
 *
 * FORCED COLOURS. Windows High Contrast Mode replaces author background
 * colours, so `bg-ink` alone would render the selected chip identically to the
 * other two. Assistive tech is unaffected (`aria-pressed` carries the state),
 * but a sighted HCM user would lose it, so the selected chip restates itself in
 * the system `Highlight` pair, which forced colours preserves.
 *
 * The colour transition is 150ms to match every other control in the tree.
 * Reduced motion is honoured by the blanket block in `src/index.css`, which
 * flattens `transition-duration` to 0.01ms with no exceptions, so the state
 * change becomes instantaneous rather than animated. No new motion is
 * introduced here and there is no decorative status dot, which skill section
 * 9.F bans outright.
 */
const CHIP_BASE =
    'inline-flex h-11 w-11 items-center justify-center rounded-full ' +
    'transition-colors duration-150 ease-out ' +
    FOCUS_RING;

const CHIP_SELECTED =
    'bg-ink text-paper ' +
    'forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]';

const CHIP_UNSELECTED = 'text-muted hover:bg-band hover:text-ink';

export function ThemeToggle() {
    const [choice, setChoice] = useState<ThemeChoice>(readStoredChoice);

    /* Apply and persist. `system` clears both the attribute and the key, so the
       absent-means-system invariant holds in the DOM and in storage together. */
    useEffect(() => {
        const root = document.documentElement;

        if (choice === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', choice);
        }

        try {
            if (choice === 'system') {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, choice);
            }
        } catch {
            /* Storage unavailable. The choice still applies for this document,
               it simply will not survive a reload. */
        }
    }, [choice]);

    /* Cross tab sync. `storage` fires only in OTHER documents on the same
       origin, so this cannot loop with the effect above. A null `key` means
       the whole store was cleared, which is also a change we should follow. */
    useEffect(() => {
        function handleStorage(event: StorageEvent) {
            if (event.key !== null && event.key !== STORAGE_KEY) return;
            setChoice(readStoredChoice());
        }

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="flex items-center gap-3">
            {/*
             * The label is a disambiguator, not decoration. These chips sit
             * beside the footer's channel row, which renders 44px round
             * `--muted` icon buttons with an `--ink` hover: without a boundary
             * and a name, three more round icons read as three more social
             * links. The 1px `--rule` border below measures 4.063 on `--paper`
             * in light and 4.005 in dark, and it is full opacity 1px rather
             * than an alpha hairline for the reason plan section 4.2 gives: at
             * 75% coverage the same grey drops to 2.665 and 2.764, under the
             * 3:1 floor.
             */}
            <span
                id="theme-choice-label"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-muted"
            >
                Theme
            </span>

            {/*
             * `role="group"` with three `aria-pressed` buttons rather than a
             * radiogroup. A `role="radiogroup"` is only honest with roving
             * tabindex and arrow key selection, which is more machinery than a
             * three item control warrants; and native radios would have to be
             * visually hidden, which moves the focused element off the visible
             * 44px chip and puts the `forced-colors` outline on an element the
             * reader cannot see. Three real buttons keep the focused element
             * and the visible control the same object, so the focus ring here
             * behaves exactly like every other control in the tree.
             */}
            <div
                role="group"
                aria-labelledby="theme-choice-label"
                className="flex items-center rounded-full border border-rule p-0.5"
            >
                {CHOICES.map(({ id, name, Icon }) => {
                    const selected = id === choice;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setChoice(id)}
                            className={
                                CHIP_BASE +
                                ' ' +
                                (selected ? CHIP_SELECTED : CHIP_UNSELECTED)
                            }
                        >
                            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                            <span className="sr-only">{name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
