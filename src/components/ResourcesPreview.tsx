import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';
import { RESOURCES_DATA } from '../data/resourcesData';
import { ArrowRight } from 'lucide-react';

export function ResourcesPreview() {
    const segments = Object.values(RESOURCES_DATA);
    const [activeSegmentId, setActiveSegmentId] = useState('startups');
    const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

    const activeSegment = RESOURCES_DATA[activeSegmentId];
    const stageNodes = activeSegment.stages;

    // Counted from the data rather than typed in, so the sentence cannot drift
    // away from the library. The previous "130+ Resources" was invented: the
    // library holds 113 entries, and not one of them has a link yet — so no
    // resource count appears here at all. Real titles are the honest proof.
    const stageCount = segments.reduce((total, segment) => total + segment.stages.length, 0);

    // Anything still marked "Coming Soon" is excluded: this strip presents
    // titles as what the library already holds.
    const examples = stageNodes
        .flatMap(stage => (activeSegment.resources[stage.id] ?? []).filter(r => !r.isComingSoon).slice(0, 1))
        .slice(0, 3);

    return (
        // Named so this band can be linked to, matching id="events" above it.
        // Note for anyone adding a "/#resources" link: the section sits behind a
        // lazy boundary, so ScrollToAnchor's fixed 100ms timer can look for it
        // before the chunk resolves.
        <section id="resources" className="py-24 bg-white relative overflow-hidden">
            <Container>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase mb-4">
                        Resource library
                    </p>
                    {/* Headline scale, not Display: Display is reserved for the page
                        <h1>, and every sibling section on Home uses this size. */}
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                        Written guides for the parts nobody explains to you
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Registering a company in the United States, opening a business bank account,
                        working inside the limits of a visa, raising money under rules you did not grow
                        up with. The library sorts guides, templates and checklists by the kind of
                        founder you are and the stage you have reached.
                    </p>
                </div>

                {/* Audience selector. Filter buttons, so aria-pressed carries the
                    state — the fill alone would leave it invisible to a screen
                    reader. min-h-11 clears the 44px touch target. */}
                <div
                    role="group"
                    aria-label="Choose a founder path"
                    className="flex overflow-x-auto pb-4 mb-16 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center gap-3"
                >
                    {segments.map((segment) => {
                        const isActive = activeSegmentId === segment.id;
                        return (
                            <button
                                key={segment.id}
                                type="button"
                                onClick={() => setActiveSegmentId(segment.id)}
                                aria-pressed={isActive}
                                className={`flex-none inline-flex items-center min-h-11 px-5 rounded-full font-semibold border text-sm sm:text-base transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isActive
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {segment.name}
                            </button>
                        );
                    })}
                </div>

                {/* The path through the stages */}
                <div className="relative max-w-5xl mx-auto mb-16 min-h-[36rem] md:min-h-[15rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSegmentId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="relative flex flex-col md:flex-row justify-between items-start gap-10 md:gap-4"
                        >
                            {/* Connector, drawn once when the path changes. Navy, not a
                                fifth brand colour: structure is monochrome here. */}
                            <div aria-hidden="true" className="hidden md:block absolute top-[11px] left-0 right-0 h-[2px] bg-slate-100 z-0">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <div aria-hidden="true" className="block md:hidden absolute left-[11px] top-0 bottom-0 w-[2px] bg-slate-100 z-0">
                                <motion.div
                                    className="w-full bg-primary"
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>

                            {stageNodes.map((stage, index) => {
                                const isHovered = hoveredStageId === stage.id;

                                return (
                                    <motion.div
                                        key={stage.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        className="relative z-10 flex flex-row md:flex-col items-start md:items-center gap-4 text-left md:text-center flex-1"
                                        onMouseEnter={() => setHoveredStageId(stage.id)}
                                        onMouseLeave={() => setHoveredStageId(null)}
                                    >
                                        <div aria-hidden="true" className="flex-shrink-0">
                                            <div
                                                className={`w-6 h-6 rounded-full bg-white border flex items-center justify-center transition-colors duration-300 ${isHovered ? 'border-accent' : 'border-slate-200'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isHovered ? 'bg-accent' : 'bg-slate-300'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* One description, always visible. It used to be
                                            rendered twice — once for mobile and once at
                                            opacity-0 for desktop — so a screen reader read
                                            every stage description twice. */}
                                        <div className="flex flex-col md:items-center md:mt-4 w-full">
                                            <h3 className="font-bold text-slate-900 mb-1 leading-tight">{stage.name}</h3>
                                            <p className="text-sm text-slate-600 leading-snug">{stage.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Real titles, pulled straight from the library for whichever path
                    is selected. Three things a visitor can check beat a number
                    they cannot. */}
                {examples.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 text-center mb-5">
                            Inside the {activeSegment.name} path
                        </h3>
                        <ul className="grid gap-4 sm:grid-cols-3">
                            {examples.map((resource) => (
                                <li
                                    key={resource.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {resource.tag}
                                    </span>
                                    <p className="mt-2 font-semibold text-slate-900 leading-snug">{resource.title}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Only figures that can be counted in the data itself. */}
                <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium text-slate-600 mb-12">
                    <li>{segments.length} founder paths</li>
                    <li aria-hidden="true" className="text-slate-300">/</li>
                    <li>{stageCount} stages</li>
                    <li aria-hidden="true" className="text-slate-300">/</li>
                    <li>Guides, templates and checklists</li>
                </ul>

                {/* CTA. A link, not a button, because it navigates — and a <button>
                    nested inside an <a> is invalid HTML. `shadow-lg shadow-primary/20`
                    is the Action Glow, the one resting shadow the system permits and
                    only beneath a large primary call to action. */}
                <div className="text-center">
                    <ButtonLink
                        to="/resources"
                        variant="primary"
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        Browse the resource library
                        <ArrowRight size={18} aria-hidden="true" />
                    </ButtonLink>
                    <p className="mt-6 text-sm text-slate-600">
                        Something missing that you needed?{' '}
                        <a
                            href="mailto:hello@ifn.community"
                            className="font-semibold text-primary underline underline-offset-4 decoration-slate-300 hover:decoration-primary transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            Email hello@ifn.community
                        </a>
                        .
                    </p>
                </div>
            </Container>
        </section>
    );
}
