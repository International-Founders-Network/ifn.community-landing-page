import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        console.log('Received contact message:', data);

        // TODO: Connect to your database here
        // Example:
        // const response = await fetch(process.env.DATABASE_URL + '/messages', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Message sent successfully', data }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Failed to process request' }),
        };
    }
};
