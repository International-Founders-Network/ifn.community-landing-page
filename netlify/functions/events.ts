import { Handler } from '@netlify/functions';
import eventsData from '../../src/data/events.json';

// The bundled src/data/events.json (regenerated from Luma by the Sync Events workflow)
// is the single source of truth for events. Do not reintroduce a database read here:
// a second store means the feed can silently contradict the rest of the site.
export const handler: Handler = async () => ({
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventsData),
});
