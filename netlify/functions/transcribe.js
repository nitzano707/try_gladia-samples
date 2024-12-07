const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { audioUrl } = JSON.parse(event.body);
    const GLADIA_API_KEY = process.env.GLADIA_API_KEY;

    if (!GLADIA_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing API key in environment variables.' }),
        };
    }

    try {
        const response = await fetch('https://api.gladia.io/audio/text/transcription', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GLADIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: audioUrl }),
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error transcribing audio', details: error.message }),
        };
    }
};
