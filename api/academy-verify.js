/**
 * TAG BRIDGE — Academy Token Verify API
 * POST /api/academy-verify
 * Body: { token: string }
 * Returns: { valid: true, buyer: string } or { valid: false }
 * Called by academy.html on every page load to re-validate session
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
        // Timing-safe compare
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
    res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://www-tag-bridge.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ valid: false });

    const { token } = req.body || {};
    if (!token) return res.status(200).json({ valid: false });

    const secret  = process.env.ACADEMY_JWT_SECRET;
    if (!secret)  return res.status(500).json({ valid: false });

    const payload = verifyJWT(token, secret);
    if (!payload) return res.status(200).json({ valid: false });

    return res.status(200).json({ valid: true, buyer: payload.buyer || 'Student' });
}
