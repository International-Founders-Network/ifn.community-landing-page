import { useState, useEffect } from 'react';
import { preload } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { photos } from '../data/photos.generated';

interface HeroProps {
    onJoinClick: () => void;
}

const heroBand = photos['hero-band'];

/**
 * LCP PRELOAD (plan section 7 "Delivery", and the brief's explicit instruction).
 *
 * React 19 hoists this into <head> as
 * `<link rel="preload" as="image" imagesrcset=... imagesizes=... type=...
 *  fetchpriority="high">`. It is issued from module scope so it fires when the
 * Home chunk evaluates, which is one render pass ahead of the <img> below.
 *
 * `imageSrcSet` and `imageSizes` are the SAME strings the <picture> hands its
 * AVIF <source>, byte for byte, and both come from the same generated object.
 * If they ever diverge the browser preloads one tier and then downloads another,
 * which is a double fetch rather than a speed-up.
 *
 * `type` is declared so a user agent that cannot decode AVIF skips the preload
 * instead of spending the request on a file it will throw away. Those browsers
 * fall through to the WebP source at normal priority. No `crossOrigin`: the file
 * is same origin and requested in no-cors mode, and naming it here would make
 * the preload miss the <img>'s own request.
 *
 * The href is looked up BY WIDTH rather than by position in the ladder. It used
 * to be `derivatives[2]`, which happened to be the 1440 tier and would silently
 * become some other tier the moment the manifest's output list for this slot
 * gained or lost a row. That list is edited by the photo pipeline, not by this
 * component, and it was edited this round, so an index into it is a silent
 * failure waiting on someone else's file. The lookup falls back to the widest
 * tier if 1440 ever leaves the ladder, which is a correct preload rather than a
 * crash. It is also only the fallback target: every browser that understands
 * `imagesrcset` picks from the srcset below and ignores this value entirely.
 *
 * STATED TENSION, not hidden. Plan section 7 makes the preload conditional on
 * measurement, because at 1366x768 the band sits below the fold and the request
 * competes with the Archivo preload that gates the TEXT LCP. The brief overrides
 * that with an instruction to preload, so this ships. The narrower lever, a
 * static <link> in index.html, is the only version that beats the module chunk,
 * and index.html is not this component's file. The exact line is handed to the
 * integrator in the delivery notes.
 */
const heroBandPreloadHref =
    heroBand.derivatives.find((tier) => tier.width === 1440)?.avif ??
    heroBand.derivatives[heroBand.derivatives.length - 1].avif;

preload(heroBandPreloadHref, {
    as: 'image',
    type: 'image/avif',
    imageSrcSet: heroBand.avif,
    imageSizes: heroBand.sizes,
    fetchPriority: 'high',
});

/** The cycling word. Three ways this audience names itself, in one slot.
 *
 *  "International" leads because it is the word the organisation is named for,
 *  and it is the word the headline settles on when motion is switched off.
 *
 *  It carries NO accent and NO mark (plan section 4.3). The mark means
 *  "checkable", and how a founder names their own origin is not a checkable
 *  fact. It is the light rung of the weight ladder instead. */
const WORDS = ['International', 'Global', 'Immigrant'] as const;

const WORD_INTERVAL_MS = 3000;

