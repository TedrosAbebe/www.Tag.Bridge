// Vercel Serverless Function — Gemini Proxy
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, system } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBS0214z1N7rZe2RWQ56AOKLvEYIIQyFJI';

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemini-3.8-flash',
                    input: text,
                    system_instruction: system || '',
                    store: false
                })
            }
        );

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({ error: data.error || 'Gemini error' });
        }

        // Extract reply from output_text or steps
        let reply = data.output_text || '';
        if (!reply && data.steps) {
            for (const step of data.steps) {
                if (step.model_output?.parts) {
                    for (const part of step.model_output.parts) {
                        if (part.text) reply += part.text;
                    }
                }
            }
        }

        return res.status(200).json({ reply: reply || 'ምላሽ አልተገኘም።' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
