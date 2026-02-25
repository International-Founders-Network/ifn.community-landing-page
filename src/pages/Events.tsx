import { Container } from '../components/Container';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { Loader2, Calendar, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '../components/Button';

export function Events() {
    const { events: allEvents, loading } = useEvents();
    const [locationFilter, setLocationFilter] = React.useState<'all' | 'austin' | 'global'>('all');
    const [timeFilter, setTimeFilter] = React.useState<'all' | 'this-month' | 'next-month'>('all');

    const filteredEvents = allEvents.filter(e => {
        // Location Filter
        const matchesLocation = locationFilter === 'all' ||
            (locationFilter === 'austin' ? e.location_name?.toLowerCase().includes('austin') : !e.location_name?.toLowerCase().includes('austin'));

        if (!matchesLocation) return false;

        // Time Filter
        if (timeFilter === 'all') return true;

        const eventDate = new Date(e.start_at);
        const now = new Date();

        if (timeFilter === 'this-month') {
            return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        }

        if (timeFilter === 'next-month') {
            const nextMonth = (now.getMonth() + 1) % 12;
            const nextMonthYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
            return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextMonthYear;
        }

        return true;
    });

    return (
        <main className="pt-24 pb-20">
            <section className="bg-slate-50 py-20 mb-16">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="max-w-2xl">
                            <div className="flex gap-2 mb-6">
                                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Community Calendar
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">The Global Founders Calendar</h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Curated high-signal meetups, workshops, and mixers for the international founder community. Seamlessly integrated across our ecosystem.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Time Filter */}
                            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1">
                                {[
                                    { id: 'all', label: 'All Time' },
                                    { id: 'this-month', label: 'This Month' },
                                    { id: 'next-month', label: 'Next Month' }
                                ].map((time) => (
                                    <button
                                        key={time.id}
                                        onClick={() => setTimeFilter(time.id as any)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${timeFilter === time.id
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {time.label}
                                    </button>
                                ))}
                            </div>

                            {/* Location Filter */}
                            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1">
                                {['all', 'austin', 'global'].map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => setLocationFilter(loc as any)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${locationFilter === loc
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-slate-500 font-medium">Fetching the latest events...</p>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Upcoming Events</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            We're currently planning our next set of events. Check back soon for our next global mixer or workshop.
                        </p>
                        <Button variant="outline" onClick={() => window.open('https://lu.ma/IFN_ATX', '_blank')}>
                            Follow us on Luma
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Newsletter / CTA for Events */}
                {!loading && allEvents.length > 0 && (
                    <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <h2 className="text-3xl font-bold mb-6">Never Miss an Event</h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">
                            Get notified about new meetups, webinars, and exclusive founder sessions delivered straight to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 flex-grow text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-dark transition-all whitespace-nowrap">
                                Get Notified
                            </button>
                        </div>
                    </div>
                )}
            </Container>
        </main>
    );
}
