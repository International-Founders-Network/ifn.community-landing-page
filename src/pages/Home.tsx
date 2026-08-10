import { Suspense, lazy } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ValueProps } from '../components/ValueProps';
import { HowItWorks } from '../components/HowItWorks';

const FounderStory = lazy(() => import('../components/FounderStory').then(module => ({ default: module.FounderStory })));
const EventsPreview = lazy(() => import('../components/EventsPreview').then(module => ({ default: module.EventsPreview })));
const PartnersStrip = lazy(() => import('../components/PartnersStrip').then(module => ({ default: module.PartnersStrip })));
const GalleryPreview = lazy(() => import('../components/GalleryPreview').then(module => ({ default: module.GalleryPreview })));
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
 * `getBoundingClientRect().height`, under `prefers-reduced-motion: reduce` so
 * nothing was mid-transition, after scrolling the whole page so every lazy
 * chunk had resolved (measuring before they land measures these placeholders
 * back). A fallback that is too short pushes the page DOWN when the chunk lands
 * and one that is too tall pulls it UP, so each value is rounded to the
 * measurement rather than padded for safety, and the breakpoint ladder exists
 * because a single value cannot be right at both 390px and 1920px.
 *
 * RE-MEASURED 2026-08-10 (all six), and AGAIN LATER THE SAME DAY when the
 * gallery round added a seventh section and moved two of the six. Both passes
 * are recorded because the second one is the standing obligation working: any
 * change to a lazy section's composition re-opens this, and two changes in one
 * round each moved a section that the round was not primarily editing.
 *
 * First pass: FounderStory gained a photograph, EventsPreview gained a gallery
 * link and moved its headline onto the page's `clamp()` scale, ResourcesPreview
 * moved onto that same scale, and FAQ, FinalCTA and PartnersStrip all changed
 * copy length in the partner footprint sweep. The previous declarations were out
 * by as much as 378px.
 *
 * Second pass, and the two that moved are the point: FounderStory's photograph
 * WIDENED from 576 to 904 CSS px, which added 185px to it at `lg` and above and
 * made the fresh 72.125rem declaration wrong by that much within hours of being
 * measured. EventsPreview LOST its gallery link to the new section, taking 60px
 * off its `base` band. Neither was the edit anyone was thinking about.
 *
 * NINE WIDTHS, not five. The extra four (800, 900, 1100, 1279) exist because
 * these sections set their headlines with `clamp()`, so height varies
 * CONTINUOUSLY across a breakpoint band rather than stepping at its edge.
 * Sampling only the band edges hides the worst error in the middle of the band.
 * Each declared value is chosen to minimise the maximum error across its own
 * band, not copied off the band's first sample.
 *
 *                    390   768   800   900  1024  1100  1279  1366  1920
 *   FounderStory    1510  1442  1442  1442  1339  1339  1339  1339  1339
 *   EventsPreview   1473  1327  1306  1316  1330  1333  1333  1333  1333
 *   PartnersStrip   1110   939   942   951   961   968   980   980   980
 *   GalleryPreview  1062  1072  1099  1187   894   933  1021  1022  1022
 *   ResourcesPrev.  1248  1162  1162  1170  1181  1187  1195  1195  1195
 *   FAQ             2272  1903  1903  1907  1990  1993  1997  1997  1997
 *   FinalCTA        1159   907   908   912   966   973   990   881   883
 *
 * Declared, and the worst residual error inside each band:
 *
 *   FounderStory     94.375 / 90.125 / 83.6875 rem                   0px
 *   EventsPreview    92.0625 / 82.25 / 83.25 rem                    11px
 *   PartnersStrip    69.375 / 59.125 / 60.625 / 61.25 rem           10px
 *   GalleryPreview   five linear fits, see its own note below       25px
 *   ResourcesPrev.   78 / 72.875 / 74.25 rem                         7px
 *   FAQ              142 / 119.0625 / 124.6875 rem                    5px
 *   FinalCTA    max(100dvh, 72.4375 / 57 / 61.125 / 55.125 rem)      12px
 *
 * PartnersStrip and FinalCTA carry an `xl:` stop that they did not before, and
 * it is not decoration: both change by more than 10px between 1279 and 1280, so
 * a single `lg:` value covering 1024 upward cannot be within tolerance at both
 * ends. FinalCTA's own 12px is inside the 1024 to 1279 band, where its content
 * runs 966 to 990; that band is genuinely 24px wide and no single value can do
 * better than half of it.
 *
 * The nine widths above are ALSO the reason GalleryPreview does not get a
 * constant: sampled at nine widths it looks like the others, but sampled at
 * seventeen it runs 1004 to 1455 inside the base band alone. A photographic
 * section is a different shape of problem and it gets a different shape of
 * fallback. Its own note sits with its `Suspense` boundary below.
 *
 * FinalCTA is also the one section whose own height is `min-h-[100dvh]`, so its
 * fallback has to be the same `max()` of viewport and content or it can never
 * converge. The rem figures above are its CONTENT heights, measured at a 500px
 * viewport so the `dvh` term could never be the one winning; at 1920x1080 the
 * viewport wins at 1080px and at 1366x768 the content wins at 881px.
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
    // EventsPreview (#events), PartnersStrip (#partners), GalleryPreview,
    // ResourcesPreview (#resources), FAQ (#faq), FinalCTA. TEN sections, ten
    // layout families as of 2026-08-10.
    //
    // The order of the nine that were already here is unchanged and every
    // anchor id is where it was. GalleryPreview was INSERTED between
    // PartnersStrip and ResourcesPreview and carries no anchor id of its own,
    // so nothing that anything else can link to has moved.
    //
    // No <main> here. App.tsx already provides the single main landmark.
    return (
        <>
            <Hero onJoinClick={openJoinModal} />
            <ValueProps />
            <HowItWorks onJoinClick={openJoinModal} />

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-paper min-h-[94.375rem] md:min-h-[90.125rem] lg:min-h-[83.6875rem]" />
                }
            >
                <FounderStory />
            </Suspense>

            <Suspense
                fallback={<SectionPlaceholder className="bg-paper min-h-[92.0625rem] md:min-h-[82.25rem] lg:min-h-[83.25rem]" />}
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
                    <SectionPlaceholder className="bg-band min-h-[69.375rem] md:min-h-[59.125rem] lg:min-h-[60.625rem] xl:min-h-[61.25rem]" />
                }
            >
                <PartnersStrip />
            </Suspense>

            {/* THE TENTH SECTION, added 2026-08-10, and it is inserted rather
                than substituted: nothing above or below it moves, and it
                carries no anchor id, so no route, slug, anchor or nav label
                changes. The reason it is HERE and not anywhere else is measured
                arithmetic against the flat middle third, and it is written out
                in the component's own header rather than restated here.

                THE ONLY FALLBACK ON THIS PAGE THAT IS NOT A CONSTANT, and the
                reason is a property of the section rather than a preference.
                The other six are made of type, which REFLOWS: their height
                barely moves inside a breakpoint band, so a constant per band
                lands within 12px. This one is made of 16:9 photographs, whose
                height is width times 0.5625, so its height is close to LINEAR
                IN VIEWPORT WIDTH and a constant is the wrong shape of fallback
                entirely. Measured across its four variable bands it runs 1004
                to 1455, 900 to 1007, 1070 to 1296 and 894 to 1021, so a single
                value per band would be out by up to 225px, which is twenty
                times the worst residual anywhere else in this file.

                So each band declares its own least squares fit of the rendered
                height against viewport width, in the same units the browser
                lays out in. Points, all measured on the built page under
                `prefers-reduced-motion: reduce` after every lazy chunk had
                resolved:

                    320 1004   360 1044   430 1130   480 1187   560 1322   639 1455
                    700  950   767 1007
                    850 1143   960 1240  1023 1296
                   1100  933  1200  984  1279 1021
                   1400 1022  1600 1022  1920 1022

                and the fits, with their worst residual inside the band:

                   base   532.6px + 141.5vw    25px  (the one band that is not
                                                     straight: below 640 the
                                                     header text is still
                                                     reflowing under the frames)
                   sm     354.5px +  85.1vw     1px
                   md     391.3px +  88.4vw     2px
                   lg     392.2px +  49.2vw     2px
                   xl     1022px, constant      0px  (the container caps at
                                                     max-w-7xl, so nothing in
                                                     the section grows past 1280)

                `vw` counts the classic scrollbar on the platforms that still
                reserve one, where the container measures client width, so on
                Windows this over-declares by roughly 13px. Over is the safe
                direction: it pulls the page up rather than pushing it down.

                The rem terms are the intercepts divided by 16. Spaces inside
                the arbitrary value are underscores because Tailwind requires
                that, and CSS `calc()` requires the spaces around the operator,
                so both halves of that are load bearing. */}
            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-paper min-h-[calc(33.29rem_+_141.5vw)] sm:min-h-[calc(22.16rem_+_85.1vw)] md:min-h-[calc(24.46rem_+_88.4vw)] lg:min-h-[calc(24.51rem_+_49.2vw)] xl:min-h-[63.875rem]" />
                }
            >
                <GalleryPreview />
            </Suspense>

            <Suspense
                fallback={<SectionPlaceholder className="bg-paper min-h-[78rem] md:min-h-[72.875rem] lg:min-h-[74.25rem]" />}
            >
                <ResourcesPreview />
            </Suspense>

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-band min-h-[142rem] md:min-h-[119.0625rem] lg:min-h-[124.6875rem]" />
                }
            >
                <FAQ />
            </Suspense>

            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-accent-plate min-h-[max(100dvh,72.4375rem)] md:min-h-[max(100dvh,57rem)] lg:min-h-[max(100dvh,61.125rem)] xl:min-h-[max(100dvh,55.125rem)]" />
                }
            >
                <FinalCTA onJoinClick={openJoinModal} />
            </Suspense>
        </>
    );
}
