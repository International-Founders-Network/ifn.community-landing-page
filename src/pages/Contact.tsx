import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { Emphasis } from '../components/Emphasis';
import { Mail, MapPin, CalendarDays, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/** Verified in src/data/socialLinks.ts. Luma is IFN's source of record for meetup dates. */

/**
 * Field styles live here rather than being repeated five times.
 *
 * - `rounded-lg` (8px) is the interactive radius from DESIGN.md's Radius Ladder;
 *   the previous `rounded-xl` put fields a step above the button they submit to.
 * - `border-edge` is the control boundary token, one step stronger than the
 *   `--rule` hairline a plate carries, because a field has to read as enterable.
 *   It measures 4.960 on `--paper` and 4.495 on `--band`.
 * - The fill is `--band`, the opposite ground from the `--paper` card that holds
 *   it, so the field reads as a well rather than as more card. `--muted` as its
 *   placeholder measures 5.982 on that fill.
 * - The focus ring is the canonical two-layer ring: a 2px `--paper` offset
 *   inside a 2px `--ink` ring. Its two layers contrast with each other at
 *   17.965, so it reads as a shape on any ground and in either mode. The native
 *   outline is suppressed only because this replaces it, and `outline-hidden`
 *   rather than the v3 spelling of the same idea keeps a transparent 2px
 *   outline under `forced-colors: active`, where the ring is dropped by the OS.
 */
const FIELD_CLASSES =
    'w-full px-4 py-3 rounded-lg border border-edge bg-band text-ink ' +
    'placeholder:text-muted transition-colors ' +
    'focus:outline-hidden focus:border-ink focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper';

const LABEL_CLASSES = 'block text-sm font-medium text-ink';

/** The required mark is neutral. The accent on this page is rationed to the headline word and the submit button. */
function RequiredMark() {
    return (
        <span aria-hidden="true" className="text-muted">
            {' '}
            *
        </span>
    );
}

export function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const successHeadingRef = useRef<HTMLHeadingElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    /** Stops the effect below from stealing focus on first paint. */
    const hasSubmittedRef = useRef(false);

    // The success state replaces the form in place. Without moving focus, a
    // screen-reader or keyboard user is left on a button that no longer exists
    // and is never told the submission worked. Focus is the announcement here.
    // A live region on the same subtree would make some readers say it twice.
    useEffect(() => {
        if (!hasSubmittedRef.current) return;
        if (isSuccess) {
            successHeadingRef.current?.focus();
        } else {
            nameInputRef.current?.focus();
        }
    }, [isSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // A failing endpoint does not always return JSON. contact.ts answers a
            // 405 with the bare string "Method Not Allowed", and Netlify returns HTML
            // on a 502. Parsing defensively keeps a browser exception out of the
            // alert below, which is read aloud.
            let result: { error?: string } = {};
            try {
                result = await response.json();
            } catch {
                /* Body was not JSON. The status code still tells us what happened. */
            }

            if (!response.ok) {
                setErrorMessage(
                    result.error ||
                        'Your message was not sent. Please try again, or email hello@ifn.community.'
                );
                return;
            }

            hasSubmittedRef.current = true;
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        } catch (error) {
            // Never surface error.message. It carries strings like "Failed to fetch",
            // and this audience is largely reading in a second language.
            console.error('Error sending message:', error);
            setErrorMessage(
                'Your message could not be sent. Please check your internet connection and try again, or email hello@ifn.community.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-24">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact info */}
                    <div className="space-y-10">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-5 tracking-tight leading-tight">
                                Ask us a <Emphasis>question</Emphasis>
                            </h1>
                            <p className="text-lg text-muted leading-relaxed">
                                IFN is a community for international founders building in Austin, Texas. We have
                                run an in-person meetup here every month for more than six months. Ask us about a
                                meetup, about membership, or about working together. This form reaches us directly.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted mb-6">
                                Ways to reach us
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-ink/10 p-3 rounded-full text-ink shrink-0">
                                        <Mail className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-ink">Email</h3>
                                        <a
                                            href="mailto:hello@ifn.community"
                                            className="text-muted underline decoration-rule underline-offset-4 hover:text-ink hover:decoration-ink transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm"
                                        >
                                            hello@ifn.community
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-ink/10 p-3 rounded-full text-ink shrink-0">
                                        <MapPin className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-ink">Where we are</h3>
                                        <p className="text-muted">
                                            Austin, Texas, USA. IFN has no public office.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-ink/10 p-3 rounded-full text-ink shrink-0">
                                        <CalendarDays className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-ink">Come to a meetup</h3>
                                        <p className="text-muted">
                                            One in-person meetup a month, hosted at Station Austin. Dates and sign-up
                                            are published on Luma.
                                        </p>
                                        <a
                                            href={LUMA_CALENDAR_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1 font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm"
                                        >
                                            See upcoming dates on Luma
                                            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                            <span className="sr-only">(opens in a new tab)</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact form. Flat at rest: hairline border, no resting shadow. */}
                    <div className="bg-paper rounded-2xl p-8 border border-rule">
                        {isSuccess ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                {/* Tokenised in Phase 2. It was a stock green-100 fill with
                                    green-700 type (class names described rather than spelled,
                                    because Tailwind v4 scans raw text and would re-emit them as
                                    dead CSS), a second hue banned by section 11's Consistency Lock
                                    and, worse, a fixed light chip that reads 16.910 against the
                                    dark page ground once dark mode is on. `--band` is the fill
                                    because this sits on the form card's `--paper` ground, so the
                                    chip is 1.103 by tone. Deliberately borderless, matching the
                                    other decorative icon chips in this tree: section 4.2's
                                    mandatory 1px `--rule` plate border governs recessed content
                                    surfaces, not an icon background whose perceivable object is
                                    the glyph, at 16.281 light and 16.318 dark. Nothing semantic
                                    was carried by the green: the glyph is aria-hidden and the
                                    "Message sent" heading below states the outcome in words. */}
                                <div className="w-16 h-16 bg-band text-ink rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                                </div>
                                <h2
                                    ref={successHeadingRef}
                                    tabIndex={-1}
                                    className="text-2xl font-bold text-ink mb-3 rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                >
                                    Message sent
                                </h2>
                                <p className="text-muted mb-8 max-w-sm leading-relaxed">
                                    Thank you. IFN is run by a small founder team, and your message comes straight
                                    to us. We read every one.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setErrorMessage(null);
                                        setIsSuccess(false);
                                    }}
                                >
                                    Send another message
                                </Button>
                                <a
                                    href={LUMA_CALENDAR_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm"
                                >
                                    Meanwhile, see the next Austin meetup
                                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                    <span className="sr-only">(opens in a new tab)</span>
                                </a>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <h2 className="text-xl font-bold text-ink">Send a message</h2>
                                    <p className="mt-1 text-sm text-muted">
                                        An asterisk (*) marks a field you have to fill in.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="contact-name" className={LABEL_CLASSES}>
                                            Full name
                                            <RequiredMark />
                                        </label>
                                        <input
                                            type="text"
                                            id="contact-name"
                                            name="name"
                                            ref={nameInputRef}
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={FIELD_CLASSES}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-email" className={LABEL_CLASSES}>
                                            Email address
                                            <RequiredMark />
                                        </label>
                                        <input
                                            type="email"
                                            id="contact-email"
                                            name="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={FIELD_CLASSES}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        {/* Phone was `required` with an unexplained asterisk. A contact form
                                            that will not send without a phone number turns readers away, and
                                            the API has always treated it as optional. */}
                                        <label htmlFor="contact-phone" className={LABEL_CLASSES}>
                                            Phone number
                                        </label>
                                        <input
                                            type="tel"
                                            id="contact-phone"
                                            name="phone"
                                            autoComplete="tel"
                                            aria-describedby="contact-phone-hint"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={FIELD_CLASSES}
                                        />
                                        <p id="contact-phone-hint" className="text-xs text-muted">
                                            Please include your country code if you are outside the United States.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-company" className={LABEL_CLASSES}>
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            id="contact-company"
                                            name="company"
                                            autoComplete="organization"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className={FIELD_CLASSES}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="contact-message" className={LABEL_CLASSES}>
                                        Message
                                        <RequiredMark />
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className={`${FIELD_CLASSES} resize-y min-h-[8rem]`}
                                        required
                                    />
                                </div>

                                {errorMessage && (
                                    <motion.div
                                        // role="alert" fires on insertion, so the failure is announced
                                        // instead of only being visible. MotionConfig in App.tsx
                                        // handles prefers-reduced-motion for this entrance.
                                        //
                                        // Section 4.2's error form, identical to JoinModal's:
                                        // --ink on --paper at 17.965 plus a 3px --ink rule.
                                        // It was a stock red-50 slab with a red-200 border and
                                        // red-700 type: a second brand hue that section 11 bans
                                        // on the error path, and a fixed light slab that reads
                                        // 17.005 against the dark page ground once dark mode is
                                        // on. Class names described, not spelled, so Tailwind
                                        // v4's raw-text scan does not re-emit them.
                                        role="alert"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-l-[3px] border-l-ink py-1 pl-4 text-sm font-medium text-ink"
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    fullWidth
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                    className="gap-2 shadow-lg"
                                >
                                    {isSubmitting ? 'Sending…' : 'Send message'}
                                    <Send className="w-4 h-4" aria-hidden="true" />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}
