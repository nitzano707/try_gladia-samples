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

        const formData = new FormData();
        formData.append('file', event.body);

        console.log('Initiating transcription with Gladia...');

        // Step 1: Initiate transcription
        const initResponse = await fetch('https://api.gladia.io/v2/transcription/init', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GLADIA_API_KEY}`,
            },
            body: formData,
        });

        if (!initResponse.ok) {
            const errorText = await initResponse.text();
            console.error('Error initiating transcription:', errorText);
            return {
                statusCode: initResponse.status,
                body: JSON.stringify({ error: errorText }),
            };
        }

        const initData = await initResponse.json();
        const transcriptionId = initData.transcription_id;
        console.log('Transcription initiated. ID:', transcriptionId);

        // Step 2: Poll for transcription result
        let status = 'pending';
        let transcriptionData = null;
        while (status === 'pending') {
            console.log('Polling transcription status...');
            const statusResponse = await fetch(`https://api.gladia.io/v2/transcription/get?transcription_id=${transcriptionId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${GLADIA_API_KEY}`,
                },
            });

            if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                console.error('Error polling transcription status:', errorText);
                return {
                    statusCode: statusResponse.status,
                    body: JSON.stringify({ error: errorText }),
                };
            }

            transcriptionData = await statusResponse.json();
            status = transcriptionData.status;

            console.log('Transcription status:', status);
            if (status === 'pending') {
                await new Promise((resolve) => setTimeout(resolve, 3000)); // המתן 3 שניות
            }
        }

        // Step 3: Return final result
        if (status === 'completed') {
            console.log('Transcription completed:', transcriptionData);
            return {
                statusCode: 200,
                body: JSON.stringify(transcriptionData),
            };
        } else {
            console.error('Transcription failed:', transcriptionData);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Transcription failed', details: transcriptionData }),
            };
        }
    } catch (error) {
        console.error('Error during transcription process:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};
