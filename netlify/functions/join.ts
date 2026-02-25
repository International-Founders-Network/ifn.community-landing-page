import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        console.log('Received join application:', data);

        // TODO: Connect to your database here
        // Example (if using a hypothetical DB_URL env var):
        // const response = await fetch(process.env.DATABASE_URL + '/applications', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });

        // For now, we simulate a successful database insert
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Application received successfully', data }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Failed to process request' }),
        };
    }
};
