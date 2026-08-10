import { useMemo } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';
import { useEvents } from '../hooks/useEvents';
import { ExternalActionLink } from './EventCard';
import type { Event, EventRegistration } from './EventCard';
import { describeMoment } from '../lib/eventTime';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/**
 * EVENTS PREVIEW. REDESIGN-PLAN.md section 5, row 5.
 *
 * LAYOUT FAMILY: featured object plus a compact ruled index. It is the only
 * section on the page built as a masthead (one object set at display scale on
 * the full measure, with its supporting facts on a baseline row beneath it)
 * followed by a ruled register of the dates after it. Nothing else on the page
 * sets a single datum at display scale, and nothing else rules a list.
 *
 * THE DATE IS THE SECTION. It is set larger than the section's own headline, on
 * purpose: a founder deciding whether to come needs the date before they need
 * the sentence explaining what the date is. Numerals take Archivo's tabular
 * lining figures (`tabular-nums`, plan section 4.3) so "Aug 27" and "Sep 24"
 * align in the index and the display line does not reflow between renders.
 *
 * THE INDEX IS UPCOMING ONLY, AND THAT IS AN HONESTY CONSTRAINT RATHER THAN A
 * LAYOUT ONE. `src/data/events.json` holds Vol. 03 through Vol. 12, half of
 * which are scheduled rather than past, so a register built from the whole feed
 * would print calendar entries as operating history. Nothing here is framed as
 * a record, a history, or evidence of anything: an index of future dates cannot
 * evidence past recurrence in any case. Recurrence is carried by the copy on
 * this page and by nothing else.
 *
 * THE ACCENT APPEARS EXACTLY ONCE, on the featured date lockup, under the
 * licence in plan section 2: the mark may only sit on a phrase a reader can
 * check against a named artifact, and a date in the events feed is the
 * canonical example. Accent type plus a 3px accent rule. The section's one
 * action is therefore NOT an accent fill (it takes the neutral `secondary`
 * pill), which keeps this viewport at one mark plus the fixed wordmark period,
 * inside the ceiling of two.
 */

/**
 * How many dates the index prints after the featured one.
 *
 * Four, so the section never becomes the long ruled spec table the skill bans
 * (section 4.9). Anything past the fifth upcoming date is reachable through
 * "See all meetups", which is what that link is for. Today's feed holds five
 * upcoming dates, so nothing is currently hidden by this cap.
 */
const INDEX_LIMIT = 4;

/** Reveal easing, shared by every entrance in this file. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** The one verified public listing for IFN meetups (see src/data/socialLinks.ts). */

/**
 * What the action says, and the rule it follows.
 *
 * A link that lands on IFN's whole calendar rather than on this meetup's own
 * page must not be labelled "Register", because that is not what the click
 * does. Every entry in the bundled snapshot arrives with no URL, so the
 * fallback label is the one a reader sees whenever the live API is unavailable.
 */
function registrationAction(registration: EventRegistration | undefined): string {
    if (!registration) return 'Find this meetup on Luma';
    if (registration.platform === 'luma') return 'Register on Luma';
    if (registration.platform === 'meetup') return 'Register on Meetup';
    return 'Register for this meetup';
}

interface IndexRowProps {
    event: Event;
    position: number;
    reduce: boolean;
}

/**
 * One row of the index: a full-width interactive row, radius 0, whose
 * pressability is carried by the hairline and the focus ring rather than by a
 * shape (plan section 4.4's stated boundary for full-width rows).
 *
 * The hairline promotion is drawn on an absolutely positioned span rather than
 * on the row's own `border-top`, so 1px becoming 2px costs no layout shift and
 * the rule is always a full-opacity solid at an integer offset. Plan section
 * 4.2 measured a 1px `--rule` at 75% antialiased coverage at 2.665 light and
 * 2.764 dark, both under the 3:1 floor, so partial coverage is never an option.
 */
