import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';
import type { GalleryNight } from '../data/photos.generated';

/**
 * THE ENLARGED VIEW FOR THE GALLERY ROUTE.
 *
 * Why this exists at all, given the brief allows shipping without it
 * ------------------------------------------------------------------
 * The grid can only render the 640px tile tier (see `Gallery.tsx` for the byte
 * arithmetic), so every frame on the sheet is a thumbnail of roughly 390 CSS px
 * at the widest. `photos.generated.ts` ships a second, 1280px `view` tier for
 * each frame precisely so a reader can actually look at one. Without this
 * dialog that tier is dead weight in the repository and the gallery is ten
 * thumbnails a visitor can never open.
 *
 * The brief permits shipping without a lightbox if one cannot be made properly
 * accessible in scope. It can be, because this repository already contains an
 * audited focus trap in `JoinModal.tsx` and this component mirrors it rather
 * than inventing a second one. Every mechanism below is that file's, adapted:
 *
 *   - one capture phase keydown listener carrying Escape and the Tab trap, so
 *     their ordering is explicit rather than emergent
 *   - focusables re-queried on EVERY Tab, because the navigation buttons and
 *     the caption change as the reader moves through an evening
 *   - the body scroll lock restores the PREVIOUS value on close rather than
 *     assuming it was `''`
 *   - the dialog carries an accessible name through `aria-labelledby`
 *
 * Focus restoration is deliberately NOT done here. It lives in `Gallery.tsx`,
 * which owns the tile buttons and can therefore return focus to the tile of the
 * frame the reader was last looking at rather than to the one they opened.
 * Escaping out of photograph six and landing back on photograph one is a real
 * loss of place, and only the page knows the mapping. See the `closeLightbox`
 * handler there; the contract is stated in both files so neither can drop it
 * silently.
 *
 * NO CONTROL SITS ON A PHOTOGRAPH, and that is structural rather than a taste
 * call. Plan section 4.4's Plate Rule keeps type off every photograph on this
 * site, and `buttonStyles.ts` records that the focus ring's contrast sweep is
 * bounded over GREY grounds only, "because nothing focusable sits on a
 * photograph under the Plate Rule". An overlaid close or next control would put
 * a focus indicator on a per pixel ground that no sweep covers. So close sits
 * in the header row above the image, previous and next sit in a row below the
 * caption, and the image is untouched by both.
 *
 * MEASURED CONTRAST, recomputed with the WCAG relative luminance formula rather
 * than copied, light then dark:
 *
 *   --ink title on the --paper surface      17.965  17.965
 *   --ink counter on --paper                17.965  17.965
 *   --muted description on --paper           6.601   7.496
 *   1px --ink dialog border vs the surface  17.965  17.965
 *   dialog surface vs --scrim over --paper   4.793   1.000
 *   dialog border  vs --scrim over --paper   3.748  17.965
 *   dialog surface vs --scrim over --band    5.158   1.036
 *   dialog border  vs --scrim over --band    3.483  17.337
 *   close button --muted label on --paper     6.601   7.496
 *   close button --ink label on --band hover 16.281  16.318
 *
 * The boundary is carried by the BETTER of tone and border in each mode, which
 * is the construction `JoinModal.tsx` derives at length: light mode leans on
 * tone, dark mode leans on the 1px `--ink` border, and neither mode is left
 * without a mechanism. The border is `--ink` and not the `--rule` every other
 * plate carries for the reason measured there: `--rule` against a light mode
 * scrim composite is 1.180, an invisible border.
 *
 * MOTION. One behaviour: the scrim and the panel fade in and out on open and
 * close. It is feedback, telling the reader a layer arrived over the page they
 * were reading rather than that the page replaced itself. `MotionConfig
 * reducedMotion="user"` in `App.tsx` drops transform animations and keeps
 * opacity, which is why the panel's `scale` and `y` are safe to declare and why
 * the fade survives reduced motion. That is the house pattern in `JoinModal`,
 * not an oversight: an instantaneous appearance of a full screen layer is the
 * one thing reduced motion users report as worse, not better.
 */

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface GalleryLightboxProps {
    /** The evening being viewed. `null` closes the dialog. */
    night: GalleryNight | null;
    /** Index of the frame WITHIN that evening. */
    index: number;
    onClose: () => void;
    /** Called with the next index within the same evening. Wraps at both ends. */
    onNavigate: (nextIndex: number) => void;
}

