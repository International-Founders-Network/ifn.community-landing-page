import { useState, useEffect } from 'react';
import eventsData from '../data/events.json';

export interface Event {
    id: string;
    title: string;
    start_at: string;
    location_name: string;
    url?: string;
    cover_url: string;
    raw_date: string;
    registrations?: { platform: string; url: string; }[];
}

export function useLumaEvents() {
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
                // We only set the error if it's not a expected fallback during development
                if (import.meta.env.MODE === 'production') {
                    setError('Failed to load live events, showing cached data');
                }
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    return { events, loading, error };
}