/**
 * THE HERO'S MARK, AND WHY IT IS NOT THE SAME COMPONENT THE OTHER SECTIONS USE.
 *
 * Accent type plus a 3px accent rule, the page's standard mark construction.
 * Two things about it are specific to this file and neither is cosmetic.
 *
 * 1. IT IS DRIVEN BY `animate`, NEVER BY `whileInView`. The load-bearing comment
 *    on the entrance wrapper below bans `whileInView` anywhere in the hero,
 *    because this subtree is the largest contentful paint of the whole site and
 *    a viewport observer that never fires leaves its target at `initial`
 *    forever. Every other Mark in this codebase is a `whileInView` component
 *    and not one of them could be reused here without importing that failure
 *    mode into the LCP element. `initial` plus `animate` runs on mount, with no
 *    observer involved at all.
 *
 * 2. THE ANIMATED PROPERTY IS scaleX AND NOTHING ELSE. Same ban, second half:
 *    no opacity, no clip-path, no mask anywhere above the band. A rule that
 *    fails to draw is a rule at `scaleX(0)`, which is an invisible underline
 *    under a word that still reads correctly. A rule that fails to fade in
 *    would be the same, but opacity composites down the ancestor chain and the
 *    ban exists because that has already broken this component twice.
 *
 * GEOMETRY. The rule is absolutely positioned, so it adds no height and cannot
 * change the h1's line count: measured at eight widths, the h1 box is identical
 * to the pixel with and without it. `whitespace-nowrap` is inert on a single
 * word and is kept so the construction matches its siblings. There is no
 * descender reserve because "Succeed" has no descender, and `-bottom-1` clears
 * the baseline at every size the clamp produces; a phrase with a `g` or a `y`
 * would need the `pb-[0.18em]` reserve the other Marks carry.
 *
 * The word sits on the LAST line of the headline at every width from 320 up, so
 * the rule never lands between two lines of an h1 set at `leading-[0.95]`.
 * Check that again before marking any other word in this headline.
 */
function Mark({ children, reduce }: { children: React.ReactNode; reduce: boolean }) {
    return (
        <span className="relative inline-block whitespace-nowrap text-accent">
            {children}
            <motion.span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 block h-[3px] w-full origin-left bg-accent"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.26, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
        </span>
    );
}

