/**
 * TAG BRIDGE — Academy Login API (Supabase-backed)
 * POST /api/academy-login
 * Body: { password: string }
 * Returns: { token, buyer, bookType } on success
 *
 * Passwords stored in Supabase `academy_passwords` table.
 * Falls back to hardcoded list if Supabase env vars not set.
 */

import { createHmac } from 'crypto';

// ── JWT helpers ──────────────────────────────────────────────────
function b64url(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJWT(payload, secret) {
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body   = b64url(JSON.stringify(payload));
    const sig    = b64url(createHmac('sha256', secret).update(`${header}.${body}`).digest());
    return `${header}.${body}.${sig}`;
}

// Constant-time string compare (prevents timing attacks)
function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

// ── Fallback passwords (used only if Supabase env vars missing) ──
const FALLBACK_PASSWORDS = [
    { password: '494841',            buyer: 'Test Student',  bookType: 'bundle' },
    { password: 'TB-TEST-FOREX-01',  buyer: 'Forex Buyer',   bookType: 'forex'  },
    { password: 'TB-TEST-CRYPTO-01', buyer: 'Crypto Buyer',  bookType: 'crypto' },
];

// ── Supabase lookup ──────────────────────────────────────────────
async function lookupPassword(password) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    // No Supabase env vars → use fallback
    if (!supabaseUrl || !supabaseKey) {
        console.warn('[academy-login] Supabase env vars missing, using fallback passwords');
        return FALLBACK_PASSWORDS.find(r => safeEqual(r.password, password)) || null;
    }

    try {
        // Query academy_passwords table — filter by password + active=true
        const url = `${supabaseUrl}/rest/v1/academy_passwords?password=eq.${encodeURIComponent(password)}&active=eq.true&select=buyer,book_type&limit=1`;
        const resp = await fetch(url, {
            headers: {
                'apikey':        supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Accept':        'application/json',
            },
        });

        if (!resp.ok) {
            console.error('[academy-login] Supabase error:', resp.status, await resp.text());
            return null;
        }

        const rows = await resp.json();
        if (!rows || rows.length === 0) return null;

        return {
            buyer:    rows[0].buyer,
            bookType: rows[0].book_type,
        };
    } catch (err) {
        console.error('[academy-login] Supabase fetch failed:', err.message);
        return null;
    }
}

// ── Handler ──────────────────────────────────────────────────────
export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin && (
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
    )) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://www-tag-bridge.vercel.app');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const { password } = req.body || {};
    if (!password || typeof password !== 'string' || password.length > 100) {
        return res.status(400).json({ error: 'Password required' });
    }

    const record = await lookupPassword(password.trim());

    if (!record) {
        return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    const JWT_SECRET = process.env.ACADEMY_JWT_SECRET || 'TBridge-JWT-2026-XkP9mN3qR7vL';

    const token = signJWT({
        sub:      record.buyer.toLowerCase().replace(/\s/g, '_'),
        buyer:    record.buyer,
        bookType: record.bookType,
        iat:      Math.floor(Date.now() / 1000),
        exp:      Math.floor(Date.now() / 1000) + 86400,  // 24 hours
    }, JWT_SECRET);

    return res.status(200).json({
        token,
        buyer:    record.buyer,
        bookType: record.bookType,
    });
}
