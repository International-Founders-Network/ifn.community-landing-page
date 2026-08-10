import { cn } from './cn';

/**
 * Styling source of truth shared by `Button` (a <button>) and `ButtonLink`
 * (an <a>/<Link>), so the two can never drift.
 *
 * This lives outside the component files on purpose: exporting non-component
 * values from a component module breaks React Fast Refresh
 * (react-refresh/only-export-components).
 *
 * Restyled onto the Phase 1 token layer of REDESIGN-PLAN.md ("The Sign").
 * Every colour below is a semantic token from plan section 4.1 and every ratio
 * quoted in a comment was recomputed with the WCAG relative luminance formula
 * rather than copied. No hex is written in this file.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * THE TWO LAYER FOCUS RING (plan section 4.2).
 *
 * 2px `--paper` inner, then 2px `--ink` outer, with NO ring offset. This
 * replaces the shipped two-utility ring plus offset pattern, which assumed the
 * ground under the control was a known solid colour and had to name that
 * ground per call site.
 *
 * Identical in both modes. There is NO dark mode reversal, and reintroducing
 * one is a blocking defect: `--paper` is always the page colour and `--ink` is
 * always the type colour, so the construction already inverts itself when the
 * tokens swap. Reversing it on top of that swap inverts it twice and the outer
 * layer becomes the page ground at 1.000.
 *
 * Why it survives any ground, measured rather than assumed. The two layers
 * contrast with EACH OTHER at 17.965, so the ring reads as a shape, and the
 * better of the two layers carries the 3:1 non text floor on its own:
 *
 *   on --paper   outer --ink 17.965      on --band          outer --ink 16.281
 *   on --accent  inner --paper  7.054    on --accent-plate  inner --paper 7.054
 *   on --ink slab (bg-primary)  inner --paper 17.965  (outer --ink is 1.042)
 *   on slate-900 legacy slab    inner --paper 17.241  (outer --ink is 1.042)
 *
 * The last two rows are the reason `ON_DARK` no longer carries a ring override:
 * on a near black slab the outer layer vanishes and the inner layer is doing
 * all the work, which is exactly what the construction is designed for. Plan
 * section 4.2 swept all 256 greys and the better layer never drops below 4.264.
 *
 * WRITTEN AS AN ARBITRARY PROPERTY, NOT AS A SHADOW UTILITY, AND THAT IS LOAD
 * BEARING. Compiled with this project's own Tailwind 4.1.18, the utility form
 * of the same value emits
 * `--tw-shadow: 0 0 0 2px var(--tw-shadow-color, var(--paper)), ...`. Five call
 * sites currently pass a Tailwind shadow-colour utility through `className`
 * (Hero.tsx:146, ResourcesPreview.tsx:192, Membership.tsx:118,
 * Partners.tsx:124, Contact.tsx:352). Those set `--tw-shadow-color`, which
 * would then win the fallback in BOTH layers and repaint the entire focus ring
 * in a translucent navy. The arbitrary property form emits
 * `box-shadow: 0 0 0 2px var(--paper),0 0 0 4px var(--ink)` verbatim and cannot
 * be reached by `--tw-shadow-color`. Verified in compiled CSS, not inferred.
 *
 * Both layers are one `box-shadow` declaration on purpose, so they share a
 * fate. All three `onDark` call sites sit inside sections that set
 * `overflow: hidden` (HowItWorks.tsx:35, FinalCTA.tsx:46, Events.tsx:220); a
 * split construction
 * where the inner layer is a clippable box-shadow and the outer is an unclipped
 * outline would degrade to an invisible ring on precisely the grounds where the
 * inner layer is the only one that measures.
 *
 * `outline-hidden` rather than the v3 spelling of the same idea: it is the one
 * that keeps `outline: 2px solid transparent` under `forced-colors: active`,
 * so Windows High Contrast users still get a system focus indicator when the
 * box-shadow is dropped by the OS.
 */
