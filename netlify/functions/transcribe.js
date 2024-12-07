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
        if (event.httpMethod !== 'POST') {
            console.error('Invalid HTTP method:', event.httpMethod);
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Only POST method is allowed.' }),
            };
        }

        const { audioFile } = JSON.parse(event.body);
        if (!audioFile) {
            console.error('Missing audio file in request body');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Audio file is required in request body.' }),
            };
        }

        console.log('Initiating transcription with Gladia API...');

        // שליחת הבקשה ל-Gladia API
        const response = await fetch('https://api.gladia.io/v2/transcription/init', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GLADIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: audioFile, // URL של קובץ האודיו
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error from Gladia API:', errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorText }),
            };
        }

        const data = await response.json();
        console.log('Transcription initiated successfully:', data);

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
