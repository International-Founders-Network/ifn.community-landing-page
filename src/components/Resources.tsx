import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './Container';
import { Button } from './Button';
import { RESOURCES_DATA } from '../data/resourcesData';
import { ChevronRight, ArrowRight, Search, Filter, Lock, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { useRef, useEffect } from 'react';

const SEGMENT_METADATA: Record<string, { icon: string; color: string; accent: string }> = {
    aspiring: { icon: '🌱', color: 'amber', accent: 'bg-amber-50 text-amber-700 border-amber-100' },
    startups: { icon: '🚀', color: 'blue', accent: 'bg-blue-50 text-blue-700 border-blue-100' },
    smbs: { icon: 'green', color: 'green', accent: 'bg-green-50 text-green-700 border-green-100' },
    global: { icon: '🇺🇸', color: 'indigo', accent: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    global_expansion: { icon: '🌍', color: 'purple', accent: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' }
};

const TAG_COLORS: Record<string, string> = {
    Checklist: 'bg-blue-50 text-blue-600 border-blue-100',
    Guide: 'bg-green-50 text-green-600 border-green-100',
    Template: 'bg-purple-50 text-purple-600 border-purple-100',
    Toolkit: 'bg-orange-50 text-orange-600 border-orange-100',
    Video: 'bg-red-50 text-red-600 border-red-100',
    Worksheet: 'bg-teal-50 text-teal-600 border-teal-100',
    Directory: 'bg-slate-50 text-slate-600 border-slate-100'
};

export function Resources() {
    const { openJoinModal } = useOutletContext<{ openJoinModal?: () => void }>() || {};
    const segments = Object.values(RESOURCES_DATA);
    const [activeSegmentId, setActiveSegmentId] = useState(segments[0].id);
    const [activeStageId, setActiveStageId] = useState(segments[0].stages[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setIsFilterDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeSegment = RESOURCES_DATA[activeSegmentId];

    const resourceTypes = useMemo(() => {
        const types = new Set<string>();
        Object.values(RESOURCES_DATA).forEach(s => {
            Object.values(s.resources).forEach(rs => {
                rs.forEach(r => types.add(r.tag));
            });
        });
        return Array.from(types).sort();
    }, []);

    const filteredResources = useMemo(() => {
        let rs = activeSegment.resources[activeStageId] || [];

        if (activeFilters.length > 0) {
            rs = rs.filter(r => activeFilters.includes(r.tag));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            rs = rs.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query)
            );
        }

        return rs;
    }, [activeSegmentId, activeStageId, activeFilters, searchQuery]);

    const handleSegmentChange = (id: string) => {
        setActiveSegmentId(id);
        setActiveStageId(RESOURCES_DATA[id].stages[0].id);
        setSearchQuery('');
        setActiveFilters([]);
    };

    const activeSegmentMeta = SEGMENT_METADATA[activeSegmentId];

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
                        Tailored resources for every stage of your business, curated for local and international founders in Austin.
                    </motion.p>
                </div>

                {/* Search & Tabs Header */}
                <div className="flex flex-col gap-8 mb-12">
                    {/* Audience Tabs */}
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide sm:justify-center gap-3">
                        {segments.map((segment) => {
                            const meta = SEGMENT_METADATA[segment.id];
                            const isActive = activeSegmentId === segment.id;
                            return (
                                <button
                                    key={segment.id}
                                    onClick={() => handleSegmentChange(segment.id)}
                                    className={`flex-none px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 border cursor-pointer ${isActive
                                        ? `bg-slate-900 text-white shadow-xl shadow-slate-200 border-slate-900 scale-[1.02]`
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                                        }`}
                                >
                                    <span className="text-lg">{meta.icon === 'green' ? '🏪' : meta.icon}</span>
                                    <span className="whitespace-nowrap">{segment.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto w-full relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${activeSegment.name} resources...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                        {/* Sidebar / Stages */}
                        <div className="lg:w-80 bg-slate-50/50 border-r border-slate-100 flex flex-col">
                            <div className="p-8 border-b border-slate-100 lg:border-none">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Select Stage</h3>
                                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-2 lg:pb-0 scrollbar-hide">
                                    {activeSegment.stages.map((stage) => (
                                        <button
                                            key={stage.id}
                                            onClick={() => setActiveStageId(stage.id)}
                                            className={`flex-none lg:w-full text-left p-4 rounded-2xl transition-all duration-300 group relative cursor-pointer ${activeStageId === stage.id
                                                ? 'bg-white shadow-md text-primary ring-1 ring-slate-100'
                                                : 'text-slate-600 hover:bg-white/50'
                                                }`}
                                        >
                                            <div className="font-bold mb-1 flex items-center justify-between gap-4">
                                                <span className="whitespace-nowrap lg:whitespace-normal">{stage.name}</span>
                                                {activeStageId === stage.id && (
                                                    <motion.div layoutId="activeStage" className="hidden lg:block">
                                                        <ChevronRight size={18} />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <div className={`text-xs leading-relaxed hidden lg:block ${activeStageId === stage.id ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {stage.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 lg:p-12 flex flex-col">
                            {/* Breadcrumbs & Header */}
                            <div className="mb-8">
                                <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-4">
                                    <span className={activeSegmentMeta.accent + " px-2 py-0.5 rounded border"}>
                                        {activeSegment.name}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-slate-400">
                                        {activeSegment.stages.find(s => s.id === activeStageId)?.name}
                                    </span>
                                </nav>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Stage Resources</h4>
                                        <p className="text-slate-500">
                                            {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'} matched your criteria
                                        </p>
                                    </div>

                                    {/* Type Filters */}
                                    <div className="relative" ref={filterDropdownRef}>
                                        <button
                                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                                                activeFilters.length > 0
                                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                            }`}
                                        >
                                            <Filter size={16} />
                                            {activeFilters.length === 0 
                                                ? 'Filter by Content' 
                                                : `${activeFilters.length} Filter${activeFilters.length > 1 ? 's' : ''} Active`}
                                            <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isFilterDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    <div className="p-2 flex justify-between items-center border-b border-slate-100">
                                                        <span className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Content Type</span>
                                                        {activeFilters.length > 0 && (
                                                            <button 
                                                                onClick={() => setActiveFilters([])}
                                                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-2"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-1">
                                                        {resourceTypes.map(type => {
                                                            const isSelected = activeFilters.includes(type);
                                                            return (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => {
                                                                        setActiveFilters(prev => 
                                                                            prev.includes(type) 
                                                                                ? prev.filter(t => t !== type)
                                                                                : [...prev, type]
                                                                        );
                                                                    }}
                                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                                                                        isSelected 
                                                                            ? 'bg-primary/10 text-primary' 
                                                                            : 'text-slate-600 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    <span>{type}</span>
                                                                    {isSelected && <Check size={16} className="text-primary" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeSegmentId}-${activeStageId}-${activeFilters.join(',')}-${searchQuery}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1"
                                >
                                    {filteredResources.length > 0 ? (
                                        <>
                                            {filteredResources.every(r => r.isComingSoon) && (
                                                <div className="mb-8 p-6 md:p-8 bg-white border-2 border-slate-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                                                    <div>
                                                        <h5 className="font-bold text-slate-900 text-lg mb-1">We're building resources for this stage.</h5>
                                                        <p className="text-slate-500">Join our community to get notified when they launch.</p>
                                                    </div>
                                                    <Button variant="primary" onClick={() => openJoinModal && openJoinModal()} className="flex-shrink-0 whitespace-nowrap">
                                                        Get Notified
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {filteredResources.map((resource) => (
                                                    <div
                                                        key={resource.id}
                                                        className="group bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200 border border-slate-100 rounded-3xl p-6 transition-all duration-300 flex flex-col"
                                                    >
                                                        <div className="mb-6 flex justify-between items-start">
                                                            <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 ${activeSegmentMeta.accent.split(' ')[1]}`}>
                                                                <resource.icon size={24} />
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <span className={`text-[10px] font-black px-2 py-1 rounded-full border uppercase tracking-tighter ${TAG_COLORS[resource.tag]}`}>
                                                                    {resource.tag}
                                                                </span>
                                                                {resource.isMembersOnly && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                                                                        <Lock size={10} /> PRO
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <h5 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                                            {resource.title}
                                                        </h5>
                                                        <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                                                            {resource.description}
                                                        </p>

                                                        <Button
                                                            variant={resource.isComingSoon ? "ghost" : "primary"}
                                                            size="sm"
                                                            className={`w-full justify-between group/btn ${resource.isComingSoon ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100" : ""}`}
                                                            disabled={resource.isComingSoon}
                                                        >
                                                            {resource.isComingSoon ? "Coming Soon" : (resource.tag === 'Video' ? "Watch Video" : "Access Resource")}
                                                            {!resource.isComingSoon && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search size={32} />
                                            </div>
                                            <h5 className="text-lg font-bold text-slate-900 mb-2">No resources found</h5>
                                            <p className="text-slate-500 max-w-sm mb-8">
                                                We couldn't find any resources matching your search or filters in this stage.
                                            </p>
                                            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setActiveFilters([]); }}>
                                                Clear all filters
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress Footer */}
                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-slate-400">
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span>{(activeSegment.resources[activeStageId] || []).filter(r => !r.isComingSoon).length} Available in this Stage</span>
                                </div>
                                <div className="text-[10px] uppercase font-black tracking-widest">
                                    IFN Resource Hub v2.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
