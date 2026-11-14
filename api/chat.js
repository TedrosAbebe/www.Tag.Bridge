// Vercel Serverless Function — Gemini AI Proxy (Tag Bridge)
// API key must be set as GEMINI_API_KEY environment variable in Vercel dashboard

export default async function handler(req, res) {
    // Dynamic CORS for production, Vercel previews, and local testing
    const origin = req.headers.origin;
    if (origin && (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://www-tag-bridge.vercel.app');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text, system } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'No text provided' });
    if (text.length > 2000) return res.status(400).json({ error: 'Message too long' });

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

    const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const body = {
        contents: [{ role: 'user', parts: [{ text }] }],
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7,
            topP: 0.9
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

    try {
        const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000)
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            const errMsg = data?.error?.message || 'Gemini API error';
            const status = geminiRes.status;
            if (status === 429) return res.status(429).json({ error: 'Rate limit reached. Try again in a moment.' });
            return res.status(status).json({ error: errMsg });
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'ምላሽ አልተገኘም።';
        return res.status(200).json({ reply });

    } catch (err) {
        console.error('Gemini proxy error:', err.message);
        return res.status(500).json({ error: 'Service temporarily unavailable.' });
    }
}
