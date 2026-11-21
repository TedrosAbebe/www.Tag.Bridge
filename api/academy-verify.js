/**
 * TAG BRIDGE — Academy Token Verify API
 * POST /api/academy-verify
 * Body: { token: string }
 * Returns: { valid: true, buyer, bookType } or { valid: false }
 */

import { createHmac } from 'crypto';

function b64url(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function verifyJWT(token, secret) {
    try {
        const [hdr, body, sig] = token.split('.');
        if (!hdr || !body || !sig) return null;
        const expected = b64url(createHmac('sha256', secret).update(`${hdr}.${body}`).digest());
        if (expected.length !== sig.length) return null;
        let diff = 0;
        for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
        if (diff !== 0) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
        return payload;
    } catch { return null; }
}

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
    if (req.method !== 'POST')   return res.status(405).json({ valid: false });

    const { token } = req.body || {};
    if (!token) return res.status(200).json({ valid: false });

    const secret  = process.env.ACADEMY_JWT_SECRET || 'TBridge-JWT-2026-XkP9mN3qR7vL';
    const payload = verifyJWT(token, secret);
    if (!payload)  return res.status(200).json({ valid: false });

    return res.status(200).json({
        valid:    true,
        buyer:    payload.buyer || 'Student',
        bookType: payload.bookType || 'bundle'
    });
}
