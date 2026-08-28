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
 * THIRD PASS, the gallery and photography round, and it is worth recording what
 * did NOT move as much as what did. All seven sections were re-measured on the
 * rebuilt page. Six came back byte for byte identical to the second pass at all
 * nine widths, INCLUDING FounderStory, whose photograph was repointed at a
 * different source: the replacement is 16:9 at the same placement, so it
 * contributes exactly the same height. GalleryPreview is the one that moved. It
 * lost one rendered line of lead paragraph when the count of evenings came out
 * of its copy, and it is 27px shorter at every width from 340 up. Its five fits
 * are re-declared at its own boundary below; the six constants are untouched
 * because re-declaring an unchanged measurement is how a correct number drifts.
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
 *   GalleryPreview  1035  1045  1072  1160   867   906   994   994   994
 *   ResourcesPrev.  1248  1162  1162  1170  1181  1187  1195  1195  1195
 *   FAQ             2272  1903  1903  1907  1990  1993  1997  1997  1997
 *   FinalCTA        1159   907   908   912   966   973   990   881   883
 *
 * Declared, and the worst residual error inside each band:
 *
 *   FounderStory     94.375 / 90.125 / 83.6875 rem                   0px
 *   EventsPreview    92.0625 / 82.25 / 83.25 rem                    11px
 *   PartnersStrip    69.375 / 59.125 / 60.625 / 61.25 rem           10px
 *   GalleryPreview   five linear fits, see its own note below       26px
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
 * forty it runs 977 to 1428 inside the base band alone. A photographic
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
                entirely. Measured across its four variable bands it runs 977
                to 1428, 873 to 980, 1045 to 1269 and 867 to 994, so a single
                value per band would be out by up to 226px, which is twenty
                times the worst residual anywhere else in this file.

                So each band declares its own least squares fit of the rendered
                height against viewport width, in the same units the browser
                lays out in.

                RE-MEASURED 2026-08-10 in the gallery round, and this is the
                standing obligation catching its own round for the third time.
                `GalleryPreview` lost one rendered line from its lead paragraph
                when the count of evenings came out of it on the founder's
                ruling, so the section is EXACTLY 27px shorter at every width
                from 340 up and all five fits moved. Nothing about the frames
                changed: same count, same 16:9 ratio, same placement, so the
                slopes barely move and the intercepts carry the difference. The
                three frames it selects DID change, but a photograph swapped for
                another at the same ratio contributes no height at all.

                Points, all re-measured on the built page under
                `prefers-reduced-motion: reduce` after every lazy chunk had
                resolved, at forty widths rather than seventeen:

                    320  977   340  983   360 1017   390 1035   400 1052
                    430 1103   450 1136   480 1187   500 1221   520 1255
                    560 1322   600 1362   620 1396   639 1428
                    640  873   660  889   680  906   700  923   720  940
                    750  965   767  980
                    768 1045   800 1072   850 1116   900 1160   960 1213
                   1000 1248  1023 1269
                   1024  867  1060  886  1100  906  1150  931  1200  957
                   1240  976  1279  994
                   1280  994  1366  994  1440  994  1600  994  1920  994

                and the fits, with their worst residual inside the band:

                   base   475.4px + 148.6vw    26px  (the one band that is not
                                                     straight: below 640 the
                                                     header text is still
                                                     reflowing under the frames)
                   sm     332.6px +  84.4vw     1px
                   md     369.1px +  87.9vw     1px
                   lg     356.2px +  50.0vw     2px
                   xl      994px, constant      0px  (the container caps at
                                                     max-w-7xl, so nothing in
                                                     the section grows past 1280)

                `vw` counts the classic scrollbar on the platforms that still
                reserve one, where the container measures client width, so on
                Windows this over-declares by roughly 13px. Over is the safe
                direction: it pulls the page up rather than pushing it down.

                THE BASE BAND'S RESIDUALS ARE SIGNED BOTH WAYS AND THAT IS A
                CHOICE, not an oversight, because the two rules this file states
                disagree there and only there. "Minimise the maximum error across
                the band" and "over is the safe direction" are the same
                instruction wherever the band is straight, and below 640 it is
                not: the header type is still reflowing under the frames, so the
                curve runs under the line at both ends and over it in the middle.
                Verified against the built CSS with a probe element rather than
                inferred, the base residuals are -26.1px at 320, -6.7 at 360,
                +19.9 at 390, +1.6 at 480, -14.5 at 560 and -3.1 at 639, so the
                worst case is 26px in the direction the scrollbar note calls
                unsafe. Minimise-max-error wins here. The never-under
                alternative was computed rather than waved at: the same slope
                with the intercept raised to 31.35rem never declares short, and
                it pays 46px of over-declaration at 480 to buy it, which is
                nearly twice the error it removes. Every other band is straight
                and lands within 2px, so this trade exists in one band only.

                The rem terms are the intercepts divided by 16. Spaces inside
                the arbitrary value are underscores because Tailwind requires
                that, and CSS `calc()` requires the spaces around the operator,
                so both halves of that are load bearing. */}
            <Suspense
                fallback={
                    <SectionPlaceholder className="bg-paper min-h-[calc(29.71rem_+_148.6vw)] sm:min-h-[calc(20.79rem_+_84.4vw)] md:min-h-[calc(23.07rem_+_87.9vw)] lg:min-h-[calc(22.26rem_+_50vw)] xl:min-h-[62.125rem]" />
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