export function Hero({ onJoinClick }: HeroProps) {
    const prefersReducedMotion = useReducedMotion();
    const [index, setIndex] = useState(0);

    // WCAG 2.2.2: nothing may auto-update for a reader who has asked for still
    // interfaces. Framer Motion's transitions are handled globally by
    // <MotionConfig reducedMotion="user">, but a setInterval is a plain JS timer
    // that MotionConfig cannot reach, so it is ours to stop, and with it stopped
    // the headline simply settles on WORDS[0].
    useEffect(() => {
        if (prefersReducedMotion) return;

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, WORD_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [prefersReducedMotion]);

    const activeWord = WORDS[index];

    return (
        // LAYOUT FAMILY: poster stack above a full-bleed photographic band
        // (plan section 5, row 1). Nothing else on this page is a full-bleed
        // image, and nothing else runs a headline to the page gutter.
        //
        // min-h-[100dvh], never h-screen: h-screen resolves against the largest
        // viewport on iOS Safari and jumps when the address bar collapses.
        //
        // The column is `flex` so any slack on a short viewport lands ABOVE the
        // band rather than after it, which keeps the photograph flush to the
        // bottom edge of the section instead of leaving a strip of ground under
        // it.
        <section className="relative flex min-h-[100dvh] flex-col bg-paper">
            {/* THE POSTER.
                Its own gutter, `clamp(1rem, 6vw, 6.5rem)`, rather than
                Container's px-4/6/8. That gutter is part of what makes this
                section's geometry distinct from every other section, and it is
                measured: it resolves to 82.0px at 1366 (content measure 1202px),
                104px at 1920 (content capped by max-w-7xl at 1280px) and 16px at
                360 (measure 316.8px). All three were read out of a rendered page,
                not derived.

                pt-24 is the cap in the brief and the skill (section 4.7). The
                navbar is `fixed` with no spacer in App.tsx, so 96px of padding
                against a 64px bar plus its 1px hairline is 31px of visible
                clearance under the nav. Do not raise it: the plan's own stack
                arithmetic added 64px of nav to 80px of padding on the assumption
                of a spacer that does not exist. */}
            <div className="grow px-[clamp(1rem,6vw,6.5rem)] pt-24 pb-14 md:pb-16">
                <div className="mx-auto max-w-7xl">
                    {/* NO OPACITY IN THIS ENTRANCE, AND THIS IS THE LOAD BEARING
                        COMMENT IN THE FILE.

                        This wrapper holds the h1, the subtext and both CTAs,
                        which together are the largest contentful paint of the
                        whole site. Opacity composites multiplicatively down the
                        ancestor chain, so gating it here leaves all of it at
                        `opacity: 0` with no animation queued whenever the frame
                        loop does not run: a background tab, a paused rAF, a
                        Motion failure. The second audit measured exactly that on
                        this component after the first audit reported it fixed,
                        because a single-element read of getComputedStyle cannot
                        see an ancestor's contribution.

                        Translating y degrades to "sits 16px low", which is
                        invisible to a reader rather than fatal. Nothing above the
                        band may animate opacity, clip-path or mask, and nothing
                        here may use whileInView. */}
                    <motion.div
                        initial={{ y: 16 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Eyebrow, 1 of the page's 2 allocated eyebrows.
                            Ships as bare tracked type, with no pill and no dot.
                            The dot is banned by skill 9.F and independently by
                            this plan: it is accent that marks nothing and it
                            would spend one of the two marks the density rule
                            allows per viewport. The pill goes with it because
                            plan section 4.4 reserves the full radius for
                            DISCRETE INTERACTIVE controls, and an eyebrow is
                            neither, so a rounded-full eyebrow would be the one
                            object on the page breaking the shape lock. */}
                        {/* REPOSITIONED. This used to read "Monthly meetups in
                            Austin, Texas", which spent the page's first line on
                            the event schedule. The eyebrow now names the reader
                            instead of the calendar: the meetup is how this
                            community gathers, not what it is. Austin moves down
                            into the subtext, and the schedule keeps its own
                            section further down the page.

                            THREE DOCUMENTS STILL QUOTE THE OLD STRING AS THE
                            SHIPPED ONE: `REDESIGN-PLAN.md:266`, its audit table
                            at `REDESIGN-PLAN.md:589`, and `DESIGN.md:335`. All
                            three use it to count this page's eyebrow budget,
                            and THE COUNT IS UNAFFECTED, because this is still
                            one eyebrow in the same slot and PartnersStrip still
                            holds the other. Only the words changed. Amending
                            those files is handed over rather than done here;
                            the plan is not this component's file. */}
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            For international founders building in the U.S.
                        </p>

                        {/* THE WEIGHT LADDER (plan section 4.3).
                            Three rungs, no italic: `wght 300` on the cycling
                            word, `500` on the line, `800` on "Founders". That is
                            IFN's own event slide, which sets International light
                            against Founders black, and it is why italic is
                            retired here: it clipped the descender on "Immigrant"
                            and it carried emphasis in a hue, which a colourblind
                            reader cannot see.

                            THE LADDER IS NOW THREE RUNGS PLUS A MARK, and the
                            distinction matters because this comment used to read
                            "no italic and no colour". "Succeed" carries the
                            accent mark at the founder's direction. It does not
                            break the colourblind argument above, and that is the
                            whole reason the mark is a construction rather than a
                            hue: the 3px rule under the word is a non-colour
                            indicator measuring 7.054 against `--paper` in both
                            modes, so a reader who cannot see the accent still
                            sees the mark. Strip the colour entirely and the
                            emphasis survives. That was never true of the italic
                            this ladder retired.

                            THE CYCLING WORD IS STILL UNMARKED AND UNCOLOURED,
                            which is the rule stated at `WORDS` above: a mark
                            means "checkable", and how a founder names their own
                            origin is not a checkable fact. Do not move the mark
                            onto it.

                            Measured, not asserted: clamp resolves to 81.96px at
                            1366 and the headline sets in 2 lines with every one
                            of the three candidate words; 84px and 2 lines at
                            1920; 44px and 5 lines at 360, with document
                            scrollWidth equal to viewport width at 360 and 390,
                            so the slot cannot force horizontal overflow the way
                            the retired min-w-[240px] floor did.

                            THE TAIL SURVIVED THE REPOSITIONING BY FOUNDER
                            DECISION, AND THAT IS WORTH ONE LINE SO IT IS NOT
                            REOPENED AS AN OVERSIGHT. The brief behind the rest
                            of this page's copy asks for concrete language in
                            place of "Connect, Grow, and Succeed", and a
                            replacement was measured across seven candidates at
                            the eight widths above and then not taken. The
                            headline stays as shipped; the eyebrow above and the
                            subtext below carry the repositioning instead. Every
                            number in this comment is therefore the original
                            measurement, still current, rather than a re-measured
                            one. */}
                        <h1 className="mt-6 text-ink font-medium text-[clamp(2.75rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.025em]">
                            Where{' '}
                            {/* THE SLOT.
                                An overlapping inline-grid: every candidate word
                                is rendered invisibly in one cell, so the slot is
                                exactly as wide as the longest of them at the
                                current font size. It never jumps as the word
                                changes and it never forces a line wider than the
                                viewport.

                                The twins stay IN FLOW. They are what the outer
                                inline-grid takes its baseline from, and they are
                                why the clip window below can be
                                `absolute inset-0` without disturbing the line:
                                an out-of-flow box contributes to neither the
                                grid's sizing nor its baseline. Measured at 1366
                                and 1920: a probe glyph inside the window and one
                                outside it share a baseline to 0.00px. Putting
                                `overflow: hidden` on the inline-grid itself
                                instead would move its baseline to its bottom
                                margin edge and lift the word roughly 28px off
                                the line.

                                leading-[1.15] with pb-1 reserve is the descender
                                clearance: "Immigrant" carries a g, and a
                                vertical roll inside a clipped slot cuts a
                                descender exactly the way leading-none does. The
                                cost is measured and accepted: this line box is
                                90px against the following line's 78px at 1366,
                                so the first headline line sits 12px looser. At
                                desktop the headline is 2 lines, so there is one
                                gap and nothing to compare it against.

                                ALIGNMENT IS BREAKPOINT SCOPED AND THE
                                BREAKPOINT WAS SWEPT, NOT GUESSED. The slot is
                                as wide as "International"; "Global" leaves 210px
                                of slack at 1366. Left aligned, that whole gap
                                lands between the word and "Founders" and reads
                                as a missing word, so from `sm` up it is centred
                                and reads as poster spacing instead. Below that
                                the slot is the last thing on its line or alone
                                on one, where the slack is invisible at the left
                                and centring would indent a single word off a
                                flush left column. Sweeping 320px to 1500px in
                                4px steps put the crossover, the width at which
                                "Founders" joins the slot's line, at 644px. `sm`
                                is 640, so a 4px band of viewports centres a line
                                end slot. Document scrollWidth equalled viewport
                                width at every one of those 296 widths. */}
                            <span className="relative inline-grid font-light leading-[1.15] pb-1">
                                {WORDS.map((word) => (
                                    <span
                                        key={word}
                                        aria-hidden="true"
                                        className="col-start-1 row-start-1 invisible"
                                    >
                                        {word}
                                    </span>
                                ))}
                                <span className="absolute inset-0 overflow-hidden text-left sm:text-center">
                                    {/* TRANSFORM ONLY. No opacity, on purpose.
                                        `initial={false}` on AnimatePresence
                                        renders the first word at its resting
                                        position, so first paint (the LCP paint)
                                        is correct even if no frame ever runs.
                                        An opacity-gated word would leave a hole
                                        in the h1 in exactly that case. */}
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={activeWord}
                                            initial={{ y: '100%' }}
                                            animate={{ y: '0%' }}
                                            exit={{ y: '-100%' }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="block"
                                        >
                                            {activeWord}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            </span>{' '}
                            <span className="font-extrabold">Founders</span> Connect, Grow, and{' '}
                            <Mark reduce={Boolean(prefersReducedMotion)}>Succeed</Mark>
                        </h1>

                        {/* THE 7fr / 5fr SPLIT.
                            The subtext and the actions take 7 of 12 columns and
                            the remaining 5 are deliberately empty. The asymmetry
                            is the composition: it holds the lead at a readable
                            measure under a headline that runs the full width,
                            and it is the reason this section does not read as a
                            centred stack.

                            THE SPLIT STARTS AT `lg`, NOT `md`, AND THAT IS A
                            MEASUREMENT. The two lg buttons plus their gap need
                            489px on one line. At `md` (768px) seven of twelve
                            columns is 394px, so the row would either wrap both
                            labels or, with buttonClasses' `sm:whitespace-nowrap`
                            holding them, spill out of its own column. At `lg`
                            (1024px) the same column is 526px, which clears 489
                            by 37. Measured in a rendered page at 640, 768, 1024
                            and 1366: the actions row is 56px tall, one line, at
                            every one of them, and document scrollWidth never
                            exceeds the viewport.

                            COLLAPSE, declared here rather than assumed:
                            below `lg` (1024px) the grid does not exist at all
                            and the block is a single full-width column. Below
                            `sm` (640px) the actions stack vertically and each
                            button goes full width. */}
                        <div className="lg:grid lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                {/* SUBTEXT. It still answers "ask who?", which is
                                    the one requirement carried forward from the
                                    line before it: "founders who have already
                                    done it" is the sentence's only piece of
                                    reassurance, and a shorter line that drops it
                                    buys a word count with the offer.

                                    THE LENGTH IS A CEILING SET BY A FOUNDER
                                    DECISION, NOT BY TASTE, AND THE REPOSITIONING
                                    BRIEF PUSHED AGAINST IT. This slot once held a
                                    33 word, 186 character, 3 line string, and the
                                    founder's copy delegation of 2026-08-09 cut it
                                    to 19 words and 112 characters precisely to get
                                    it to 2 lines. The brief that produced this
                                    rewrite supplied a 210 character direction,
                                    which is longer than the string that was
                                    already rejected once. It is deliberately NOT
                                    taken verbatim: the sense is kept and the
                                    length is held near the standing cap, which
                                    is the reading that honours both instructions.

                                    What the widened list buys: fundraising and
                                    market entry now sit beside visas, banking and
                                    hiring, so the hero names the whole journey
                                    rather than three of its problems, and
                                    "introductions" is the one word carrying the
                                    part of IFN that is not an answer. Austin
                                    survives as the closing clause rather than as
                                    the subject, so the meetup reads as where this
                                    starts and not as what it is.

                                    RE-MEASURED RATHER THAN ASSUMED, AND THE
                                    WORDING WAS CUT TWICE TO LAND IT. 129
                                    characters against the outgoing 112. Rendered
                                    line counts, new against old:

                                      360   4 lines  (was 3)
                                      390   4 lines  (was 3)
                                      768   2 lines  (was 2)
                                      1024  2 lines  (was 2)
                                      1366  2 lines  (was 2)
                                      1920  2 lines  (was 2)

                                    So the 2 line target the founder's cut was
                                    made to hit is held at every width from 768
                                    up, and the cost is one extra line on a
                                    phone. Two longer drafts were measured and
                                    rejected on this table rather than on taste:
                                    both ran to 3 lines at 1024, which is the
                                    width where this column is narrowest relative
                                    to its type size. "Market entry" was the
                                    clause dropped to buy it back; it survives in
                                    ValueProps and in the FAQ, where there is
                                    measure for it.

                                    --ink rather than --muted: this is primary
                                    body copy, not a caption, and it measures
                                    17.965 on --paper in both modes. */}
                                <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-ink">
                                    Visas, U.S. banking, hiring, fundraising. Practical answers and
                                    introductions from founders who have done it, starting in
                                    Austin.
                                </p>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto"
                                        onClick={onJoinClick}
                                    >
                                        Join the community
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="ml-2 h-5 w-5"
                                            strokeWidth={1.5}
                                        />
                                    </Button>
                                    {/* Navigation is an anchor, not a button with
                                        a click handler, so it can be opened in a
                                        new tab and is announced as a link.
                                        ButtonLink shares buttonClasses with
                                        Button so the two can never drift. */}
                                    <ButtonLink
                                        to="/resources"
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto"
                                    >
                                        Browse our resources
                                    </ButtonLink>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* THE BAND.
                Full bleed, edge to edge, breaking the poster's gutter. It is a
                real documentary photograph of a real IFN evening, replacing a
                div and CSS globe medallion that skill 9.E bans outright.

                THE FRAME WAS RESELECTED ON 2026-08-10 AND NOTHING IN THIS FILE
                MOVED FOR IT. The band used to be
                `meetups/20260423_184515.jpg`; it is now
                `meetups/20260423_184527.jpg`, the same room minutes apart, at
                the same crop box `{left 0, top 585, width 4000, height 1667}`
                and the same 2.4:1 ratio, so the swap is a manifest edit and
                this component is unchanged by it. The reason is the founder's
                instruction to favour people, faces and energy: rendered at
                1440x600 through the build pipeline, `184515` gives roughly its
                lower left quarter to empty chairs, a backpack on the floor and
                bare concrete, while `184527` fills that space with the group
                and puts about nine faces in legible range, six of them still
                legible at the 768px placement. Plan section 7's own design
                preference on this slot survives the swap and was rechecked by
                rendering rather than argued: the brightest objects in the band
                are still the two IFN meetup screens and the daylight through
                the glass wall, and the former venue gear is smaller and lower
                in the frame than it was in `184515`, where it was the dominant
                graphic left of centre. Section 7's hero row still names
                `184515` and needs amending; that is handed over rather than
                edited here.

                THE CROP IS FIXED ACROSS BREAKPOINTS. There is no per width art
                direction in this slot and the image is `h-auto w-full` with no
                `object-fit`, so 360, 768, 1024 and 1440 render the same pixels
                at 150, 320, 427 and 600 CSS px tall. No face is cut by any edge
                of the crop at any of them. What does change with width is
                legibility, and it is stated rather than glossed: at 360 the
                band reads as a full room of people rather than as individual
                faces, which is the honest ceiling for a 2.4:1 full bleed band
                on a phone and is true of every candidate frame in the folder.

                THE PLATE RULE: no type sits on it, ever, and no caption sits over
                it. Its derivation is a measurement rather than a preference, an
                ink scrim over the worst real pixel inside a candidate frame's
                type zone needs an alpha that erases the photograph before it
                reaches AAA, so the whole class of case is deleted rather than
                mitigated.

                No entrance animation. Plan section 6's LCP guard bars whileInView
                and any opacity, clip-path or mask on the band, and there is
                nothing left worth animating on a photograph that is meant to be
                the first thing painted.

                CLS is zero by construction: `width` and `height` are the
                intrinsic dimensions of the fallback tier and every tier in the
                srcset shares one aspect ratio to within 0.5 percent, which the
                build script enforces, so one reserved box is correct whichever
                tier the browser picks.

                fetchPriority is written as "high" rather than read from the
                manifest, which still carries the pre-decision default of "auto". */}
            <div className="w-full">
                <picture>
                    <source type="image/avif" srcSet={heroBand.avif} sizes={heroBand.sizes} />
                    <source type="image/webp" srcSet={heroBand.webp} sizes={heroBand.sizes} />
                    <img
                        src={heroBand.src}
                        width={heroBand.width}
                        height={heroBand.height}
                        alt={heroBand.alt}
                        loading={heroBand.loading}
                        fetchPriority="high"
                        decoding="async"
                        className="block h-auto w-full"
                    />
                </picture>
            </div>
        </section>
    );
}
