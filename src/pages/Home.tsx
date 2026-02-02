import { Suspense, lazy } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ValueProps } from '../components/ValueProps';
import { HowItWorks } from '../components/HowItWorks';

const FounderStory = lazy(() => import('../components/FounderStory').then(module => ({ default: module.FounderStory })));
const EventsPreview = lazy(() => import('../components/EventsPreview').then(module => ({ default: module.EventsPreview })));
const Resources = lazy(() => import('../components/Resources').then(module => ({ default: module.Resources })));
const FAQ = lazy(() => import('../components/FAQ').then(module => ({ default: module.FAQ })));
const FinalCTA = lazy(() => import('../components/FinalCTA').then(module => ({ default: module.FinalCTA })));

export function Home() {
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    return (
        <main>
            <Hero onJoinClick={openJoinModal} />
            <ValueProps />
            <HowItWorks />

            <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
                <FounderStory />
                <EventsPreview />
                <Resources />
                <FAQ />
                <FinalCTA onJoinClick={openJoinModal} />
            </Suspense>
        </main>
    );
}
