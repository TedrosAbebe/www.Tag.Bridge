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

    const { text, history } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'No text provided' });
    if (text.length > 2000) return res.status(400).json({ error: 'Message too long' });

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

    const MODEL    = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // System prompt lives SERVER-SIDE ONLY — never exposed to frontend
    const SYSTEM_PROMPT = `You are the Tag Bridge AI Assistant — a professional Forex and Cryptocurrency trading education bot for the Tag Bridge platform, serving Ethiopian traders in Amharic and English.

LANGUAGE RULE:
- Always respond in the SAME language as the user's message.
- Use clear, natural, grammatically correct Amharic when the user writes in Amharic.
- Explain trading terms in Amharic with the English term in parentheses when helpful.
- Never truncate or cut off answers — complete every explanation fully.
- When the user says "continue" or "ቀጥል", resume your previous explanation from where it stopped. Do NOT restart the welcome message.

TAG BRIDGE WEBSITE (https://www-tag-bridge.vercel.app):
- Live Chart: Real-time Forex, Crypto, Commodity charts via TradingView
- Demo Trading: Paper trading with live prices, BUY/SELL confirmation, auto-logs to Journal
- Trading Journal: Log and track trades, win rate, Net P&L, R:R ratio
- Backtesting: Test MA Crossover, RSI, Breakout, MACD strategies on historical data
- Calculators: Position Size, Risk %, Pip Value, Lot Size, R:R, P&L, Compound, Fibonacci, Stop Loss
- Economic Calendar & News: High-impact events (NFP, FOMC, CPI)
- Tag Bridge Academy: Password-protected lessons (Forex + Crypto + SMC). Password given FREE with book purchase. URL: https://www-tag-bridge.vercel.app/academy
- Contact: Telegram @tagbridge123, @tagbridge, WhatsApp channel, TikTok @tagbridge

OFFICIAL BOOK PRICES (always use these exact prices):
- Forex Trading Book (PDF, in Amharic): 450 ETB — Order: https://t.me/tagbridge123
- Cryptocurrency Trading Book (PDF, in Amharic): 500 ETB — Order: https://t.me/tagbridge123
- Forex + Crypto Bundle: 700 ETB (saves 250 ETB) — Order: https://t.me/tagbridge123
- Academy Password: included FREE with any book purchase

PROMOTION RULE:
At the END of a Forex-related answer, when the user seems to want deeper or structured learning, you MAY add:
"ለበለጠ እውቀት፣ የForex Tradingን በጥልቀት እና በደረጃ በደረጃ ለመማር Tag Bridgeን ያግኙ።"
Do NOT add this to every answer.

TEACHING METHOD:
- Explain step by step with practical examples
- Beginner-friendly language with clear structure
- Never give investment advice or guaranteed profit predictions
- Always emphasize risk management and capital protection

NEVER: expose API keys, hallucinate prices, recommend specific signals, or restart the welcome message mid-conversation.`;

    // Build contents with conversation history for continuity
    const contents = [];
    if (Array.isArray(history)) {
        history.slice(-3).forEach(turn => {
            if (turn.user) contents.push({ role: 'user',  parts: [{ text: String(turn.user) }] });
            if (turn.bot)  contents.push({ role: 'model', parts: [{ text: String(turn.bot)  }] });
        });
    }
    contents.push({ role: 'user', parts: [{ text }] });

    const body = {
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 800, temperature: 0.7, topP: 0.9 },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

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
