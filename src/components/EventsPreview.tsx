import { useMemo, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Container } from './Container';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from './EventCard';
import type { Event } from './EventCard';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

const EVENTS_PER_PAGE = 3;

/** The one verified public listing for IFN meetups (see src/data/socialLinks.ts). */

export function EventsPreview() {
    const { events, loading } = useEvents();
    const [requestedPage, setRequestedPage] = useState(0);

    /**
     * Two corrections happen here, both of which were shipping wrong answers:
     *
     * 1. The list was rendered in source order with no date filter, so under a
     *    heading promising the NEXT meetup the section showed meetups that had
     *    already happened. Anything starting before today is dropped and the
     *    rest are sorted soonest-first. The cut is the start of today, not the
     *    current instant, so tonight's meetup does not disappear at 6:31 PM.
     *
     * 2. Every entry in the bundled fallback data carries `registrations: [{}]`
     *    with no platform and no URL. Those produced register buttons that
     *    pointed at nothing. Malformed entries are dropped before the card ever
     *    sees them.
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

    const totalPages = Math.max(1, Math.ceil(upcoming.length / EVENTS_PER_PAGE));
    // Clamped at render rather than reconciled in an effect, so the page index
    // can never point past the end of a shorter list.
    const currentPage = Math.min(requestedPage, totalPages - 1);
    const displayedEvents = upcoming.slice(currentPage * EVENTS_PER_PAGE, (currentPage + 1) * EVENTS_PER_PAGE);
    const isPaginated = !loading && upcoming.length > EVENTS_PER_PAGE;

    return (
        <section className="py-24 bg-paper" id="events">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink mb-4">
                            The next meetup in Austin
                        </h2>
                        <p className="text-lg text-muted leading-relaxed">
                            One meetup a month, in person. Anyone building a company here can come:
                            you do not need to be a member to attend.
                        </p>
                    </div>

                    {isPaginated && (
                        <div role="group" aria-label="Meetup list pages" className="flex items-center gap-3 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestedPage(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <p aria-live="polite" className="text-sm font-medium text-muted whitespace-nowrap">
                                Page {currentPage + 1} of {totalPages}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestedPage(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>

                {loading && (
                    // `motion-status`: this spin reports that a fetch is in flight, so it is
                    // exempt from the global reduced-motion freeze. The label beside it is
                    // visible rather than sr-only, so the message never rests on motion alone.
                    <div
                        role="status"
                        className="w-full min-h-[28rem] flex flex-col items-center justify-center gap-3 bg-band rounded-2xl border border-dashed border-rule"
                    >
                        <Loader2 aria-hidden="true" className="motion-status w-8 h-8 text-muted animate-spin" />
                        <p className="text-muted font-medium">Loading the upcoming meetups.</p>
                    </div>
                )}

                {!loading && upcoming.length === 0 && (
                    <div className="rounded-2xl border border-rule bg-band px-6 py-14 text-center">
                        <p className="text-xl font-bold text-ink">The next date is not on the calendar yet.</p>
                        <p className="mt-3 mx-auto max-w-md text-muted leading-relaxed">
                            IFN meets once a month in Austin. Every date is published on Luma.
                        </p>
                        <ButtonLink href={LUMA_CALENDAR_URL} variant="outline" className="mt-8">
                            Follow IFN on Luma
                        </ButtonLink>
                    </div>
                )}

                {!loading && upcoming.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {displayedEvents.map((event, index) => (
                                <EventCard key={event.id} event={event} index={index} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div role="group" aria-label="Choose a meetup page" className="flex justify-center mb-8">
                                {Array.from({ length: totalPages }).map((_, idx) => {
                                    const isCurrent = currentPage === idx;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setRequestedPage(idx)}
                                            aria-label={`Go to page ${idx + 1} of ${totalPages}`}
                                            aria-current={isCurrent ? 'true' : undefined}
                                            /* The dot is 8px, but the control is 44px. The hit area is
                                               a transparent square around it (WCAG 2.5.5). */
                                            className="group h-11 w-11 flex items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                        >
                                            <span
                                                aria-hidden="true"
                                                /* Width carries the state as well as colour, so the
                                                   current page is not signalled by colour alone. */
                                                className={`block h-2 rounded-full transition-all duration-300 ${isCurrent ? 'w-6 bg-ink' : 'w-2 bg-rule group-hover:bg-edge'
                                                    }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-4 flex flex-col items-center gap-5 text-center">
                    {/* Outline, not the accent fill: the cards above already carry the
                        register actions, and plan section 2 caps a viewport at two
                        accent marks plus the wordmark period. */}
                    <ButtonLink to="/events" variant="outline" size="lg" className="gap-2">
                        See all meetups
                        <ArrowRight size={18} aria-hidden="true" />
                    </ButtonLink>
                    <p className="text-sm text-muted">
                        Registration for every meetup is on{' '}
                        <a
                            href={LUMA_CALENDAR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-4 decoration-rule hover:decoration-ink transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm"
                        >
                            Luma
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        .
                    </p>
                </div>
            </Container>
        </section>
    );
}
