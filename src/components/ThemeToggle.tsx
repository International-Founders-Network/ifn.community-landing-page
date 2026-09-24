import { useEffect, useState } from 'react';
import { Sun, Moon, type LucideIcon } from 'lucide-react';

/**
 * The theme control. TWO STATES: light | dark. Light is the site default.
 *
 * System / prefers-color-scheme is NOT a mode. An absent or legacy `system`
 * stored value migrates to light on first load. The control never clears
 * `data-theme`; the document always carries an explicit `light` or `dark`.
 *
 * HOW THE CHOICE REACHES THE PAGE. This component sets `data-theme` on the
 * document element. `src/index.css` resolves dark tokens only via
 * `:root[data-theme="dark"]` — there is no media-query auto-switch.
 *
 * Shared STORAGE_KEY with the inline bootstrap in `index.html`. Changing it
 * here without changing it there reintroduces a flash of the wrong theme.
 */

type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'ifn-theme';

/** Light paper / dark paper from REDESIGN-PLAN.md section 4.1. */
const THEME_COLOR_LIGHT = '#FBFBFA';
const THEME_COLOR_DARK = '#131311';

const CHOICES: { id: ThemeChoice; name: string; Icon: LucideIcon }[] = [
    { id: 'light', name: 'Light theme', Icon: Sun },
    { id: 'dark', name: 'Dark theme', Icon: Moon },
];

function isThemeChoice(value: string | null): value is ThemeChoice {
    return value === 'light' || value === 'dark';
}

/**
 * Reads the stored choice. Absent key, legacy `system`, or anything
 * unrecognised → light. Also persists the migration so the next boot script
 * and this component agree without a second pass.
 */
function readStoredChoice(): ThemeChoice {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isThemeChoice(stored)) return stored;

        /* Migrate absent / 'system' / garbage → light. */
        localStorage.setItem(STORAGE_KEY, 'light');
        return 'light';
    } catch {
        /* Storage unavailable. Light is the site default. */
        return 'light';
    }
}

function applyThemeColor(choice: ThemeChoice) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute(
        'content',
        choice === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT,
    );
}

/**
 * The two layer focus ring from plan section 4.2: 2px `--paper` inner, 2px
 * `--ink` outer, no ring offset, identical in both modes.
 */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

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

    /* Apply and persist. Always write an explicit light|dark attribute. */
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', choice);
        applyThemeColor(choice);

        try {
            localStorage.setItem(STORAGE_KEY, choice);
        } catch {
            /* Storage unavailable. Choice still applies for this document. */
        }
    }, [choice]);

    /* Cross-tab sync. */
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
            <span
                id="theme-choice-label"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-muted"
            >
                Theme
            </span>

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
