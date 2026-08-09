import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Check, Info } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
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
    { id: 'elsewhere', label: 'Outside Austin' },
];

/**
 * Three buckets, not two. The old test was `!location_name.includes('austin')`, so an
 * event with no location at all was silently filed as "global" — an event we cannot
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
            className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${active ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            <section className="bg-slate-50 py-20 mb-16">
                <Container>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-2xl">
                            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 mb-6">
                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                One meetup a month, in person
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                Monthly <Emphasis>meetups</Emphasis> in Austin, Texas
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                We have met in person every month for more than six months. Each meetup pairs founders
                                for short one-to-one conversations, so you speak with people directly instead of hoping
                                to find them in a crowded room. Dates are published on Luma and Meetup.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div
                                role="group"
                                aria-label="Filter meetups by date"
                                className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1"
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
                                className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1"
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
                        className="mb-10 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                        <Info className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
                        <p>
                            These dates come from our saved copy of the calendar, so they may be behind.{' '}
                            <a
                                href={LUMA_CALENDAR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                Luma has the current dates
                                <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                            .
                        </p>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">{heading}</h2>
                    {/* Present on every render so the count is announced when a filter changes. */}
                    <p aria-live="polite" className="text-slate-600 mt-1">
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
                        <Loader2 className="motion-status w-12 h-12 text-primary animate-spin" aria-hidden="true" />
                        <p className="text-slate-500 font-medium">Loading the calendar.</p>
                    </div>
                ) : count > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleEvents.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 px-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" aria-hidden="true" />
                        <p className="text-slate-700 text-lg font-semibold mb-2">Nothing here yet</p>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
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
                    <section className="mt-24 bg-slate-900 rounded-3xl px-6 py-16 sm:px-12 text-center text-white relative overflow-hidden">
                        <div
                            aria-hidden="true"
                            className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-[80px] -mr-32 -mt-32"
                        />
                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-4">Hear about the next meetup</h2>
                            <p className="text-slate-300 max-w-xl mx-auto mb-10 text-lg">
                                IFN runs one in-person meetup in Austin each month. Leave your email address and we will
                                let you know when the next date is open.
                            </p>
                            <SignupForm />
                        </div>
                    </section>
                )}
            </Container>
        </div>
    );
}

function SignupForm() {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('/api/event-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setMessage('We could not reach the server. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                role="alert"
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 max-w-md mx-auto"
            >
                <p className="text-green-300 font-bold">{message}</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto text-left">
            {/* A real label, not a placeholder. Hidden because the panel is a single
                centred field, but present for screen readers and label-click focus. */}
            <label htmlFor="event-notify-email" className="sr-only">
                Email address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    id="event-notify-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-describedby={status === 'error' ? 'event-notify-error' : undefined}
                    aria-invalid={status === 'error' || undefined}
                    className="h-14 flex-grow rounded-lg bg-white/10 border border-white/25 px-5 text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
                />
                <Button type="submit" size="lg" onDark disabled={status === 'submitting'} className="shrink-0">
                    {status === 'submitting' ? 'Sending' : 'Notify me'}
                </Button>
            </div>
            {status === 'error' && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    id="event-notify-error"
                    role="alert"
                    className="mt-3 text-sm font-medium text-red-300"
                >
                    {message}
                </motion.p>
            )}
        </form>
    );
}
