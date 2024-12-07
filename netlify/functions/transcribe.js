import fetch from 'node-fetch';

export const handler = async (event) => {
    // קבלת URL של קובץ האודיו מתוך הבקשה
    const { audioUrl } = JSON.parse(event.body);
    const GLADIA_API_KEY = process.env.GLADIA_API_KEY; // מפתח ה-API מוגדר במשתנה סביבה

    // בדיקת קיום מפתח API
    if (!GLADIA_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing API key in environment variables.' }),
        };
    }

    try {
        // קריאה ל-API של Gladia עם נתיב התמלול
        const response = await fetch('https://api.gladia.io/audio/text/transcription', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GLADIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: audioUrl }),
        });

        // בדיקת תגובת ה-API ועיבוד הפלט
        const data = await response.json();

        // החזרת הפלט ללקוח
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        // טיפול בשגיאות
        console.error('Error during transcription:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error transcribing audio', details: error.message }),
        };
    }
};
