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

    const { text, system, history } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'No text provided' });
    if (text.length > 2000) return res.status(400).json({ error: 'Message too long' });

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

    // Use gemini-3.5-flash-lite — stable, fast, free tier, supports generateContent
    // Source: https://aistudio.google.com/docs/models (November 2026)
    const MODEL    = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // Build contents array with conversation history for continuity
    const contents = [];
    if (Array.isArray(history)) {
        history.forEach(turn => {
            if (turn.user) contents.push({ role: 'user',  parts: [{ text: turn.user }] });
            if (turn.bot)  contents.push({ role: 'model', parts: [{ text: turn.bot  }] });
        });
    }
    contents.push({ role: 'user', parts: [{ text }] });

    const body = {
        contents,
        generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7,
            topP: 0.9
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT',   threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

    // Add system instruction only if provided
    if (system && typeof system === 'string') {
        body.systemInstruction = { parts: [{ text: system }] };
    }

    try {
        const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(20000)
        });

        const data = await geminiRes.json();

        // Surface the real Gemini error to the caller instead of hiding it
        if (!geminiRes.ok) {
            const errMsg = data?.error?.message || `Gemini API error ${geminiRes.status}`;
            console.error('[chat.js] Gemini error:', geminiRes.status, errMsg);
            if (geminiRes.status === 429) {
                return res.status(429).json({ error: 'Rate limit reached. Please try again in a moment.' });
            }
            return res.status(geminiRes.status).json({ error: errMsg });
        }

        // Extract reply from Gemini response structure
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            console.error('[chat.js] No reply in response:', JSON.stringify(data));
            return res.status(500).json({ error: 'No response generated. Try rephrasing your question.' });
        }

        return res.status(200).json({ reply });

    } catch (err) {
        console.error('[chat.js] Fetch error:', err.message);
        if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
            return res.status(504).json({ error: 'Request timed out. Please try again.' });
        }
        return res.status(500).json({ error: 'Service temporarily unavailable: ' + err.message });
    }
}
