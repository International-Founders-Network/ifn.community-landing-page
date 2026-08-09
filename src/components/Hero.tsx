import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';
import { HeroVisual } from './HeroVisual';

interface HeroProps {
    onJoinClick: () => void;
}

/** The cycling word in the Italic Welcome headline (DESIGN.md's signature move).
 *  "International" leads because it is the word the organisation is named for, and
 *  it is the single word the headline settles on when motion is switched off. */
const WORDS = ['International', 'Global', 'Immigrant'] as const;

const WORD_INTERVAL_MS = 3000;

/* A quiet dot grid, drawn in CSS. This replaces a texture that used to be fetched
   from transparenttextures.com on the critical path — an external request that let
   a third party see every visitor. */
const DOT_GRID = {
    backgroundImage: 'radial-gradient(rgb(15 23 42 / 0.06) 1px, transparent 0)',
    backgroundSize: '28px 28px',
};

export function Hero({ onJoinClick }: HeroProps) {
    const prefersReducedMotion = useReducedMotion();
    const [index, setIndex] = useState(0);

    // WCAG 2.2.2: nothing may auto-update for a reader who has asked for still
    // interfaces. Framer Motion's transitions are handled globally by
    // <MotionConfig reducedMotion="user">, but this timer is ours to stop — with
    // it stopped the headline simply settles on WORDS[0].
    useEffect(() => {
        if (prefersReducedMotion) return;

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, WORD_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [prefersReducedMotion]);

    const activeWord = WORDS[index];

    return (
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
            {/* Background. Static by design: DESIGN.md permits exactly one piece of
                ambient motion on this page and it is the cycling word above. */}
            <div className="absolute inset-0 bg-slate-50 -z-50" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] -z-40"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] -z-40"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-30"
                style={DOT_GRID}
            />

            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Content */}
                    {/* No opacity in this entrance. This wrapper holds the <h1>, both
                        CTAs and the lead copy — the largest contentful paint of the whole
                        site. Gating opacity here leaves all of it at `opacity: 0` with no
                        animation queued whenever the frame loop does not run (a background
                        tab, a paused rAF, a Motion failure). Animating x alone degrades to
                        "sits 30px left", which is invisible to the user rather than fatal. */}
                    <motion.div
                        initial={{ x: -30 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="flex-1 text-center lg:text-left z-10"
                    >
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-xs mb-6 border border-slate-200 shadow-sm text-slate-800 uppercase tracking-widest"
                        >
                            <span aria-hidden="true" className="flex h-2 w-2 rounded-full bg-primary" />
                            Monthly meetups in Austin, Texas
                        </motion.p>

                        {/* The 60px display step lands at xl, not lg: at lg the column
                            halves to ~440px while the type would jump to 60px, which
                            orphans "Where" on its own line. */}
                        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight">
                            Where{' '}
                            {/* The word slot is an overlapping grid cell. Every candidate
                                word is rendered invisibly in the same cell, so the slot is
                                exactly as wide as the longest one at the current font size
                                — it never jumps as the word changes, and it never forces a
                                line wider than the viewport the way the old min-w-[240px]
                                floor did. Alignment is inherited from the headline, so the
                                word centres on mobile and sits left from lg up. */}
                            <span className="inline-grid">
                                {WORDS.map((word) => (
                                    <span
                                        key={word}
                                        aria-hidden="true"
                                        className="col-start-1 row-start-1 invisible italic"
                                    >
                                        {word}
                                    </span>
                                ))}
                                {/* This is the one emphasis word in the system that cannot use
                                    <Emphasis>: it animates in and out, so it has to be a
                                    motion.span. It carries <Emphasis>'s light-ground colour by
                                    hand — the ground here is bg-slate-50, where Welcome Amber
                                    #f97316 measures 2.68:1 against a 3:1 floor. Its class list
                                    must stay identical to the invisible twins above apart from
                                    colour, or the slot stops sizing to the longest word. */}
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={activeWord}
                                        initial={{ y: '0.3em', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: '-0.3em', opacity: 0 }}
                                        transition={{ duration: 0.4, ease: 'circOut' }}
                                        className="col-start-1 row-start-1 text-accent-on-light italic"
                                    >
                                        {activeWord}
                                    </motion.span>
                                </AnimatePresence>
                            </span>{' '}
                            Founders Connect, Grow, and Succeed
                        </h1>

                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Visas, U.S. banking, hiring across borders, funding norms nobody
                            explained to you. Once a month in Austin, you can ask about any of it out
                            loud, with founders who have already solved it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto group shadow-xl shadow-primary/20"
                                onClick={onJoinClick}
                            >
                                Join the Community
                                <ArrowRight
                                    aria-hidden="true"
                                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                                />
                            </Button>
                            {/* Navigation is an anchor, not a button with a click handler, so
                                it can be opened in a new tab and read as a link. ButtonLink
                                gives it the button's styling from the same source Button uses.
                                No onDark: this sits on bg-slate-50. */}
                            <ButtonLink
                                to="/resources"
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                Browse our resources
                            </ButtonLink>
                        </div>

                        <p className="mt-6 text-sm text-slate-600 font-medium">
                            No pitch deck required · No introduction needed · Come to one meetup and
                            decide
                        </p>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 relative w-full"
                    >
                        <HeroVisual />
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
