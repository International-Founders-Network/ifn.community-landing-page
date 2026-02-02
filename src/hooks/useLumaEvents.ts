import { useState, useEffect } from 'react';
import type { Event } from '../components/EventCard';
import eventsData from '../data/events.json';

interface UseLumaEventsReturn {
    events: Event[];
    loading: boolean;
    error: string | null;
}

export function useLumaEvents(): UseLumaEventsReturn {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate loading briefly for smoother UX or just set immediately
        const loadEvents = async () => {
            try {
                // In a real app, you might want to fetch this JSON from a public URL if it's hosted separately,
                // but importing it directly bundles it, which is fine for this size.
                setEvents(eventsData as Event[]);
                setLoading(false);
            } catch (err) {
                console.error('Error loading events:', err);
                setError('Failed to load events');
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    return { events, loading, error };
}
