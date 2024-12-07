import fetch from 'node-fetch';

export const handler = async (event) => {
    const GLADIA_API_KEY = process.env.GLADIA_API_KEY; // מפתח ה-API שלך

    if (!GLADIA_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing API key in environment variables.' }),
        };
    }

    try {
        const formData = new FormData();
        formData.append('audio', event.body); // קבלת הקובץ מהלקוח

        const response = await fetch('https://api.gladia.io/upload/audio-file', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GLADIA_API_KEY}`,
            },
            body: formData,
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error during transcription:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error transcribing audio', details: error.message }),
        };
    }
};
