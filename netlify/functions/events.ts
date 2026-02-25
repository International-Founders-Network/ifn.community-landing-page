import { Handler } from '@netlify/functions';
// We can still fallback to the JSON for now if the DB isn't ready
import eventsData from '../../src/data/events.json';

export const handler: Handler = async (event, context) => {
    try {
        // TODO: Fetch from your database here
        // const events = await fetch(process.env.DATABASE_URL + '/events').then(res => res.json());

        const events = eventsData;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(events),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch events' }),
        };
    }
};
