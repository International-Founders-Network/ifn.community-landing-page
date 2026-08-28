import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';
import type { GalleryFrame } from '../data/photos.generated';

/**
 * THE ENLARGED VIEW FOR THE GALLERY ROUTE.
 *
 * REBUILT 2026-08-10 alongside the gallery. Three things changed and each one
 * answers a specific instruction:
 *
 *   - IT NO LONGER TAKES AN EVENING. It takes a flat list of frames and an
 *     index into the rendered reading order, so previous and next follow the
 *     composition rather than a grouping. The dialog's accessible name used to
 *     be the DATE of the evening, which is exactly the claim the gallery is not
 *     allowed to make any more, so the name is now the position readout.
 *   - THE VISIBLE DESCRIPTION IS GONE. The panel previously printed the frame's
 *     alt text as a caption under the image. Every visible caption and
 *     description is deleted from this route.
 *   - THE `alt` IS BACK ON THE IMAGE and is no longer empty. It was empty only
 *     because the description was rendered visibly beside it and an identical
 *     alt would have said everything twice. With the caption gone, an empty alt
 *     would leave the enlarged view announcing nothing at all, which is the
 *     accessibility regression REDESIGN-PLAN.md section 8 forbids. An `alt`
 *     attribute is not a caption: a caption is copy every reader sees, and alt
 *     is invisible to sighted readers and is the only route by which a screen
 *     reader user perceives the photograph.
 *
 * THE ALT AND THE STATUS REGION BOTH EXIST, AND THE OVERLAP IS DELIBERATE. The
 * status region is the only thing that fires when the reader presses an arrow
 * or Next, so without the description in it a screen reader user moving through
 * fifteen frames would hear nothing but numbers. The `alt` is the only thing
 * that fires for a browse mode reader who reaches the image itself. Each covers
 * a path the other cannot, and the one path on which both are heard costs a
 * single repeated sentence, which is cheaper than losing either.
 *
 * Why this exists at all, given the brief allows shipping without it
 * ------------------------------------------------------------------
 * The wall renders 640px and 1280px tiles into cells between 304 and 906 CSS
 * px. This panel is wider than the largest cell (`max-w-5xl` is 1024, so the
 * image runs to about 976 CSS px against the largest cell's 906) and it renders
 * the 1280 `view` tier, so opening a frame always makes it bigger rather than
 * smaller. Without this dialog that tier is dead weight in the repository.
 *
 * The brief permits shipping without a lightbox if one cannot be made properly
 * accessible in scope. It can be, because this repository already contains an
 * audited focus trap in `JoinModal.tsx` and this component mirrors it rather
 * than inventing a second one:
 *
 *   - one capture phase keydown listener carrying Escape, the arrows and the
 *     Tab trap, so their ordering is explicit rather than emergent
 *   - focusables re-queried on EVERY Tab, because the navigation buttons change
 *     as the reader moves through the wall
 *   - the body scroll lock restores the PREVIOUS value on close rather than
 *     assuming it was `''`
 *   - the dialog carries an accessible name through `aria-labelledby`
 *
 * A FOCUS ESCAPE THAT WAS IN THE SHIPPED TRAP, FOUND BY TRACING THE TAB ORDER
 * RATHER THAN BY READING THE JSX, AND FIXED HERE.
 * ---------------------------------------------------------------------------
 * On open, focus moves to the panel, which is `tabIndex={-1}`. The focusable
 * selector excludes `[tabindex="-1"]`, so the panel is NOT a member of
 * `focusables`; that list is the close button and the two navigation buttons.
 * The shipped Shift+Tab branch read:
 *
 *     if (!inside || active === first) { preventDefault(); last.focus(); }
 *
 * With focus on the panel, `inside` is true (the panel contains itself) and
 * `active` is not `first`, so NEITHER branch fired, no `preventDefault` ran,
 * and the browser moved focus backwards out of the dialog and into the gallery
 * behind it. The very first Shift+Tab after opening escaped the trap.
 *
 * The fix is one clause: the panel counts as the START boundary. Traced in full
 * for both frame counts rather than argued:
 *
 *   many frames, focusables = [close, previous, next]
 *     Tab from panel        inside, not last            default moves to close
 *     Tab from close        not last                    default moves to previous
 *     Tab from next         is last                     trapped, wraps to close
 *     Shift+Tab from panel  IS the start boundary       trapped, wraps to next
 *     Shift+Tab from close  is first                    trapped, wraps to next
 *     Shift+Tab from next   not first, not panel        default moves to previous
 *   one frame, focusables = [close], first === last
 *     Tab from panel        inside, not last            default moves to close
 *     Tab from close        is last                     trapped, stays on close
 *     Shift+Tab from panel  IS the start boundary       trapped, moves to close
 *     Shift+Tab from close  is first                    trapped, stays on close
 *
 * No path leaves the dialog in either direction at either count.
 *
 * Focus restoration is deliberately NOT done here. It lives in `Gallery.tsx`,
 * which owns the cell buttons and can therefore return focus to the cell of the
 * frame the reader was last looking at rather than to the one they opened. The
 * contract is stated in both files so neither can drop it silently.
 *
 * NO CONTROL SITS ON A PHOTOGRAPH, and that is structural rather than a taste
 * call. Plan section 4.4's Plate Rule keeps type off every photograph on this
 * site, and `buttonStyles.ts` records that the focus ring's contrast sweep is
 * bounded over GREY grounds only, "because nothing focusable sits on a
 * photograph under the Plate Rule". An overlaid close or next control would put
 * a focus indicator on a per pixel ground that no sweep covers. So close sits
 * in the header row above the image and previous and next sit in a row below
 * it, and the image is untouched by both.
 *
 * THE ONE PIECE OF TYPE ATTACHED TO A FRAME IS THE POSITION READOUT, AND IT IS
 * NOT A CAPTION. "Photograph 4 of 15" says where the reader is inside a set of
 * controls; it describes nothing about the photograph, carries no date and
 * makes no claim about the meetups. It is also the dialog's accessible name,
 * which the dialog is required to have. Skill 9.F bans decorative `01 / 4`
 * pagination stamped onto images; this is a navigational readout set outside
 * the frame, next to the controls it belongs to.
 *
 * MEASURED CONTRAST, recomputed with the WCAG relative luminance formula in
 * python rather than copied, light then dark:
 *
 *   --ink readout on the --paper surface                17.965  17.965
 *   1px --ink dialog border vs the surface              17.965  17.965
 *   dialog surface vs --scrim over --paper               4.793   1.000
 *   dialog border  vs --scrim over --paper               3.748  17.965
 *   dialog surface vs --scrim over --band                5.158   1.036
 *   dialog border  vs --scrim over --band                3.483  17.337
 *   close button --muted glyph on --paper                6.601   7.496
 *   close button --ink glyph on the --band hover fill   16.281  16.318
 *   outline Button 1px --edge stroke vs --paper          4.960   4.804
 *   outline Button --ink label on its --paper fill      17.965  17.965
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
 * the fade survives reduced motion.
 */

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface GalleryLightboxProps {
    /** Every frame on the wall, in the rendered reading order. */
    frames: GalleryFrame[];
    /** Index into `frames`, or `null` when the dialog is closed. */
    index: number | null;
    onClose: () => void;
    /** Called with the next index. Wraps at both ends. */
    onNavigate: (nextIndex: number) => void;
}

