import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Button } from './Button';
import { RESOURCES_DATA } from '../data/resourcesData';
import { ArrowRight } from 'lucide-react';

const SEGMENT_METADATA: Record<string, { color: string; accent: string }> = {
    aspiring: { color: 'amber', accent: 'bg-amber-50 text-amber-500 border-amber-200' },
    startups: { color: 'blue', accent: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
    smbs: { color: 'green', accent: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    global: { color: 'indigo', accent: 'bg-blue-50 text-blue-500 border-blue-200' },
    global_expansion: { color: 'purple', accent: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' }
};

export function ResourcesPreview() {
    const segments = Object.values(RESOURCES_DATA);
    const [activeSegmentId, setActiveSegmentId] = useState('startups'); // Default to Tech Startups
    const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

    const activeSegment = RESOURCES_DATA[activeSegmentId];
    // Need a stable reference to prevent weird re-renders
    const stageNodes = activeSegment.stages;

    return (
        <section className="py-24 bg-white overflow-hidden relative border-t border-slate-100">
            <Container>
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 block">
                        Resources
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Your Roadmap from First Idea to Global Scale
                    </h2>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Curated guides, templates, checklists, and toolkits designed for international founders building in the US — matched to exactly where you are in your journey.
                    </p>
                </div>

                {/* Audience Pills */}
                <div className="flex overflow-x-auto pb-4 mb-20 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide sm:justify-center gap-3">
                    {segments.map((segment) => {
                        const isActive = activeSegmentId === segment.id;
                        return (
                            <button
                                key={segment.id}
                                onClick={() => setActiveSegmentId(segment.id)}
                                className={`flex-none px-5 py-2.5 rounded-full font-semibold transition-all duration-300 border text-sm sm:text-base ${isActive
                                    ? `bg-slate-900 text-white shadow-lg border-slate-900`
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {segment.name}
                            </button>
                        );
                    })}
                </div>

                {/* Journey Path Visual */}
                <div className="relative max-w-5xl mx-auto mb-20 min-h-[400px] md:min-h-[250px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSegmentId}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-4"
                        >
                            {/* Horizontal Line connector (Desktop) */}
                            <div className="hidden md:block absolute top-[11px] left-0 right-0 h-[2px] bg-slate-100 z-0">
                                <motion.div
                                    className={`h-full ${SEGMENT_METADATA[activeSegmentId].accent.split(' ')[0]}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Vertical Line connector (Mobile) */}
                            <div className="block md:hidden absolute left-[11px] top-0 bottom-0 w-[2px] bg-slate-100 z-0">
                                <motion.div
                                    className={`w-full ${SEGMENT_METADATA[activeSegmentId].accent.split(' ')[0]}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>

                            {stageNodes.map((stage, index) => {
                                const resourceCount = activeSegment.resources[stage.id]?.length || 0;
                                const isHovered = hoveredStageId === stage.id;

                                return (
                                    <motion.div
                                        key={stage.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.15, duration: 0.4 }}
                                        className="relative z-10 flex flex-row md:flex-col items-start gap-4 md:items-center text-left md:text-center group flex-1"
                                        onMouseEnter={() => setHoveredStageId(stage.id)}
                                        onMouseLeave={() => setHoveredStageId(null)}
                                    >
                                        <div className="flex-shrink-0">
                                            <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-300
                                                ${isHovered
                                                    ? `bg-white ${SEGMENT_METADATA[activeSegmentId].accent.split(' ')[2]} shadow-md scale-110`
                                                    : 'bg-white border-slate-200'
                                                }
                                            `}>
                                                <div className={`w-2 h-2 rounded-full ${isHovered ? SEGMENT_METADATA[activeSegmentId].accent.split(' ')[0] : 'bg-slate-300'}`} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:items-center group-hover:-translate-y-1 transition-transform duration-300 md:mt-4 w-full">
                                            <h4 className="font-bold text-slate-900 mb-1 leading-tight">{stage.name}</h4>
                                            <p className="text-sm text-slate-500 leading-snug hidden md:block opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity">
                                                {stage.description}
                                            </p>
                                            <p className="text-sm text-slate-500 leading-snug md:hidden">
                                                {stage.description}
                                            </p>
                                            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-sm border border-slate-100 self-start md:self-center">
                                                {resourceCount} Resources
                                            </span>
                                        </div>

                                        {/* Desktop Tooltip */}
                                        <AnimatePresence>
                                            {isHovered && activeSegment.resources[stage.id]?.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/10 z-50 hidden md:block pointer-events-none"
                                                >
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-700">Sample Resources</div>
                                                    <ul className="space-y-3">
                                                        {activeSegment.resources[stage.id].slice(0, 3).map(r => (
                                                            <li key={r.id} className="text-sm flex items-start gap-2">
                                                                <span className="text-slate-500 mt-0.5">•</span>
                                                                <span className="leading-snug">{r.title}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Quick Stats Row */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500 mb-12">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 5 Founder Tracks</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 25+ Stages</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 130+ Resources</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Guides, Templates & Checklists</span>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/resources">
                        <Button size="lg" className="group">
                            Explore the Full Resource Hub
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <a href="mailto:hello@ifn.community" className="block mt-6 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        Have a resource idea? Suggest one →
                    </a>
                </div>
            </Container>
        </section>
    );
}

