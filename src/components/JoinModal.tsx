import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Luma is the source of record for meetup dates (PRODUCT.md, Operating Context). */

/**
 * The five options and the initial value must match exactly. They used to
 * differ ('Idea' vs 'Idea Stage'), so an untouched form recorded a value the
 * user had never seen.
 */
const STAGES = ['Idea Stage', 'Pre-Seed', 'Seed', 'Series A+', 'Bootstrapped'] as const;

const EMPTY_FORM = {
    name: '',
    email: '',
    linkedin: '',
    stage: STAGES[0] as string,
};

/**
 * The focus ring, per REDESIGN-PLAN.md section 4.2.
 *
 * Two layers, 2px `--paper` inner plus 2px `--ink` outer, drawn as one
 * box-shadow with no `ring-offset`. Three properties of this construction are
 * load bearing and none of them is stylistic:
 *
 *  - It is DRAWN rather than inherited. `ring-offset` shows whatever sits
 *    behind the control, which is an assumption about the ground. Here the
 *    inner layer is painted, so the ring survives any ground. Swept across all
 *    256 greys the better of the two layers never drops below 4.264.
 *  - The two layers contrast with each other at 17.965, so the indicator reads
 *    as a SHAPE rather than as a colour. Inside this dialog the inner `--paper`
 *    layer against a `--band` field fill is only 1.103; the outer `--ink` layer
 *    against the modal's `--paper` ground is 17.965 and the layer boundary is
 *    17.965, which is what actually carries it.
 *  - It is full opacity. The outgoing ring expressed the indicator with the
 *    retired navy at 30% alpha, and section 4.2's partial coverage row
 *    measures that class of indicator below the 3:1 floor. No focus indicator
 *    on this page is allowed to be an alpha or an `opacity`.
 *
 * There is NO dark mode reversal, deliberately. `--paper` is always the page
 * colour and `--ink` is always the type colour, so the construction inverts
 * itself when the tokens swap. Writing a reversal on top of that inverts it
 * twice and collapses the ring to a single 2px line at 1.000.
 *
 * The class strings below are spelled out in full at every call site rather
 * than composed from a shared constant, because Tailwind scans source text for
 * whole candidates: `focus-visible:${RING}` would emit two candidates that
 * neither of them generates the rule.
 */

/**
 * Fields, per plan sections 4.1, 4.2 and 4.4.
 *
 *   fill      --band    against the modal's --paper ground this is 1.103, so
 *                       the fill is NOT what makes the field perceivable
 *   border    --edge    4.960 against the modal ground, 4.495 against its own
 *                       fill. This is the mechanism, which is why it is a
 *                       mandatory 1px full opacity stroke and not decoration
 *   value     --ink     16.281 on the fill
 *   holder    --muted   5.982 on the fill
 *   radius    pill      a discrete interactive control, so shape tells a
 *                       reader it is pressable before they read the label
 */
const FIELD_CLASSES =
    'w-full h-11 px-4 rounded-full border border-edge bg-band text-ink ' +
    'placeholder:text-muted transition-colors ' +
    'focus:outline-hidden focus:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]';

/**
 * People type their LinkedIn in every shape: a full URL, `linkedin.com/in/x`,
 * or just the handle. The field used to be `type="url"` and required, which
 * meant the browser rejected the exact string shown in its own placeholder.
 * We accept all three shapes and store one canonical URL.
 */
