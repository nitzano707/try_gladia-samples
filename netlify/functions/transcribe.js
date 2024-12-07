import fetch from 'node-fetch';

export const handler = async (event) => {
    const GLADIA_API_KEY = process.env.GLADIA_API_KEY;

    if (!GLADIA_API_KEY) {
        console.error('Missing API key');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing API key in environment variables.' }),
        };
    }

    try {
        // בדיקת סוג הבקשה
        if (event.httpMethod !== 'POST') {
            console.error('Invalid HTTP method:', event.httpMethod);
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Only POST method is allowed.' }),
            };
        }

        console.log('Received request:', event);

        const formData = new FormData();
        formData.append('audio', event.body);

        console.log('Sending request to Gladia API...');

        const response = await fetch('https://api.gladia.io/upload/audio-file', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GLADIA_API_KEY}`,
            },
            body: formData,
        });

        console.log('Response from Gladia API:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error from Gladia API:', errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorText }),
            };
        }

        const data = await response.json();
        console.log('Data from Gladia API:', data);

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error during transcription process:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};
