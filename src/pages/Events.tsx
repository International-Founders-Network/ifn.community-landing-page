import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Check, Info } from 'lucide-react';
import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';
import { useEvents } from '../hooks/useEvents';
import { EventCard, ExternalActionLink, type Event } from '../components/EventCard';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

type WhenFilter = 'upcoming' | 'this-month' | 'past';
type PlaceFilter = 'all' | 'austin' | 'elsewhere';

const WHEN_FILTERS: { id: WhenFilter; label: string; heading: string }[] = [
    { id: 'upcoming', label: 'Upcoming', heading: 'Upcoming meetups' },
    { id: 'this-month', label: 'This month', heading: 'This month' },
    { id: 'past', label: 'Past', heading: 'Past meetups' },
];

const PLACE_FILTERS: { id: PlaceFilter; label: string }[] = [
    { id: 'all', label: 'All places' },
    { id: 'austin', label: 'Austin' },
];

/**
 * Three buckets, not two. The old test was `!location_name.includes('austin')`, so an
 * event with no location at all was silently filed as "global". An event we cannot
 * place is not the same as an event somewhere else.
 */
function placeOf(event: Event): 'austin' | 'elsewhere' | 'unknown' {
    const place = event.location_name?.trim().toLowerCase();
    if (!place) return 'unknown';
    return /austin|texas|\btx\b/.test(place) ? 'austin' : 'elsewhere';
}

function matchesPlace(event: Event, filter: PlaceFilter): boolean {
    if (filter === 'all') return true;
    // An unplaceable event answers only to "All places"; it is never claimed for either side.
    return placeOf(event) === filter;
}

function matchesWhen(event: Event, filter: WhenFilter, now: Date): boolean {
    const start = new Date(event.start_at);
    if (filter === 'upcoming') return start.getTime() >= now.getTime();
    if (filter === 'past') return start.getTime() < now.getTime();
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
}

interface FilterChipProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

function FilterChip({ active, label, onClick }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${active ? 'bg-ink text-paper' : 'text-muted hover:text-ink hover:bg-band'
                }`}
        >
            {/* A tick as well as the fill: selection must not rest on colour alone. */}
            {active && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
            {label}
        </button>
    );
}

export function Events() {
    const { events: allEvents, loading, isStale } = useEvents();
    const [when, setWhen] = React.useState<WhenFilter>('upcoming');
    const [place, setPlace] = React.useState<PlaceFilter>('all');

    // Fixed at mount so a re-render cannot move an event between "upcoming" and "past"
    // halfway through a session.
    const now = React.useMemo(() => new Date(), []);

    const visibleEvents = React.useMemo(() => {
        const matched = allEvents.filter((event) => matchesPlace(event, place) && matchesWhen(event, when, now));
        // Upcoming reads soonest-first; history reads most-recent-first.
        return matched.sort((a, b) => {
            const diff = new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
            return when === 'past' ? -diff : diff;
        });
    }, [allEvents, place, when, now]);

    const heading = WHEN_FILTERS.find((option) => option.id === when)?.heading ?? 'Meetups';
    const count = visibleEvents.length;
    const summary = loading
        ? 'Loading the calendar.'
        : `${count} ${count === 1 ? 'meetup' : 'meetups'} match these filters.`;

    return (
        <div className="pt-24 pb-20">
            <section className="bg-band py-20 mb-16">
                <Container>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-2xl">
                            <div className="bg-ink/10 text-ink px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 mb-6">
                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                One meetup a month, in person
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
                                Free monthly meetups in <Emphasis>Austin</Emphasis>
                            </h1>
                            <p className="text-xl text-muted leading-relaxed">
                                International and immigrant founders. Structured one-to-ones. Station Austin.
                                Dates live on Luma — that calendar is the source of truth. Free. No membership
                                required to walk in.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div
                                role="group"
                                aria-label="Filter meetups by date"
                                className="bg-paper p-1.5 rounded-2xl border border-rule flex gap-1"
                            >
                                {WHEN_FILTERS.map((option) => (
                                    <FilterChip
                                        key={option.id}
                                        label={option.label}
                                        active={when === option.id}
                                        onClick={() => setWhen(option.id)}
                                    />
                                ))}
                            </div>

                            <div
                                role="group"
                                aria-label="Filter meetups by place"
                                className="bg-paper p-1.5 rounded-2xl border border-rule flex gap-1"
                            >
                                {PLACE_FILTERS.map((option) => (
                                    <FilterChip
                                        key={option.id}
                                        label={option.label}
                                        active={place === option.id}
                                        onClick={() => setPlace(option.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                {isStale && !loading && (
                    <div
                        role="status"
                        className="mb-10 flex items-start gap-3 rounded-xl border border-rule bg-band p-4 text-sm text-ink"
                    >
                        <Info className="w-5 h-5 shrink-0 text-muted" aria-hidden="true" />
                        <p>
                            Synced from Luma — that calendar is the source of truth.{' '}
                            <a
                                href={LUMA_CALENDAR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-ink underline underline-offset-2 rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                            >
                                Open Luma
                                <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                            .
                        </p>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-ink">{heading}</h2>
                    {/* Present on every render so the count is announced when a filter changes. */}
                    <p aria-live="polite" className="text-muted mt-1">
                        {summary}
                    </p>
                </div>

                {loading ? (
                    // `motion-status`: this spin is information, not decoration, so it keeps
                    // running under prefers-reduced-motion. The visible line below carries the
                    // same message, so nothing depends on the movement alone. The count
                    // paragraph above is the aria-live announcement, so this block stays silent
                    // for screen readers rather than saying it twice.
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="motion-status w-12 h-12 text-ink animate-spin" aria-hidden="true" />
                        <p className="text-muted font-medium">Loading the calendar.</p>
                    </div>
                ) : count > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleEvents.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 px-6 text-center bg-band rounded-2xl border border-dashed border-rule">
                        <Calendar className="w-12 h-12 text-muted mx-auto mb-4" aria-hidden="true" />
                        <p className="text-ink text-lg font-semibold mb-2">Nothing here yet</p>
                        <p className="text-muted mb-8 max-w-md mx-auto">
                            {place === 'elsewhere'
                                ? 'Every IFN meetup so far has been in Austin, Texas. That is the whole record, and we would rather show it than pad it.'
                                : when === 'past'
                                    ? 'Our earlier meetups are not listed here. Luma keeps the full record.'
                                    : 'The next date is not published yet. New meetups appear on Luma first.'}
                        </p>
                        <div className="flex justify-center">
                            <ExternalActionLink
                                href={LUMA_CALENDAR_URL}
                                variant="outline"
                                label="See the IFN calendar on Luma"
                            />
                        </div>
                    </div>
                )}

                {!loading && (
                    <section className="mt-24 bg-band rounded-3xl px-6 py-16 sm:px-12 text-center text-ink relative overflow-hidden">
                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-4">Want a reminder?</h2>
                            <p className="text-muted max-w-xl mx-auto mb-8 text-lg">
                                RSVP on Luma — you&apos;ll get their event emails. Or email{' '}
                                <a
                                    href="mailto:hello@ifn.community"
                                    className="font-semibold text-ink underline underline-offset-2"
                                >
                                    hello@ifn.community
                                </a>
                                .
                            </p>
                            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <ExternalActionLink
                                    href={LUMA_CALENDAR_URL}
                                    variant="solid"
                                    label="Register on Luma"
                                />
                                <Link
                                    to="/membership"
                                    className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-ink underline underline-offset-4"
                                >
                                    Become a member (optional)
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </Container>
        </div>
    );
}