function normalizeLinkedIn(raw: string): string {
    const value = raw.trim().replace(/^@/, '');
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (/^([a-z0-9-]+\.)*linkedin\.com\//i.test(value)) return `https://${value}`;
    return `https://www.linkedin.com/in/${value.replace(/^\/+|\/+$/g, '')}`;
}

const NETWORK_ERROR =
    'We could not send your details just now. Everything you typed is still here. Please check your connection and try again.';

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function JoinModal({ isOpen, onClose }: JoinModalProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const panelRef = useRef<HTMLDivElement>(null);
    const firstFieldRef = useRef<HTMLInputElement>(null);
    const successRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    // This component stays mounted between openings (it lives in App's layout),
    // so without an explicit reset the next visitor to open it would land on
    // the previous one's success screen, complete with their email address.
    // Adjusting state during render is React's documented pattern for this.
    const [wasOpen, setWasOpen] = useState(isOpen);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setStep('form');
            setFormData(EMPTY_FORM);
            setErrorMessage(null);
            setIsSubmitting(false);
        }
    }

    // Opening remembers the trigger and moves focus into the dialog; closing
    // gives focus back to whatever opened it.
    useEffect(() => {
        if (!isOpen) return;

        triggerRef.current = document.activeElement as HTMLElement | null;

        const frame = window.requestAnimationFrame(() => firstFieldRef.current?.focus());

        return () => {
            window.cancelAnimationFrame(frame);
            const trigger = triggerRef.current;
            if (trigger && document.contains(trigger)) trigger.focus();
        };
    }, [isOpen]);

    // Escape and the Tab trap share one listener so their ordering is explicit.
    // Focusable children are re-queried on every Tab because the form/success
    // swap and the error alert both change the tree.
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;

            const panel = panelRef.current;
            if (!panel) return;

            const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusables.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            const inside = active instanceof Node && panel.contains(active);

            if (e.shiftKey) {
                if (!inside || active === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (!inside || active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, onClose]);

    // The page behind must not scroll while the dialog is open.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    // Nothing below the fold of the form is reachable after success, so focus
    // moves into the confirmation instead of falling back to <body>.
    useEffect(() => {
        if (step === 'success') successRef.current?.focus();
    }, [step]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        // Nothing is cleared on failure, so retrying is one click.
        let failure: string | null = null;

        try {
            const response = await fetch('/api/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    linkedin: normalizeLinkedIn(formData.linkedin),
                }),
            });

            if (!response.ok) {
                const result = await response.json().catch(() => null);
                failure = result?.error || 'We could not send your details. Please try again.';
            }
        } catch {
            failure = NETWORK_ERROR;
        }

        setIsSubmitting(false);

        if (failure) {
            setErrorMessage(failure);
            // Disabling the submit button while sending drops focus to <body>.
            // Put it back so retrying is one keystroke; role="alert" announces
            // the reason independently of where focus sits.
            window.requestAnimationFrame(() => submitRef.current?.focus());
            return;
        }

        setStep('success');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* --scrim, the only alpha composite left on the page and
                        deliberately theme invariant. The outgoing
                        `backdrop-blur-sm` is gone under the flat material rule:
                        no blur, no backdrop-filter, no shadow, no glass. */}
                    <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-scrim z-50"
                    />
                    {/* THE MODAL BOUNDARY. Measured in both modes and over every
                        ground the scrim can composite over, because a fixed
                        backdrop can sit above any section on any route.

                        It is a TWO MECHANISM edge and neither mechanism is
                        decoration:

                          tone    this --paper surface against the scrim
                                  dimmed page behind it
                          border  a 1px full opacity --ink line

                        Which one carries depends on the mode AND on what is
                        behind the scrim, and the two swap roles rather than
                        reinforcing each other:

                          scrim over --paper    light  tone  4.793  border  3.748
                                                dark   tone  1.000  border 17.965
                          scrim over --band     light  tone  5.158  border  3.483
                                                dark   tone  1.036  border 17.337
                          scrim over the        light  tone 13.815  border  1.300
                          --accent-plate        dark   tone  1.300  border 13.815

                        So the gate is the BETTER of the two, which is exactly
                        how plan section 4.2 gates the better of the focus
                        ring's two layers. Swept across all 256 GREY grounds
                        under the scrim the better leg never drops below 4.719,
                        and it is the same number in both modes because the
                        construction inverts itself when --paper and --ink swap.
                        Greys only, like the focus ring's own sweep: a per pixel
                        photographic ground is not bounded by it, and nothing
                        needs it to be, because the Plate Rule keeps type and
                        controls off photographs and this dialog is centred in
                        the viewport rather than pinned to a band.

                        THE BORDER IS --ink AND NOT THE --rule EVERY OTHER PLATE
                        CARRIES, and that is derived rather than preferred. A
                        plate's outer neighbour is --paper, where --rule
                        measures 4.063. This surface's outer neighbour is a
                        scrim composite, where --rule measures 1.180 over
                        --paper and 1.270 over --band in light mode: the shipped
                        border was invisible against its own backdrop in the
                        mode where tone happened to be carrying, and in dark
                        mode it was the only mechanism at 4.005 while the
                        surface measured 1.000 against its own backdrop.

                        LIGHT MODE IS THE BINDING CASE, and stating it that way
                        rather than as "--ink is the only token that works"
                        matters, because in dark mode every token in the palette
                        clears both sides at once for the reason that makes dark
                        mode broken in the first place: the scrim composite IS
                        the surface, so a border's two neighbours are the same
                        colour. It is the INTERSECTION of the two modes that
                        leaves exactly one token, and --ink is it. The full
                        per token table is printed by
                        scripts/verify-dark-contrast.py. It takes the dark mode
                        edge from 4.005 to 17.965 and the light mode edge off
                        the floor at the same time.

                        Full opacity 1px, never an alpha and never a fractional
                        device pixel offset, under the hairline rule in section
                        4.2. At 75% antialiased coverage the border leg measures
                        2.729 over the light --band composite, below the 3.0
                        floor, which is the same arithmetic that governs every
                        other hairline on this page rather than a new hazard. On
                        that one ground the tone leg carries at 5.158 anyway.

                        Not a two layer halo. The palette already owns that
                        construction and it means "focused"; a permanent one
                        around the dialog would spend the meaning. Radius 0: a
                        surface is not a control. */}
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="join-modal-title"
                        tabIndex={-1}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto border border-ink bg-paper z-50"
                    >
                        {/* Present at all times; only its text changes, which is what
                            makes a polite live region reliable. */}
                        <p role="status" aria-live="polite" className="sr-only">
                            {isSubmitting ? 'Sending your details.' : ''}
                        </p>

                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                {/* Emphasis is a WEIGHT STEP inside the line, 500
                                    against 800, which is how the IFN slide sets
                                    `International` light against `Founders` black.
                                    Not italic and not colour: the accent is
                                    licensed to the mark, the primary action fill
                                    and the wordmark period, and "IFN" here marks
                                    nothing a reader can check. The dialog title
                                    strings are unchanged, and the space inside
                                    "Join IFN" is kept literal because
                                    aria-labelledby computes the accessible name
                                    from text content. */}
                                <h2
                                    id="join-modal-title"
                                    className="text-xl font-medium tracking-tight text-ink pt-2"
                                >
                                    {step === 'form' ? (
                                        <>Join <span className="font-extrabold">IFN</span></>
                                    ) : (
                                        <>You&rsquo;re on the <span className="font-extrabold">list</span></>
                                    )}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="shrink-0 w-11 h-11 -mr-2 -mt-1 inline-flex items-center justify-center rounded-full text-muted transition-colors hover:bg-band hover:text-ink focus-visible:outline-hidden focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]"
                                >
                                    <X size={20} strokeWidth={1.5} aria-hidden="true" />
                                </button>
                            </div>

                            {step === 'form' ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <p className="text-ink leading-relaxed">
                                        Monthly, in person, in Austin, Texas, and running for more than six
                                        months. Tell us who you are, and come to the next one.
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="join-name" className="text-sm font-medium text-ink">
                                            Full name
                                        </label>
                                        <input
                                            ref={firstFieldRef}
                                            id="join-name"
                                            name="name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            maxLength={120}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className={FIELD_CLASSES}
                                            placeholder="Jane Founder"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="join-email" className="text-sm font-medium text-ink">
                                            Email
                                        </label>
                                        <input
                                            id="join-email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            maxLength={254}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className={FIELD_CLASSES}
                                            placeholder="jane@example.com"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="join-linkedin" className="text-sm font-medium text-ink">
                                            LinkedIn <span className="font-normal text-muted">(optional)</span>
                                        </label>
                                        <input
                                            id="join-linkedin"
                                            name="linkedin"
                                            type="text"
                                            inputMode="url"
                                            autoComplete="url"
                                            /* Below the server's 500 so a full field survives
                                               the https:// prefix normalizeLinkedIn may add. */
                                            maxLength={400}
                                            aria-describedby="join-linkedin-help"
                                            value={formData.linkedin}
                                            onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                            className={FIELD_CLASSES}
                                            placeholder="linkedin.com/in/jane-founder"
                                        />
                                        <p id="join-linkedin-help" className="text-sm text-muted">
                                            The full web address or just your profile name. Both work.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="join-stage" className="text-sm font-medium text-ink">
                                            Stage of your company
                                        </label>
                                        {/* A native <select> on purpose. It will render its
                                            own popup with the system colour scheme, which is
                                            correct today because light is the only live mode.
                                            Phase 2 declares `color-scheme: light dark` on
                                            :root in the same commit that activates the dark
                                            tokens; that is the fix, and it does not belong
                                            in a component. */}
                                        <select
                                            id="join-stage"
                                            name="stage"
                                            autoComplete="off"
                                            value={formData.stage}
                                            onChange={e => setFormData({ ...formData, stage: e.target.value })}
                                            className={FIELD_CLASSES}
                                        >
                                            {STAGES.map(stage => (
                                                <option key={stage} value={stage}>
                                                    {stage}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Below every field and immediately above the
                                        control focus is returned to, so the reason and
                                        the retry are the same glance. No accent: the
                                        error state carries --ink type at 17.965 on the
                                        modal's --paper ground plus a 3px --ink rule,
                                        because one colour licensed to checkable claims
                                        cannot also mean "something went wrong". */}
                                    {errorMessage && (
                                        <div
                                            role="alert"
                                            className="flex gap-3 border-l-[3px] border-l-ink pl-4 py-1 text-sm text-ink"
                                        >
                                            <AlertCircle
                                                size={18}
                                                strokeWidth={1.5}
                                                className="shrink-0 mt-0.5"
                                                aria-hidden="true"
                                            />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Button ref={submitRef} type="submit" fullWidth disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending…' : 'Send my details'}
                                        </Button>
                                        <p className="text-sm text-muted mt-3">
                                            Your details go to the IFN organizers in Austin.
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <div ref={successRef} tabIndex={-1} className="py-2 focus:outline-hidden">
                                    {/* The outgoing green disc is gone. Green is a second
                                        brand hue, and the palette licenses exactly one
                                        colour. The glyph stays because it is a glance
                                        level confirmation, and it is --ink at 17.965. */}
                                    <Check
                                        size={32}
                                        strokeWidth={1.5}
                                        className="text-ink mb-4"
                                        aria-hidden="true"
                                    />
                                    <p className="text-ink leading-relaxed mb-2">
                                        Your details are saved. This form does not send email, so nothing will arrive in
                                        your inbox. There is nothing to wait for.
                                    </p>
                                    <p className="text-ink leading-relaxed mb-6">
                                        The next step is the meetup itself. Every date and sign-up is on Luma.
                                    </p>

                                    {/* Navigation, so it stays a real link. ButtonLink adds
                                        target/rel and the "(opens in a new tab)" hint itself,
                                        which is why none of that is written here. */}
                                    <ButtonLink href={LUMA_CALENDAR_URL} fullWidth className="gap-2">
                                        See the next Austin meetup
                                        <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                                    </ButtonLink>

                                    <div className="mt-3">
                                        <Button fullWidth onClick={onClose} variant="ghost">
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
