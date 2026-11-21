/**
 * TAG BRIDGE — Academy Login API (Hardcoded passwords — temporary)
 * POST /api/academy-login
 * Body: { password: string }
 * Returns: { token, buyer } on success
 *
 * NOTE: Replace hardcoded passwords with KV/DB when ready.
 * To add more passwords, add to VALID_PASSWORDS array below.
 */

import { createHmac } from 'crypto';

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

// ── HARDCODED PASSWORDS ──────────────────────────────────────────
// Format: { password, buyer, bookType: 'forex'|'crypto'|'bundle' }
// Add new passwords here. Remove when switching to KV/DB.
const VALID_PASSWORDS = [
    { password: '494841',           buyer: 'Test Student',  bookType: 'bundle' },
    { password: 'TB-TEST-FOREX-01', buyer: 'Forex Buyer',   bookType: 'forex'  },
    { password: 'TB-TEST-CRYPTO-01',buyer: 'Crypto Buyer',  bookType: 'crypto' },
];
// ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
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
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const JWT_SECRET = process.env.ACADEMY_JWT_SECRET || 'TBridge-JWT-2026-XkP9mN3qR7vL';

    const { password } = req.body || {};
    if (!password || typeof password !== 'string' || password.length > 100) {
        return res.status(400).json({ error: 'Password required' });
    }

    // Find matching password (case-sensitive, timing-safe via constant-time compare)
    const record = VALID_PASSWORDS.find(r => {
        // Constant-time compare to prevent timing attacks
        if (r.password.length !== password.length) return false;
        let diff = 0;
        for (let i = 0; i < r.password.length; i++) {
            diff |= r.password.charCodeAt(i) ^ password.charCodeAt(i);
        }
        return diff === 0;
    });

    if (!record) {
        return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    // Issue JWT — expires in 24 hours
    const token = signJWT({
        sub:      record.buyer.toLowerCase().replace(/\s/g, '_'),
        buyer:    record.buyer,
        bookType: record.bookType,
        iat:      Math.floor(Date.now() / 1000),
        exp:      Math.floor(Date.now() / 1000) + 86400
    }, JWT_SECRET);

    return res.status(200).json({
        token,
        buyer:    record.buyer,
        bookType: record.bookType
    });
}
