import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { Emphasis } from './Emphasis';
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

const FIELD_CLASSES =
    'w-full h-11 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none ' +
    'transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30';

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
    'We could not send your details just now. Everything you typed is still here — please check your connection and try again.';

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
                    <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="join-modal-title"
                        tabIndex={-1}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-2xl shadow-xl z-50"
                    >
                        {/* Present at all times; only its text changes, which is what
                            makes a polite live region reliable. */}
                        <p role="status" aria-live="polite" className="sr-only">
                            {isSubmitting ? 'Sending your details.' : ''}
                        </p>

                        <div className="p-6">
                            <div className="flex justify-between items-start gap-4 mb-5">
                                <h2 id="join-modal-title" className="text-xl font-bold text-slate-900 pt-2">
                                    {/* The panel is white, so the Italic Welcome word takes the
                                        light-ground amber. Passing `onDark` here would put #f97316
                                        back on white at 2.80:1. */}
                                    {step === 'form' ? (
                                        <>Join <Emphasis>IFN</Emphasis></>
                                    ) : (
                                        <>You&rsquo;re on the <Emphasis>list</Emphasis></>
                                    )}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="shrink-0 w-11 h-11 -mr-2 -mt-1 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>

                            {step === 'form' ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <p className="text-slate-600 leading-relaxed">
                                        Monthly, in person, in Austin, Texas &mdash; and running for more than six
                                        months. Tell us who you are, and come to the next one.
                                    </p>

                                    {errorMessage && (
                                        <div
                                            role="alert"
                                            className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                                        >
                                            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="join-name" className="block text-sm font-medium text-slate-700 mb-1">
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

                                    <div>
                                        <label htmlFor="join-email" className="block text-sm font-medium text-slate-700 mb-1">
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

                                    <div>
                                        <label htmlFor="join-linkedin" className="block text-sm font-medium text-slate-700 mb-1">
                                            LinkedIn <span className="font-normal text-slate-500">(optional)</span>
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
                                        <p id="join-linkedin-help" className="mt-1 text-xs text-slate-500">
                                            The full web address or just your profile name &mdash; both work.
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="join-stage" className="block text-sm font-medium text-slate-700 mb-1">
                                            Stage of your company
                                        </label>
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

                                    <div className="pt-2">
                                        <Button ref={submitRef} type="submit" fullWidth disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending…' : 'Send my details'}
                                        </Button>
                                        <p className="text-xs text-slate-500 text-center mt-3">
                                            Your details go to the IFN organizers in Austin.
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <div ref={successRef} tabIndex={-1} className="text-center py-6 focus:outline-none">
                                    <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} aria-hidden="true" />
                                    </div>
                                    <p className="text-slate-600 leading-relaxed mb-2">
                                        Your details are saved. This form does not send email, so nothing will arrive in
                                        your inbox &mdash; there is nothing to wait for.
                                    </p>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        The next step is the meetup itself. Every date and sign-up is on Luma.
                                    </p>

                                    {/* Navigation, so it stays a real link — ButtonLink adds
                                        target/rel and the "(opens in a new tab)" hint itself,
                                        which is why none of that is written here. */}
                                    <ButtonLink href={LUMA_CALENDAR_URL} fullWidth className="gap-2">
                                        See the next Austin meetup
                                        <ArrowUpRight size={18} aria-hidden="true" />
                                    </ButtonLink>

                                    <div className="mt-2">
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