function IndexRow({ event, position, reduce }: IndexRowProps) {
    const { shown, inReaderZone, showReaderLine } = describeMoment(event);
    const registration = (event.registrations ?? [])[0];
    const href = registration?.url ?? LUMA_CALENDAR_URL;
    const action = registrationAction(registration);

    return (
        <motion.li
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: Math.min(position, 5) * 0.06, ease: EASE }}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 focus-visible:outline-hidden focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)] md:grid-cols-[10rem_1fr_auto]"
            >
                {/* The rule. 1px --rule (4.063 light, 4.005 dark on --paper)
                    promoting to 2px --edge (4.960 and 4.804) on hover and on
                    keyboard focus, so the affordance is not pointer-only. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-rule transition-all duration-150 group-hover:h-[2px] group-hover:bg-edge group-focus-visible:h-[2px] group-focus-visible:bg-edge"
                />

                <time
                    dateTime={event.start_at}
                    className="text-xl font-semibold tracking-[-0.02em] text-ink tabular-nums md:text-2xl"
                >
                    {shown.month} {shown.day}
                </time>

                <span className="order-3 col-span-2 text-sm text-muted tabular-nums md:order-2 md:col-span-1 md:text-base">
                    {shown.weekday}, {shown.time} {shown.zone}, {shown.year}
                    {showReaderLine && (
                        <span className="block text-muted">
                            In your time zone: {inReaderZone.time} {inReaderZone.zone}, {inReaderZone.date}
                        </span>
                    )}
                </span>

                {/* The row's own accessible name would otherwise be a bare date,
                    and four of them would be four links called nothing in a
                    links list. The new-tab hint is WCAG 3.2.5 and has to sit
                    inside the anchor so it is announced with the link name. */}
                <span className="sr-only">
                    , {event.title}, {action} (opens in a new tab)
                </span>

                <ArrowUpRight
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="order-2 h-5 w-5 self-center text-muted transition-colors duration-150 group-hover:text-ink md:order-3"
                />
            </a>
        </motion.li>
    );
}