export function GalleryLightbox({ night, index, onClose, onNavigate }: GalleryLightboxProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);

    const open = night !== null;
    const frames = night?.frames ?? [];
    const count = frames.length;
    // Clamped rather than trusted. The page can only produce an in-range index
    // today, but an out-of-range one would otherwise render `undefined.tile`.
    const safeIndex = count > 0 ? Math.min(Math.max(index, 0), count - 1) : 0;
    const frame = count > 0 ? frames[safeIndex] : null;

    // Latest-value ref for the keyboard handler. Without it the capture phase
    // listener is torn down and re-registered on every arrow key, because
    // `onNavigate` closes over the index it was created with.
    //
    // Written in an effect with NO dependency array rather than during render:
    // a ref mutation during render is a lint error here and, more to the point,
    // is unsafe under a double invoked render. An un-keyed effect runs after
    // every commit, which is long before a keystroke can reach the listener.
    const navRef = useRef({ onClose, onNavigate, safeIndex, count });
    useEffect(() => {
        navRef.current = { onClose, onNavigate, safeIndex, count };
    });

    // Move focus into the dialog on open so the reader hears its name. The
    // panel itself takes focus rather than the close button: landing on "Close"
    // as the first thing announced reads as an error state.
    useEffect(() => {
        if (!open) return;
        const id = window.requestAnimationFrame(() => panelRef.current?.focus());
        return () => window.cancelAnimationFrame(id);
    }, [open]);

    // Escape, the arrow keys and the Tab trap share ONE listener so their
    // ordering is explicit. Focusables are re-queried on every Tab because the
    // tree changes as the reader navigates.
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const { onClose: close, onNavigate: navigate, safeIndex: at, count: total } =
                navRef.current;

            if (e.key === 'Escape') {
                close();
                return;
            }

            // Arrow keys move within the evening and wrap. Wrapping rather than
            // stopping is deliberate: a disabled control at either end drops
            // focus to <body> the moment it disables itself, which is exactly
            // the class of keyboard defect this project has already had audited.
            if (total > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                navigate(e.key === 'ArrowLeft' ? (at - 1 + total) % total : (at + 1) % total);
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
    }, [open]);

    // The page behind must not scroll while the dialog is open, and its own
    // previous value is restored rather than assumed.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && frame && night && (
                <>
                    {/* --scrim, theme invariant, the only alpha composite on the
                        site. No backdrop blur: the page is flat material. */}
                    <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-scrim z-50"
                    />

                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        tabIndex={-1}
                        initial={{ opacity: 0, scale: 0.98, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 12 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1.5rem)] max-w-3xl max-h-[92dvh] overflow-y-auto border border-ink bg-paper"
                    >
                        <div className="p-5 sm:p-6">
                            {/* The dialog's accessible name is the evening. It is
                                the one fact this page is willing to attach to a
                                frame, and it is the fact the grouping argues from. */}
                            <div className="flex items-start justify-between gap-4">
                                <h2
                                    id={titleId}
                                    className="pt-2 text-xl font-medium tracking-tight text-ink"
                                >
                                    {night.label}
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

                            <figure className="mt-5">
                                {/* The 1280px `view` tier, ONE url per format and
                                    no srcset, fetched only now. A srcset here
                                    would let a 2x display pull a tier this
                                    dialog never renders at: the panel caps at
                                    768 CSS px and the image at 720, so 1280 is
                                    1.78x coverage and nothing larger is useful.

                                    `key` on the <picture> forces a remount when
                                    the frame changes. Without it React reuses
                                    the same <img> node and some browsers hold
                                    the previous decode visible until the new
                                    bytes land, which reads as the arrows having
                                    done nothing.

                                    `src` is the 640px JPEG and `width`/`height`
                                    are the 1280px tier's. That is correct rather
                                    than a mismatch: there is no 1280 JPEG tier to
                                    point at, both tiers are 16:9, and the two
                                    attributes only have to reserve the right
                                    SHAPE. Any browser reaching the <img> fallback
                                    has no avif and no webp, which is a decade old
                                    engine, and it gets the right box and a
                                    smaller file.

                                    alt is EMPTY here, deliberately. The frame's
                                    description is rendered as visible text in
                                    the caption below and announced from there,
                                    so an identical alt would say every
                                    description twice. On the grid the tiles
                                    carry the real alt, because there is no
                                    visible description beside them. */}
                                <picture key={frame.slot} className="block">
                                    <source type="image/avif" srcSet={frame.view.avif} />
                                    <source type="image/webp" srcSet={frame.view.webp} />
                                    <img
                                        src={frame.tile.src}
                                        width={frame.view.width}
                                        height={frame.view.height}
                                        alt=""
                                        loading="eager"
                                        decoding="async"
                                        className="block h-auto w-full"
                                    />
                                </picture>

                                {/* PERMANENTLY MOUNTED LIVE REGION while the
                                    dialog is open. Only its TEXT changes as the
                                    reader moves through the evening, never its
                                    existence, which is what makes a polite live
                                    region announce reliably. Without this,
                                    previous and next would be silent to a screen
                                    reader: their entire effect is swapping an
                                    image, and swapping an image announces
                                    nothing.

                                    The count is scoped to the EVENING, not to
                                    the whole gallery, so "photograph 3 of 6"
                                    cannot be misread as a total. */}
                                <figcaption role="status" aria-live="polite" className="mt-5">
                                    <p className="text-sm font-semibold text-ink tabular-nums">
                                        Photograph {safeIndex + 1} of {count}
                                    </p>
                                    <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted">
                                        {frame.alt}
                                    </p>
                                </figcaption>
                            </figure>

                            {/* One evening with a single frame gets no navigation
                                rather than two controls that do nothing. */}
                            {count > 1 && (
                                <div className="mt-6 flex items-center justify-between gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onNavigate((safeIndex - 1 + count) % count)}
                                    >
                                        <ChevronLeft
                                            size={18}
                                            strokeWidth={1.5}
                                            aria-hidden="true"
                                            className="mr-1.5"
                                        />
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onNavigate((safeIndex + 1) % count)}
                                    >
                                        Next
                                        <ChevronRight
                                            size={18}
                                            strokeWidth={1.5}
                                            aria-hidden="true"
                                            className="ml-1.5"
                                        />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
