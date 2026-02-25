import { useState, useEffect } from 'react';
import type { Event } from '../components/EventCard';
import eventsData from '../data/events.json';

interface UseEventsReturn {
    events: Event[];
    loading: boolean;
    error: string | null;
}

export function useEvents(): UseEventsReturn {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const response = await fetch('/api/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch from API');
                }
                const data = await response.json();
                setEvents(data as Event[]);
            } catch (err) {
                console.warn('API fetch failed, falling back to bundled data:', err);
                // Fallback to bundled data if API fails (good for local dev without functions running)
                setEvents(eventsData as Event[]);
                setError('Failed to load live events, showing cached data');
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    return { events, loading, error };
}