const FOCUS_RING =
    'focus-visible:outline-hidden ' +
    'focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

/**
 * Tactile press feedback (plan section 6, behaviour 6): `translateY(1px)` plus
 * `scale(0.985)` on `:active`, with a 150ms colour transition on hover.
 *
 * Expressed in CSS rather than as Framer Motion's `whileTap`, for two reasons.
 * It is the only way `ButtonLink` gets the behaviour at all, since it renders a
 * plain <a> and never mounted a motion component. And Tailwind v4 compiles
 * these to the discrete `translate` and `scale` properties rather than to
 * `transform`, so they compose with, instead of fighting, any `transform` a
 * motion component sets on the same element.
 *
 * Reduced motion is handled by the existing block in `index.css`, which flattens
 * `transition-duration` to 0.01ms everywhere. The displacement is kept and
 * becomes instantaneous, which is what plan section 6 asks for: press feedback
 * is information, not choreography.
 */
const PRESS = 'active:translate-y-px active:scale-[0.985]';

/**
 * `rounded-full`, not the outgoing 8px radius (plan section 4.4). One radius
 * system: 0 on every non-interactive surface, full pill on every discrete
 * control. Shape is the affordance that tells a substantially second language
 * audience what can be pressed before they read the label.
 *
 * The nowrap is breakpoint scoped rather than unconditional.
 * Section 11 commits to no CTA label wrapping AT DESKTOP. Forcing it at every
 * width turns a wrap into horizontal page overflow on the narrowest screens:
 * `JoinModal.tsx:370` renders a `fullWidth` ButtonLink reading "See the next
 * Austin meetup", which at `text-base` plus `px-6` needs roughly 268px against
 * about 280px of usable width inside the modal at 360px. Do not "simplify" the
 * breakpoint away.
 *
 * DISABLED is a measured state, not a 50% opacity wash. Plan section 4.2
 * measures the disabled label as `--muted` on a `--band` fill at 5.982, held
 * even though WCAG does not require it. The outgoing opacity wash instead
 * produced an unmeasured alpha composite that differed per variant and per
 * ground: half of `--accent` over `--paper` resolves to a pink no row in the
 * plan measures. The `--edge` stroke is
 * mandatory rather than decorative: `--band` against `--paper` is 1.103, so
 * without a boundary a disabled control stops reading as a control at all. The
 * stroke measures 4.960 on `--paper` and 4.495 on `--band`.
 */
const BASE =
    'inline-flex items-center justify-center rounded-full font-semibold ' +
    'sm:whitespace-nowrap cursor-pointer ' +
    'transition-[color,background-color,border-color,translate,scale] duration-150 ease-out ' +
    FOCUS_RING + ' ' + PRESS + ' ' +
    'disabled:pointer-events-none disabled:border-2 disabled:border-edge ' +
    'disabled:bg-band disabled:text-muted';

/**
 * The light ground variants. Ratios, all recomputed:
 *
 *   primary    --on-accent on the --accent fill            7.054
 *              --on-accent on the --accent-press hover     8.557
 *              fill boundary against --paper 7.054, against --band 6.393
 *   secondary  --paper on the --ink fill                  17.965
 *              --paper on the --muted hover fill           6.601
 *              fill boundary against --paper 17.965
 *   outline    --ink label on the --paper fill            17.965
 *              2px --edge stroke: 4.960 on --paper, 4.495 on --band
 *              --ink on the --band hover fill             16.281
 *   ghost      --muted label on --paper 6.601, on --band 5.982
 *              --ink on the --band hover fill             16.281
 *
 * `outline` is the plan's section 11 "secondary": a `--paper` fill with a 2px
 * `--edge` stroke and an `--ink` label, never a transparent button with no
 * border. It carries a real fill for that reason.
 *
 * `secondary` is the solid neutral. It has zero call sites today and is the
 * token native spelling of what its retired navy fill, navy hover and white
 * label already resolved to through the legacy aliases in `index.css`. There
 * is no second brand fill in this palette by design.
 *
 * `ghost` is not a CTA. It is the low emphasis control used by the admin
 * toolbar, the resources filter footer and the modal's cancel action, and the
 * "never a transparent button" rule in section 11 governs CTAs.
 */
