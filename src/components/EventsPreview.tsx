import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Container } from './Container';
import { Button } from './Button';
import { useEvents } from '../hooks/useEvents';
import { Link } from 'react-router-dom';
import { EventCard } from './EventCard';

export function EventsPreview() {
    const { events, loading } = useEvents();
    const [currentPage, setCurrentPage] = useState(0);
    const EVENTS_PER_PAGE = 3;

    const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
    const displayedEvents = events.slice(currentPage * EVENTS_PER_PAGE, (currentPage + 1) * EVENTS_PER_PAGE);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <section className="py-24 bg-white" id="events">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Join Us Next</h2>
                        <p className="text-lg text-slate-600">Connect with the community at our upcoming events.</p>
                    </div>
                    {/* Pagination Controls - Top Right for easy access if many events */}
                    {!loading && events.length > EVENTS_PER_PAGE && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentPage === 0}
                                className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={currentPage >= totalPages - 1}
                                className={currentPage >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="w-full h-96 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {displayedEvents.map((event, index) => (
                                <EventCard key={event.id} event={event} index={index} />
                            ))}
                        </div>

                        {/* Page Indicator */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mb-8 gap-2">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx)}
                                        className={`w-2 h-2 rounded-full transition-colors ${currentPage === idx ? 'bg-primary' : 'bg-slate-300 hover:bg-slate-400'
                                            }`}
                                        aria-label={`Go to page ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="text-center">
                    <Link to="/events">
                        <Button size="lg" className="group">
                            View Full Calendar
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </Container>
        </section>
    );
}
