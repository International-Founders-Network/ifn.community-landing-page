import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './Container';
import { Button } from './Button';
import { RESOURCES_DATA } from '../data/resourcesData';
import { ChevronRight, ArrowRight } from 'lucide-react';

export function Resources() {
    const segments = Object.values(RESOURCES_DATA);
    const [activeSegmentId, setActiveSegmentId] = useState(segments[0].id);
    const [activeStageId, setActiveStageId] = useState(segments[0].stages[0].id);

    const activeSegment = RESOURCES_DATA[activeSegmentId];
    const activeResources = activeSegment.resources[activeStageId] || [];

    const handleSegmentChange = (id: string) => {
        setActiveSegmentId(id);
        setActiveStageId(RESOURCES_DATA[id].stages[0].id);
    };

    return (
        <section className="py-24 bg-slate-50 overflow-hidden" id="resources">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
                    >
                        Your Founder's Journey
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        Tailored resources for every stage of your business, whether you're building a tech startup,
                        a sustainable SMB, or expanding internationally.
                    </motion.p>
                </div>

                {/* Segment Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {segments.map((segment) => (
                        <button
                            key={segment.id}
                            onClick={() => handleSegmentChange(segment.id)}
                            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeSegmentId === segment.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {segment.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row min-h-[500px]">
                        {/* Sidebar / Stages */}
                        <div className="lg:w-80 bg-slate-50/50 border-r border-slate-100 p-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Select Stage</h3>
                            <div className="space-y-3">
                                {activeSegment.stages.map((stage) => (
                                    <button
                                        key={stage.id}
                                        onClick={() => setActiveStageId(stage.id)}
                                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative ${activeStageId === stage.id
                                            ? 'bg-white shadow-md text-primary'
                                            : 'text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <div className="font-bold mb-1 flex items-center justify-between">
                                            {stage.name}
                                            {activeStageId === stage.id && (
                                                <motion.div layoutId="activeStage">
                                                    <ChevronRight size={18} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className={`text-xs leading-relaxed ${activeStageId === stage.id ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {stage.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 lg:p-12">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeSegmentId}-${activeStageId}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-10">
                                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                                            {activeSegment.name} • {activeSegment.stages.find(s => s.id === activeStageId)?.name}
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Stage Resources</h4>
                                        <p className="text-slate-500">Essential tools and guides curated by our network expert.</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {activeResources.length > 0 ? (
                                            activeResources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className="group bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200 border border-slate-100 rounded-3xl p-6 transition-all duration-300"
                                                >
                                                    <div className="mb-6 flex justify-between items-start">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                            <resource.icon size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold bg-white text-slate-400 px-2 py-1 rounded-full border border-slate-100 uppercase tracking-tighter">
                                                            {resource.tag}
                                                        </span>
                                                    </div>

                                                    <h5 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                                        {resource.title}
                                                    </h5>
                                                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                                        {resource.description}
                                                    </p>

                                                    <Button
                                                        variant={resource.isComingSoon ? "ghost" : "primary"}
                                                        size="sm"
                                                        className={`w-full justify-between group/btn ${resource.isComingSoon ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100" : ""}`}
                                                        disabled={resource.isComingSoon}
                                                    >
                                                        {resource.isComingSoon ? "Coming Soon" : "Access Resource"}
                                                        {!resource.isComingSoon && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center">
                                                <div className="text-slate-400 italic mb-2">More resources being added...</div>
                                                <Button variant="outline" size="sm">Request a Resource</Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
