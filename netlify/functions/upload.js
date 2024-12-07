import fetch from 'node-fetch';
import FormData from 'form-data';

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
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Only POST method is allowed.' }),
            };
        }

        // קבלת הקובץ מהבקשה
        const formData = new FormData();
        const fileBuffer = Buffer.from(event.body, 'base64'); // assuming the file is sent as base64
        formData.append('audio', fileBuffer, 'audio.wav');

        console.log('Uploading file to Gladia API...');

        // שליחת הבקשה ל-Gladia API
        const response = await fetch('https://api.gladia.io/v2/upload', {
            method: 'POST',
            headers: {
                'x-gladia-key': GLADIA_API_KEY,
            },
            body: formData,
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
        console.log('File uploaded successfully:', data);

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error during file upload:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};