export function EventsPreview() {
    const { events, loading, isStale } = useEvents();
    const reduce = useReducedMotion() ?? false;

    /**
     * Two corrections happen here, both of which were shipping wrong answers
     * before the audit that produced them, and both preserved verbatim:
     *
     * 1. The list was rendered in source order with no date filter, so under a
     *    heading promising the NEXT meetup the section showed meetups that had
     *    already happened. Anything starting before today is dropped and the
     *    rest are sorted soonest-first. The cut is the start of today, not the
     *    current instant, so tonight's meetup does not disappear at 6:31 PM.
     *
     * 2. Every entry in the bundled fallback data carries `registrations: [{}]`
     *    with no platform and no URL. Those produced register buttons that
     *    pointed at nothing. Malformed entries are dropped before any row or
     *    action ever sees them, which is why an index row falls back to IFN's
     *    calendar under a label that says so.
     */
    const upcoming = useMemo<Event[]>(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        return events
            .filter(event => new Date(event.start_at).getTime() >= startOfToday.getTime())
            .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
            .map(event => ({
                ...event,
                registrations: (event.registrations ?? []).filter(reg => reg && reg.platform && reg.url),
            }));
    }, [events]);

    const featured = upcoming[0];
    const indexed = upcoming.slice(1, 1 + INDEX_LIMIT);
    const shownCount = featured ? 1 + indexed.length : 0;

    /**
     * What the live region says once the fetch resolves.
     *
     * This replaces the retired dot pager's `aria-live` page counter. The pager
     * announced "Page N of M" on a transition the reader had just caused by
     * clicking; this announces the resolved result of a transition they cannot
     * see, which is the one that actually needs announcing. Same region, same
     * politeness, and it is mounted at all times rather than rendered
     * conditionally (accessibility floor item 5 in plan section 8).
     */
    const status = shownCount === 0
        ? 'The next date is not on the calendar yet.'
        : `Showing the next ${shownCount} meetup${shownCount === 1 ? '' : 's'}.`;

    const featuredMoment = featured ? describeMoment(featured) : null;
    const featuredRegistration = featured ? (featured.registrations ?? [])[0] : undefined;

    return (
        <section className="bg-paper py-24 md:py-32" id="events">
            <Container>
                <div>
                    {/* HEADLINE SCALE. This section used to opt out of the page's
                        type scale with `text-3xl md:text-4xl`, which capped at
                        36px while six sibling sections ran a clamp topping out
                        between 48px and 64px. One page cannot argue that it is
                        one type system and then run two.

                        IT TAKES THE FAMILY'S SMALLEST CAP, `clamp(2rem, 4vw, 3rem)`,
                        which is FAQ's value verbatim rather than a seventh
                        number, and that choice is the whole point: this is the
                        one section on the page whose headline must stay
                        subordinate to another object in its own band. The
                        featured date below runs `clamp(2.75rem, 7vw, 4.5rem)`
                        and the design audit called it the best object on the
                        page, so the headline is sized to yield to it. Resolved
                        against the date at the four measured widths:

                          360px   32.00px headline vs 44.00px date  (date 1.38x)
                          768px   32.00px           vs 53.76px      (date 1.68x)
                          1366px  48.00px           vs 72.00px      (date 1.50x)
                          1920px  48.00px           vs 72.00px      (date 1.50x)

                        The desktop gap narrows from 2.00x to 1.50x and that is
                        stated rather than hidden. The date keeps three further
                        axes of dominance that the headline does not touch: it is
                        `wght 700` against this line's 600, it is `--accent`
                        (7.054 light, 5.517 dark on `--paper`) against `--ink`,
                        and it carries the 3px accent rule. Nothing here is
                        raised above or level with it.

                        MEASURE. The 65ch cap moves off this wrapper and onto the
                        paragraph, so the headline carries its own measure in its
                        own ch, which is what ValueProps and PartnersStrip already
                        do. 26ch is ValueProps' value. Line counts were computed
                        from the real glyph advances in
                        `public/fonts/archivo-variable-latin.woff2` at `wght 600`
                        with the -0.025em tracking included: the string sets at
                        539.3px on one line at 48px against a 717.6px measure, so
                        it is one line at 768px and above and two at 360px ("The
                        next meetup in" / "Austin"), which is what it already did.
                        The cap is inert at all four widths and is kept for the
                        case the arithmetic does not model: `font-display: swap`
                        paints a fallback face first, and 717.6px of measure
                        absorbs a wider fallback where the old 595.9px sat much
                        closer to the line. That is a layout-shift argument, not
                        a wrapping one. */}
                    <h2 className="max-w-[26ch] text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink">
                        The next meetup in Austin
                    </h2>
                    <p className="mt-5 max-w-[65ch] text-lg leading-relaxed text-muted">
                        One meetup a month, in person. Open to anyone building a company here, and
                        to the investors, attorneys and operators who work with founders crossing
                        borders. You do not need to be a member to attend.
                    </p>
                </div>

                {/* PERMANENTLY MOUNTED LIVE REGION. Never conditionally
                    rendered: a `role="status"` that mounts at the moment its
                    message appears is frequently missed by assistive tech,
                    which is why the floor item names the mounting rather than
                    the announcement. While the fetch is in flight it holds the
                    visible loading label; afterwards it holds the resolved
                    count, or the empty sentence when there is nothing to show. */}
                {/* No class list on the region itself: when it holds only the
                    sr-only summary it is a zero-height block and contributes no
                    spacing. `display: contents` would have been tidier and is
                    deliberately avoided, because it has a history of dropping
                    the element out of the accessibility tree, which is the one
                    thing this region cannot afford. */}
                <div role="status">
                    {loading ? (
                        // `motion-status`: this spin reports that a fetch is in
                        // flight, so it is exempt from the global reduced-motion
                        // freeze in index.css. The label beside it is visible
                        // rather than sr-only, so the message never rests on
                        // motion alone.
                        <p className="mt-12 flex items-center gap-3 text-muted">
                            <Loader2 aria-hidden="true" strokeWidth={1.5} className="motion-status h-5 w-5 animate-spin" />
                            Loading the upcoming meetups.
                        </p>
                    ) : (
                        <span className="sr-only">{status}</span>
                    )}
                </div>

                {loading && (
                    /* Skeleton in the final shape: one masthead block, then
                       four ruled rows. Bars are `--band` on `--paper` (1.103
                       light, 1.101 dark), which is deliberately faint because
                       the whole block is `aria-hidden` and the live region
                       above carries the message. */
                    <div aria-hidden="true" className="mt-12">
                        <div className="border-t border-rule pt-8">
                            <div className="h-16 w-64 max-w-full bg-band md:h-20 md:w-80" />
                            <div className="mt-3 h-[3px] w-64 max-w-full bg-band md:w-80" />
                            <div className="mt-6 h-5 w-52 max-w-full bg-band" />
                            <div className="mt-10 h-11 w-56 max-w-full bg-band" />
                        </div>
                        <div className="mt-16">
                            {Array.from({ length: INDEX_LIMIT }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between border-t border-rule py-5">
                                    <div className="h-6 w-28 bg-band" />
                                    <div className="h-4 w-40 bg-band" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !featured && (
                    /* EMPTY STATE. Full measure, its own composition, no plate:
                       nothing has gone wrong, so it is set as prose rather than
                       as an error surface. */
                    <div className="mt-12 max-w-[65ch] border-t border-rule pt-10">
                        <p className="text-2xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-3xl">
                            The next date is not on the calendar yet.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            IFN meets once a month in Austin. Every date is published on Luma.
                        </p>
                        <ButtonLink href={LUMA_CALENDAR_URL} variant="outline" className="mt-8">
                            Follow IFN on Luma
                        </ButtonLink>
                    </div>
                )}

                {!loading && featured && featuredMoment && (
                    <>
                        {/* THE FEATURED OBJECT. Transform and opacity only, once,
                            on view: it reveals the section's primary object in
                            reading order. */}
                        <motion.article
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.6, ease: EASE }}
                            className="mt-12 border-t border-rule pt-8 md:mt-16 md:pt-10"
                        >
                            <div className="w-fit max-w-full">
                                <div className="flex flex-wrap items-end gap-x-4">
                                    <time
                                        dateTime={featured.start_at}
                                        className="text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.025em] text-accent tabular-nums"
                                    >
                                        {featuredMoment.shown.month} {featuredMoment.shown.day}
                                        <span className="ml-3 text-[0.45em] font-semibold text-muted">
                                            {featuredMoment.shown.year}
                                        </span>
                                    </time>
                                    {/* The sign's own device: a date, and an arrow
                                        pointing off it. Decorative, so hidden. */}
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        strokeWidth={1.5}
                                        className="mb-2 h-8 w-8 shrink-0 text-accent md:h-10 md:w-10"
                                    />
                                </div>

                                {/* THE MARK. Plan section 6, behaviour 2: it draws
                                    from the left on view, because the page's one
                                    colour marks what a reader can check and this
                                    date is checkable against the feed below and
                                    against Luma. Reduced motion renders it drawn. */}
                                <motion.span
                                    aria-hidden="true"
                                    initial={reduce ? false : { scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.26, ease: EASE }}
                                    style={{ transformOrigin: 'left' }}
                                    className="mt-3 block h-[3px] w-full bg-accent"
                                />
                            </div>

                            <p className="mt-6 text-xl font-medium text-ink tabular-nums md:text-2xl">
                                {featuredMoment.shown.weekday}, {featuredMoment.shown.time} {featuredMoment.shown.zone}
                            </p>
                            {featuredMoment.showReaderLine ? (
                                <p className="mt-1 text-base text-muted tabular-nums">
                                    In your time zone: {featuredMoment.inReaderZone.time}{' '}
                                    {featuredMoment.inReaderZone.zone}, {featuredMoment.inReaderZone.date}
                                </p>
                            ) : featuredMoment.eventZone === null ? (
                                <p className="mt-1 text-base text-muted">Shown in your time zone.</p>
                            ) : null}

                            {/* The baseline row: what it is called, where it is,
                                and the one action. Single column under 768px,
                                in that order. */}
                            <div className="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                                <h3 className="text-base font-semibold text-ink">{featured.title}</h3>
                                {featured.location_name && (
                                    <p className="text-base text-muted">{featured.location_name}</p>
                                )}
                                <div className="md:justify-self-end">
                                    {/* Neutral pill, never the accent fill: the
                                        accent is spent on the date above, and
                                        plan section 2 caps a viewport at two
                                        marks plus the wordmark period. */}
                                    <ExternalActionLink
                                        href={featuredRegistration?.url ?? LUMA_CALENDAR_URL}
                                        variant="solid"
                                        label={registrationAction(featuredRegistration)}
                                        context={featured.title}
                                    />
                                </div>
                            </div>
                        </motion.article>

                        {indexed.length > 0 && (
                            <div className="mt-16 md:mt-20">
                                <h3 className="text-base font-semibold text-ink">Also on the calendar</h3>
                                <ul className="mt-4">
                                    {indexed.map((event, i) => (
                                        <IndexRow key={event.id} event={event} position={i} reduce={reduce} />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* STALENESS, SAID OUT LOUD. `useEvents` answers with the
                    bundled snapshot whenever `/api/events` cannot be reached,
                    and this section now sets one of those dates at display
                    scale under an accent mark that claims a reader can check
                    it. A date that may be behind has to say so, or the mark is
                    pointing at something the page cannot stand behind. The
                    /events page carries the same sentence for the same reason.
                    The link is underlined because every inline link on this
                    page is: accent and ink measure 2.547 against each other in
                    light mode, so colour may never identify a link here. */}
                {!loading && isStale && (
                    <p className="mt-10 max-w-[65ch] text-sm text-muted">
                        These dates come from our saved copy of the calendar, so they may be behind.{' '}
                        <a
                            href={LUMA_CALENDAR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-hidden focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]"
                        >
                            Luma has the current dates
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        .
                    </p>
                )}

                {/* ONE ACTION, and the gallery link that stood beside it is
                    DELETED as of 2026-08-10 rather than kept.

                    That link existed because this section was the only place a
                    home page reader could reach `/gallery` from, and the
                    comment that stood here argued at length that a tenth home
                    section was not worth its cost. A design pre-flight then
                    measured the built page and found the middle third still
                    flat over 5,649px, which is the failure the photography
                    round existed to fix, so the section was built after all and
                    sits two sections below this one. `GalleryPreview.tsx`
                    carries the whole argument, including the part where the
                    cost this comment named was real and was paid on purpose.

                    With that section on the page, a second link to the same
                    route four thousand pixels above it is redundancy rather
                    than emphasis, and it would put three links to `/gallery` on
                    one document counting the footer. This section is the
                    meetups. The action it keeps is its own. */}
                <div className="mt-12">
                    <ButtonLink to="/events" variant="outline" size="lg">
                        See all meetups
                    </ButtonLink>
                </div>
            </Container>
        </section>
    );
}
