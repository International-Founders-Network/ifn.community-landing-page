import { Suspense, lazy } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ValueProps } from '../components/ValueProps';
import { HowItWorks } from '../components/HowItWorks';

const FounderStory = lazy(() => import('../components/FounderStory').then(module => ({ default: module.FounderStory })));
const EventsPreview = lazy(() => import('../components/EventsPreview').then(module => ({ default: module.EventsPreview })));
const PartnersStrip = lazy(() => import('../components/PartnersStrip').then(module => ({ default: module.PartnersStrip })));
const ResourcesPreview = lazy(() => import('../components/ResourcesPreview').then(module => ({ default: module.ResourcesPreview })));
const FAQ = lazy(() => import('../components/FAQ').then(module => ({ default: module.FAQ })));
const FinalCTA = lazy(() => import('../components/FinalCTA').then(module => ({ default: module.FinalCTA })));

/**
 * Placeholder for a lazy section that has not arrived yet.
 *
 * Each below-fold section gets its OWN Suspense boundary. Sharing one boundary
 * meant the whole lower half of the page waited on whichever chunk resolved
 * last. The placeholder carries the section's own background tone and roughly
 * its real height, so the page keeps its banding and nothing below it jumps
 * when the chunk lands. It is inert scaffolding, so it is hidden from assistive
 * technology rather than announced as "loading".
 */
function SectionPlaceholder({ className }: { className: string }) {
    return <div aria-hidden="true" className={className} />;
}

export function Home() {
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    // No <main> here. App.tsx already provides the single main landmark.
    return (
        <>
            <Hero onJoinClick={openJoinModal} />
            <ValueProps />
            <HowItWorks onJoinClick={openJoinModal} />

            <Suspense fallback={<SectionPlaceholder className="bg-band min-h-[36rem]" />}>
                <FounderStory />
            </Suspense>

            <Suspense fallback={<SectionPlaceholder className="bg-paper min-h-[52rem]" />}>
                <EventsPreview />
            </Suspense>

            {/* Directly after the meetups, because that is where a visitor asks
                "is this real?", and the venue and the speed-networking format
                are the two partners that make the meetup they just read about
                happen. Harbor Mist here also restores the Paper / Harbor Mist
                alternation, which EventsPreview and ResourcesPreview had broken
                by sitting on white back to back. */}
            <Suspense fallback={<SectionPlaceholder className="bg-band min-h-[44rem]" />}>
                <PartnersStrip />
            </Suspense>

            <Suspense fallback={<SectionPlaceholder className="bg-paper min-h-[56rem]" />}>
                <ResourcesPreview />
            </Suspense>

            <Suspense fallback={<SectionPlaceholder className="bg-band min-h-[40rem]" />}>
                <FAQ />
            </Suspense>

            <Suspense fallback={<SectionPlaceholder className="bg-band min-h-[30rem]" />}>
                <FinalCTA onJoinClick={openJoinModal} />
            </Suspense>
        </>
    );
}
