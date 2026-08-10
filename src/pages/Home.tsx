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
 * last. The placeholder carries the section's own ground token and its real
 * height, so the page keeps its banding before hydration and nothing below it
 * moves when the chunk lands. It is inert scaffolding, so it is hidden from
 * assistive technology rather than announced as "loading".
 *
 * HOW THE HEIGHTS BELOW WERE SET. Every number is a rendered measurement, not
 * an estimate: the built page was served and each `main > section` read for
 * `getBoundingClientRect().height` at five viewports, under
 * `prefers-reduced-motion: reduce` so nothing was mid-transition. A fallback
 * that is too short pushes the page DOWN when the chunk lands and one that is
 * too tall pulls it UP, so each value is rounded to the measurement rather than
 * padded for safety, and the breakpoint ladder exists because a single value
 * cannot be right at both 390px and 1920px.
 *
 *                    390    768    1024   1366   1920      declared
 *   FounderStory     1234   1066    798    798    798      77 / 66.5 / 50 rem
 *   EventsPreview    1380   1302   1295   1292   1292      86.25 / 81 rem
 *   PartnersStrip    1028    912    934    952    952      64.25 / 57 / 59 rem
 *   ResourcesPreview 1258   1206   1206   1206   1206      78.75 / 75.5 rem
 *   FAQ              2199   1856   1913   1920   1920      137.5 / 116 / 120 rem
 *   FinalCTA         1205   1024    990    904   1080      max(100dvh, 75.5 / 62 / 56.5 rem)
 *
 * Worst residual error is 10px (PartnersStrip at 1024). FinalCTA is the one
 * section whose own height is `min-h-[100dvh]`, so its fallback has to be the
 * same `max()` of viewport and content or it can never converge: at 1366x768
 * the content wins at 904px, at 1920x1080 the viewport wins at 1080px.
 *
 * `rem` rather than `px` throughout, so a reader who has raised their browser's
 * base font size gets a fallback that grows with the content it is standing in
 * for. Re-measure these when a section's composition changes.
 */
function SectionPlaceholder({ className }: { className: string }) {
    return <div aria-hidden="true" className={className} />;
}

export function Home() {
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    // Section order is frozen by REDESIGN-PLAN section 5 and by the home-page
    // spec: Hero, ValueProps (#mentorship), HowItWorks, FounderStory,
    // EventsPreview (#events), PartnersStrip (#partners), ResourcesPreview
    // (#resources), FAQ (#faq), FinalCTA. Nine sections, nine layout families.
    //
    // No <main> here. App.tsx already provides the single main landmark.
    return (
        <>
            <Hero onJoinClick={openJoinModal} />
            <ValueProps />
            <HowItWorks onJoinClick={openJoinModal} />

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-paper min-h-[77rem] md:min-h-[66.5rem] lg:min-h-[50rem]" />
                }
            >
                <FounderStory />
            </Suspense>

            <Suspense
                fallback={<SectionPlaceholder className="bg-paper min-h-[86.25rem] md:min-h-[81rem]" />}
            >
                <EventsPreview />
            </Suspense>

            {/* Directly after the meetups, because that is where a visitor asks
                "is this real?", and the venue and the speed-networking format
                are the two partners that make the meetup they just read about
                happen. It also puts a --band ground between EventsPreview and
                ResourcesPreview, which are both --paper and would otherwise run
                together as one undifferentiated field. */}
            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-band min-h-[64.25rem] md:min-h-[57rem] lg:min-h-[59rem]" />
                }
            >
                <PartnersStrip />
            </Suspense>

            <Suspense
                fallback={<SectionPlaceholder className="bg-paper min-h-[78.75rem] md:min-h-[75.5rem]" />}
            >
                <ResourcesPreview />
            </Suspense>

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-band min-h-[137.5rem] md:min-h-[116rem] lg:min-h-[120rem]" />
                }
            >
                <FAQ />
            </Suspense>

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-accent-plate min-h-[max(100dvh,75.5rem)] md:min-h-[max(100dvh,62rem)] xl:min-h-[max(100dvh,56.5rem)]" />
                }
            >
                <FinalCTA onJoinClick={openJoinModal} />
            </Suspense>
        </>
    );
}
