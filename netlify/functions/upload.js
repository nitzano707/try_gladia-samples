import fetch from 'node-fetch';

export const handler = async (event) => {
    const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY;

    if (!UPLOAD_API_KEY) {
        console.error('Missing Upload API key');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing Upload API key in environment variables.' }),
        };
    }

    try {
        const formData = new FormData();
        formData.append('file', event.body);

        const response = await fetch('https://api.upload.io/upload', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${UPLOAD_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error from Upload.io:', errorText);
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