const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-on-accent hover:bg-accent-press',
    secondary: 'bg-ink text-paper hover:bg-muted',
    outline: 'border-2 border-edge bg-paper text-ink hover:bg-band',
    ghost: 'text-muted hover:bg-band hover:text-ink',
};

/**
 * `onDark` covers the two legacy near black slabs that Phase 1 does not retire:
 * `bg-primary` (which now resolves to `--ink`) and `bg-slate-900`. Phase 3
 * deletes both, and this whole block goes with them.
 *
 * PRIMARY IS DELIBERATELY EMPTY, AND THAT IS NOT AN OVERSIGHT. It used to carry
 * an accent ring plus a navy ring offset, and both halves of that are now
 * handled elsewhere:
 *
 *   - The ring is ground independent by construction. See FOCUS_RING above.
 *   - The fill is handled by the legacy dark slab bridge at the bottom of
 *     `src/index.css`, which redefines `--accent`, `--accent-press` and
 *     `--on-accent` inside `.bg-primary`, `.bg-slate-900` and `.bg-ink`. The
 *     unmodified `bg-accent text-on-accent hover:bg-accent-press` above
 *     therefore renders as a #E85C77 fill with an `--ink` label at 5.517
 *     (6.629 on hover) inside those slabs, and the fill boundary measures 5.517
 *     against `--ink` and 5.295 against slate-900.
 *
 * THIS IS A SILENT DEPENDENCY ON A SELECTOR IN ANOTHER FILE. If any agent
 * renames a dark ground class, the bridge stops matching, `--accent` reverts to
 * #A81B36 and the primary action on that slab drops to 2.547 against its own
 * ground with no build error and no failing test. That failure mode is stated
 * at length in `src/index.css`; this comment exists so it is also stated at the
 * call site that depends on it. Reached from HowItWorks.tsx:56,
 * FinalCTA.tsx:71 and Events.tsx:307.
 *
 * The other three rows drop every 40% and 10% white alpha composite the old
 * block used. Those were unmeasured and the plan's material rule allows no
 * alpha on the page except the modal scrim. Ratios on the two live slabs:
 *
 *   secondary  --ink on the --paper fill    17.965   hover on --band  16.281
 *   outline    --paper label and 2px --paper stroke: 17.965 on --ink,
 *              17.241 on slate-900. Hover inverts to a --paper fill with an
 *              --ink label at 17.965.
 *   ghost      --paper label 17.965 on --ink, 17.241 on slate-900.
 *
 * The disabled block in BASE is not overridden here, so a disabled control on a
 * dark slab renders as a near white `--band` pill with a `--muted` label at
 * 5.982. That clears the floor and looks odd; it is transitional, reachable
 * only at Events.tsx:307 mid submit, and it dies with the slab in Phase 3.
 */
const ON_DARK: Record<ButtonVariant, string> = {
    primary: '',
    secondary: 'bg-paper text-ink hover:bg-band',
    outline: 'border-paper bg-transparent text-paper hover:bg-paper hover:text-ink',
    ghost: 'text-paper hover:bg-paper hover:text-ink',
};

// Every size clears the 44px WCAG 2.5.5 touch target. `h-11` is 44px and `h-14`
// is 56px; neither may be lowered. Horizontal padding is opened by one step at
// `sm` only, because a pill reads as cramped when its padding is far below its
// corner radius.
const SIZES: Record<ButtonSize, string> = {
    sm: 'h-11 px-5 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
};

export interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    /** Use on the legacy near black slabs: `bg-primary` and `bg-slate-900`. */
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