export function GalleryLightbox({ frames, index, onClose, onNavigate }: GalleryLightboxProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);

    const count = frames.length;
    const open = index !== null && count > 0;
    // Clamped rather than trusted. The page can only produce an in-range index
    // today, but an out-of-range one would otherwise render `undefined.view`.
    const safeIndex = open ? Math.min(Math.max(index, 0), count - 1) : 0;
    const frame = open ? frames[safeIndex] : null;

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
            const {
                onClose: close,
                onNavigate: navigate,
                safeIndex: at,
                count: total,
            } = navRef.current;

            if (e.key === 'Escape') {
                close();
                return;
            }

            // Arrow keys move along the wall and wrap. Wrapping rather than
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

            // The panel is the start boundary as well as `first`. It is
            // `tabIndex={-1}` and therefore not a member of `focusables`, so
            // without this clause a Shift+Tab taken while it holds focus
            // matches neither branch and walks backwards out of the dialog.
            const atStart = !inside || active === first || active === panel;

            if (e.shiftKey) {
                if (atStart) {
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
            {open && frame && (
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl max-h-[92dvh] overflow-y-auto border border-ink bg-paper"
                    >
                        <div className="p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                {/* The position readout, which is also the
                                    dialog's accessible name. Tabular figures so
                                    the line does not shuffle as the reader moves
                                    through the wall. */}
                                <h2
                                    id={titleId}
                                    className="pt-2 text-xl font-medium tracking-tight text-ink tabular-nums"
                                >
                                    Photograph {safeIndex + 1} of {count}
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

                            {/* No <figure> and no <figcaption>. A figure with no
                                visible caption is just an image, and a status
                                region is not a caption. */}
                            <div className="mt-5">
                                {/* The 1280px `view` tier, ONE url per format
                                    and no srcset, fetched only now. A srcset
                                    here would let a 2x display pull a tier this
                                    dialog never renders at: the panel caps at
                                    1024 CSS px and the image at about 976, so
                                    1280 is 1.31x coverage and nothing larger is
                                    useful.

                                    `key` on the <picture> forces a remount when
                                    the frame changes. Without it React reuses
                                    the same <img> node and some browsers hold
                                    the previous decode visible until the new
                                    bytes land, which reads as the arrows having
                                    done nothing.

                                    `src` is the 640px JPEG and `width`/`height`
                                    are the 1280px tier's. That is correct rather
                                    than a mismatch: there is no 1280 JPEG tier
                                    to point at, both tiers are 16:9, and the two
                                    attributes only have to reserve the right
                                    SHAPE. Any browser reaching the <img>
                                    fallback has no avif and no webp, which is a
                                    decade old engine, and it gets the right box
                                    and a smaller file. */}
                                <picture key={frame.slot} className="block">
                                    <source type="image/avif" srcSet={frame.view.avif} />
                                    <source type="image/webp" srcSet={frame.view.webp} />
                                    <img
                                        src={frame.tile.src}
                                        width={frame.view.width}
                                        height={frame.view.height}
                                        alt={frame.alt}
                                        loading="eager"
                                        decoding="async"
                                        className="block h-auto w-full"
                                    />
                                </picture>

                                {/* PERMANENTLY MOUNTED LIVE REGION while the
                                    dialog is open. Only its TEXT changes as the
                                    reader moves, never its existence, which is
                                    what makes a polite live region announce
                                    reliably. Without it, previous and next would
                                    be silent to a screen reader: their entire
                                    effect is swapping an image, and swapping an
                                    image announces nothing.

                                    `sr-only`, so it is not a visible caption.
                                    Nothing on this route prints a description
                                    beside a photograph. */}
                                <p role="status" aria-live="polite" className="sr-only">
                                    Photograph {safeIndex + 1} of {count}. {frame.alt}
                                </p>
                            </div>

                            {/* A wall with a single frame gets no navigation
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
