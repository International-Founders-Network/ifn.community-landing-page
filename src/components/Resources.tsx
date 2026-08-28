import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './Container';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { cn } from '../lib/cn';
import { Emphasis } from './Emphasis';
import { RESOURCES_DATA } from '../data/resourcesData';
import type { Resource } from '../data/resourcesData';
import {
    ChevronRight, ArrowRight, Search, Filter, Lock, ChevronDown, Clock,
    Sprout, Rocket, Store, PlaneLanding, Globe, Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Lucide icons, not emoji: emoji are announced by screen readers, render
 * differently on every platform, and the previous map carried a bug where the
 * `smbs` icon was the literal string 'green' patched at render time.
 */
const SEGMENT_ICONS: Record<string, LucideIcon> = {
    aspiring: Sprout,
    startups: Rocket,
    smbs: Store,
    global: PlaneLanding,
    global_expansion: Globe,
};

/**
 * Suppressed at the view layer, not in the data file (owned elsewhere).
 * `ambassador-program` reads "How to lead an IFN chapter in your city". IFN
 * has no chapters outside Austin and PRODUCT.md forbids implying otherwise.
 * Remove the entry from `src/data/resourcesData.ts` and this set can go.
 */
const SUPPRESSED_RESOURCE_IDS = new Set(['ambassador-program']);

function visibleResources(list: Resource[] | undefined): Resource[] {
    return (list || []).filter(r => !SUPPRESSED_RESOURCE_IDS.has(r.id));
}

/**
 * This page carries three selection controls: the audience chips, the stage
 * list and the content-type filter trigger. They are one idea in three shapes:
 * `--ink` fill when the thing is chosen, `--paper` over a hairline when it is
 * not.
 *
 * They are not `Button`. `buttonClasses` has no two-state selection variant, and
 * routing them through `ghost` or `outline` would mean overriding every
 * declaration those variants make (the same duplication in a costume). Keeping
 * the shape in one function means the three cannot drift apart, which is the
 * defect this replaces. `cn` is the merge helper `buttonClasses` itself uses.
 *
 * `font-semibold` deliberately lives in each call site's `shape`: the stage
 * buttons carry a normal-weight description underneath their bold title.
 *
 * Rest and hover share `--ink` on the off state, which is deliberate and is not
 * a missing step. These are `aria-pressed` controls: state is carried by that
 * attribute and by the fill swap, which is 17.965 apart on `--paper` and 16.281
 * on `--band`. Hover promotes the hairline from `--rule` to `--edge` instead of
 * inventing a third neutral.
 */
const SELECTION = {
    on: 'bg-ink border-ink text-paper',
    off: 'bg-paper border-rule text-ink hover:border-edge hover:text-ink',
    focus:
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink ' +
        'focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
} as const;

function toggleClasses(isSelected: boolean, shape: string) {
    return cn('border transition-colors', SELECTION.focus, shape, isSelected ? SELECTION.on : SELECTION.off);
}

/**
 * Links that read as links: inside a sentence, or at the end of a card. `--ink`,
 * underlined, never a button. `ButtonLink` cannot express an underlined link in
 * reading flow, and dressing these as buttons would put four competing actions
 * on a page whose real action is choosing a stage.
 */
const TEXT_LINK =
    'font-semibold text-ink underline underline-offset-4 transition-colors hover:text-muted ' +
    'rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function Resources() {
    const { openJoinModal } = useOutletContext<{ openJoinModal?: () => void }>() || {};
    const segments = Object.values(RESOURCES_DATA);
    const [activeSegmentId, setActiveSegmentId] = useState(segments[0].id);
    const [activeStageId, setActiveStageId] = useState(segments[0].stages[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterWrapRef = useRef<HTMLDivElement>(null);
    const filterTriggerRef = useRef<HTMLButtonElement>(null);

    const closeFilter = (returnFocus = false) => {
        setIsFilterOpen(false);
        if (returnFocus) filterTriggerRef.current?.focus();
    };

    // Pointer-outside closes silently; Escape closes and hands focus back to the
    // trigger, because the panel unmounts and would otherwise drop the keyboard
    // user at the top of the document.
    useEffect(() => {
        if (!isFilterOpen) return;

        function handlePointerDown(event: MouseEvent) {
            if (filterWrapRef.current && !filterWrapRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                event.stopPropagation();
                closeFilter(true);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFilterOpen]);

    const activeSegment = RESOURCES_DATA[activeSegmentId];
    const activeStage = activeSegment.stages.find(s => s.id === activeStageId);
    const SegmentIcon = SEGMENT_ICONS[activeSegmentId] ?? Compass;

    const resourceTypes = useMemo(() => {
        const types = new Set<string>();
        Object.values(RESOURCES_DATA).forEach(segment => {
            Object.values(segment.resources).forEach(list => {
                visibleResources(list).forEach(r => types.add(r.tag));
            });
        });
        return Array.from(types).sort();
    }, []);

    const stageResources = useMemo(
        () => visibleResources(activeSegment.resources[activeStageId]),
        [activeSegment, activeStageId],
    );

    const filteredResources = useMemo(() => {
        let rs = stageResources;

        if (activeFilters.length > 0) {
            rs = rs.filter(r => activeFilters.includes(r.tag));
        }

        const query = searchQuery.trim().toLowerCase();
        if (query) {
            rs = rs.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query)
            );
        }

        return rs;
    }, [stageResources, activeFilters, searchQuery]);

    const isFiltered = activeFilters.length > 0 || searchQuery.trim().length > 0;
    const nothingPublishedHere = filteredResources.length > 0 && filteredResources.every(r => !r.link);

    const handleSegmentChange = (id: string) => {
        setActiveSegmentId(id);
        setActiveStageId(RESOURCES_DATA[id].stages[0].id);
        setSearchQuery('');
        setActiveFilters([]);
    };

    const clearAll = () => {
        setSearchQuery('');
        setActiveFilters([]);
    };

    const toggleFilter = (type: string) => {
        setActiveFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <section className="pt-12 pb-24 bg-band" id="resources">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-16">
                    {/* Plain elements, not motion: this block is above the fold at mount,
                        so an entrance buys nothing and would leave the page's only <h1>
                        at opacity 0 on any path where the frame loop does not run. */}
                    <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight leading-[1.15]">
                        A practical <Emphasis>library</Emphasis> for international founders
                    </h1>
                    <p className="text-lg text-muted leading-relaxed">
                        Written for people building a company in a country they did not grow up in:
                        registering the business, opening a United States bank account, understanding
                        visa options, and finding the first customers here. Pick who you are and where
                        you are, and see what the library covers.
                    </p>
                    <p className="mt-6 text-base text-muted leading-relaxed border-t border-rule pt-6">
                        Being honest about where this stands: most of these guides are still being
                        written. We work through them in the order the questions come up at our
                        monthly meetups in Austin, and members receive each one as it is finished.
                    </p>
                </div>

                {/* Audience + search */}
                <div className="flex flex-col gap-8 mb-12">
                    <div
                        role="group"
                        aria-label="Choose who you are"
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {segments.map((segment) => {
                            const Icon = SEGMENT_ICONS[segment.id] ?? Compass;
                            const isActive = activeSegmentId === segment.id;
                            return (
                                <button
                                    key={segment.id}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => handleSegmentChange(segment.id)}
                                    className={toggleClasses(
                                        isActive,
                                        'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-3 font-semibold',
                                    )}
                                >
                                    <Icon size={18} aria-hidden="true" className="shrink-0" />
                                    <span>{segment.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-w-xl mx-auto w-full">
                        <label htmlFor="resource-search" className="sr-only">
                            Search resources for {activeSegment.name}
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                                <Search size={20} aria-hidden="true" />
                            </div>
                            <input
                                id="resource-search"
                                type="search"
                                placeholder={`Search ${activeSegment.name} resources`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-edge bg-paper py-3.5 pl-12 pr-4 text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-hidden focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-paper rounded-3xl border border-rule overflow-hidden">
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                        {/* Stages */}
                        <div className="lg:w-80 shrink-0 bg-band border-b lg:border-b-0 lg:border-r border-rule">
                            <div className="p-8">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
                                    Choose a stage
                                </h2>
                                <div
                                    role="group"
                                    aria-label="Choose a stage"
                                    className="flex flex-wrap lg:flex-col gap-2"
                                >
                                    {activeSegment.stages.map((stage) => {
                                        const isActive = activeStageId === stage.id;
                                        return (
                                            <button
                                                key={stage.id}
                                                type="button"
                                                aria-pressed={isActive}
                                                onClick={() => setActiveStageId(stage.id)}
                                                className={toggleClasses(
                                                    isActive,
                                                    'min-h-11 w-full max-w-full rounded-lg p-4 text-left lg:w-full',
                                                )}
                                            >
                                                <span className="flex items-center justify-between gap-4 font-semibold">
                                                    <span>{stage.name}</span>
                                                    {isActive && (
                                                        <motion.span layoutId="activeStage" className="hidden lg:block text-paper">
                                                            <ChevronRight size={18} aria-hidden="true" />
                                                        </motion.span>
                                                    )}
                                                </span>
                                                <span className={`mt-1 hidden lg:block text-xs leading-relaxed ${isActive ? 'text-paper' : 'text-muted'}`}>
                                                    {stage.description}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 p-8 lg:p-12 flex flex-col">
                            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-rule bg-band px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                                        <SegmentIcon size={14} aria-hidden="true" />
                                        {activeSegment.name}
                                    </p>
                                    <h2 className="text-2xl font-bold text-ink tracking-tight">
                                        {activeStage?.name}
                                    </h2>
                                    {activeStage?.description && (
                                        <p className="mt-2 max-w-md text-muted">{activeStage.description}</p>
                                    )}
                                    <p aria-live="polite" aria-atomic="true" className="mt-3 text-sm font-medium text-muted">
                                        {filteredResources.length === 0
                                            ? 'No resources match your search.'
                                            : `${filteredResources.length} ${filteredResources.length === 1 ? 'resource' : 'resources'} shown${isFiltered ? ' for your search' : ''}.`}
                                    </p>
                                </div>

                                {/* Content-type filter */}
                                <div className="relative shrink-0" ref={filterWrapRef}>
                                    <button
                                        ref={filterTriggerRef}
                                        type="button"
                                        onClick={() => (isFilterOpen ? closeFilter(false) : setIsFilterOpen(true))}
                                        aria-expanded={isFilterOpen}
                                        {...(isFilterOpen ? { 'aria-controls': 'resource-type-filter' } : {})}
                                        className={toggleClasses(
                                            activeFilters.length > 0,
                                            'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
                                        )}
                                    >
                                        <Filter size={16} aria-hidden="true" />
                                        {activeFilters.length === 0
                                            ? 'Filter by type'
                                            : `${activeFilters.length} type${activeFilters.length > 1 ? 's' : ''} selected`}
                                        <ChevronDown
                                            size={16}
                                            aria-hidden="true"
                                            className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                id="resource-type-filter"
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-rule bg-paper shadow-lg"
                                            >
                                                <fieldset className="p-2">
                                                    <legend className="px-2 pt-1 pb-2 text-xs font-bold uppercase tracking-wide text-muted">
                                                        Content type
                                                    </legend>
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {resourceTypes.map(type => {
                                                            const id = `resource-type-${type.toLowerCase()}`;
                                                            return (
                                                                <label
                                                                    key={type}
                                                                    htmlFor={id}
                                                                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-band"
                                                                >
                                                                    <input
                                                                        id={id}
                                                                        type="checkbox"
                                                                        checked={activeFilters.includes(type)}
                                                                        onChange={() => toggleFilter(type)}
                                                                        className="h-4 w-4 shrink-0 accent-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                                                    />
                                                                    <span>{type}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </fieldset>
                                                {activeFilters.length > 0 && (
                                                    <div className="border-t border-rule p-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            fullWidth
                                                            onClick={() => setActiveFilters([])}
                                                            className="focus-visible:ring-ink"
                                                        >
                                                            Clear all types
                                                        </Button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                                            {nothingPublishedHere && (
                                                <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-rule bg-band p-6 md:flex-row md:items-center md:justify-between md:p-8">
                                                    <div className="max-w-xl">
                                                        <h3 className="mb-2 text-lg font-bold text-ink">
                                                            Nothing in this stage is published yet
                                                        </h3>
                                                        <p className="text-muted leading-relaxed">
                                                            These are the guides we are writing, in the order the
                                                            questions come up at the monthly meetups in Austin.
                                                            Members read each one first.{' '}
                                                            <Link to="/membership" className={TEXT_LINK}>
                                                                See what membership includes
                                                            </Link>
                                                            .
                                                        </p>
                                                    </div>
                                                    {openJoinModal && (
                                                        <Button
                                                            variant="primary"
                                                            onClick={openJoinModal}
                                                            className="shrink-0 whitespace-nowrap"
                                                        >
                                                            Join the community
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <ul className="grid gap-6 md:grid-cols-2 list-none p-0 m-0">
                                                {filteredResources.map((resource) => {
                                                    const ResourceIcon = resource.icon;
                                                    const isExternal = Boolean(resource.link && /^https?:/i.test(resource.link));
                                                    return (
                                                        <li
                                                            key={resource.id}
                                                            className="group flex flex-col rounded-2xl border border-rule bg-paper p-6 transition-shadow duration-300 hover:shadow-lg"
                                                        >
                                                            <div className="mb-6 flex items-start justify-between gap-4">
                                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rule bg-band text-ink">
                                                                    <ResourceIcon size={24} aria-hidden="true" />
                                                                </span>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="rounded-full border border-rule bg-band px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                                                                        {resource.tag}
                                                                    </span>
                                                                    {resource.isMembersOnly && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-paper">
                                                                            <Lock size={12} aria-hidden="true" />
                                                                            Members
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <h3 className="mb-2 text-lg font-bold text-ink">
                                                                {resource.title}
                                                            </h3>
                                                            <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                                                                {resource.description}
                                                            </p>

                                                            <div className="border-t border-rule pt-4">
                                                                {resource.link ? (
                                                                    <a
                                                                        href={resource.link}
                                                                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                                        className={cn(TEXT_LINK, 'inline-flex min-h-11 items-center gap-2 px-1')}
                                                                    >
                                                                        {resource.tag === 'Video' ? 'Watch the video' : 'Open the guide'}
                                                                        <ArrowRight size={16} aria-hidden="true" />
                                                                        {isExternal && <span className="sr-only">(opens in a new tab)</span>}
                                                                    </a>
                                                                ) : (
                                                                    <p className="inline-flex items-center gap-2 text-sm font-medium text-muted">
                                                                        <Clock size={16} aria-hidden="true" />
                                                                        {resource.isComingSoon ? 'Being written' : 'Not published yet'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-band text-muted">
                                                <Search size={32} aria-hidden="true" />
                                            </span>
                                            <h3 className="mb-2 text-lg font-bold text-ink">
                                                Nothing here matches yet
                                            </h3>
                                            <p className="mb-2 max-w-md text-muted leading-relaxed">
                                                {searchQuery.trim()
                                                    ? <>Nothing in <span className="font-semibold text-ink">{activeStage?.name}</span> matches &ldquo;{searchQuery.trim()}&rdquo;{activeFilters.length > 0 ? ' with the types you selected' : ''}.</>
                                                    : <>Nothing in <span className="font-semibold text-ink">{activeStage?.name}</span> matches the types you selected.</>}
                                            </p>
                                            <p className="mb-8 max-w-md text-muted leading-relaxed">
                                                Try another stage in the list on the left, or clear what you have
                                                set. If the thing you need is missing, tell us. It helps us decide
                                                what to write next.
                                            </p>
                                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                                <Button variant="outline" onClick={clearAll} disabled={!isFiltered}>
                                                    Clear search and filters
                                                </Button>
                                                {/* Outline plus ghost: two actions of the same
                                                    weight class, only one of which is the
                                                    likelier next step. */}
                                                <ButtonLink to="/contact" variant="ghost" className="gap-2">
                                                    Tell us what you need
                                                    <ArrowRight size={16} aria-hidden="true" />
                                                </ButtonLink>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                                <p>
                                    {stageResources.length} {stageResources.length === 1 ? 'resource' : 'resources'} planned
                                    for {activeStage?.name}.
                                </p>
                                <Link to="/events" className={cn(TEXT_LINK, 'inline-flex min-h-11 items-center gap-2')}>
                                    Bring the question to the next Austin meetup
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
