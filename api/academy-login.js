/**
 * TAG BRIDGE — Academy Login API
 * POST /api/academy-login
 * Body: { password: string }
 * Returns: { token: string } on success, { error: string } on failure
 *
 * Passwords stored in Vercel KV as:  academy:pass:<hash> → { id, buyer, active, expiresAt, usedAt }
 * Session token = signed JWT (HS256) using ACADEMY_JWT_SECRET env var
 * Rate limit: 5 attempts per IP per 15 min stored in KV as academy:rate:<ip>
 */

import { createHmac, timingSafeEqual, randomBytes, createHash } from 'crypto';

// ── helpers ──────────────────────────────────────────────────────────────────

function signJWT(payload, secret) {
    const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body    = b64url(JSON.stringify(payload));
    const sig     = b64url(createHmac('sha256', secret).update(`${header}.${body}`).digest());
    return `${header}.${body}.${sig}`;
}

function b64url(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Simple bcrypt-like PBKDF2 hash (no native bcrypt on Vercel edge — use Node crypto)
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        require('crypto').pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
            if (err) return reject(err);
            resolve(`pbkdf2:${salt}:${key.toString('hex')}`);
        });
    });
}

async function verifyPassword(password, stored) {
    return new Promise((resolve, reject) => {
        if (!stored.startsWith('pbkdf2:')) return resolve(false);
        const [, salt, hash] = stored.split(':');
        require('crypto').pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
            if (err) return reject(err);
            try {
                const a = Buffer.from(hash, 'hex');
                const b = key;
                resolve(a.length === b.length && timingSafeEqual(a, b));
            } catch { resolve(false); }
        });
    });
}

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGet(key) {
    const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
    const d   = await res.json();
    if (!d.result) return null;
    try { return JSON.parse(d.result); } catch { return d.result; }
}

async function kvSet(key, value, exSeconds) {
    const body = { ex: exSeconds };
    const url  = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`;
    const params = exSeconds ? `?ex=${exSeconds}` : '';
    const res  = await fetch(url + params, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' }
    });
    return res.ok;
}

async function kvKeys(pattern) {
    const url = `${process.env.KV_REST_API_URL}/keys/${encodeURIComponent(pattern)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
    const d   = await res.json();
    return d.result || [];
}

// ── rate limiter ──────────────────────────────────────────────────────────────

async function checkRateLimit(ip) {
    const key  = `academy:rate:${createHash('sha256').update(ip).digest('hex').slice(0,16)}`;
    const data = await kvGet(key) || { count: 0, firstAt: Date.now() };
    const windowMs = 15 * 60 * 1000; // 15 min
    const maxAttempts = 5;

    // Reset if window expired
    if (Date.now() - data.firstAt > windowMs) {
        await kvSet(key, { count: 1, firstAt: Date.now() }, 900);
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (data.count >= maxAttempts) {
        const retryAfter = Math.ceil((data.firstAt + windowMs - Date.now()) / 1000);
        return { allowed: false, retryAfter };
    }

    await kvSet(key, { count: data.count + 1, firstAt: data.firstAt }, 900);
    return { allowed: true, remaining: maxAttempts - data.count - 1 };
}

// ── main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://www-tag-bridge.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const JWT_SECRET = process.env.ACADEMY_JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });

    // Rate limit by IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const rl = await checkRateLimit(ip);
    if (!rl.allowed) {
        return res.status(429).json({
            error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.`
        });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== 'string' || password.length > 100) {
        return res.status(400).json({ error: 'Password required' });
    }

    // Scan all active password records
    let keys = [];
    try {
        keys = await kvKeys('academy:pass:*');
    } catch (e) {
        return res.status(500).json({ error: 'Storage error' });
    }

    let matchedRecord = null;
    let matchedKey    = null;

    for (const key of keys) {
        const record = await kvGet(key);
        if (!record) continue;
        if (!record.active) continue;
        if (record.expiresAt && Date.now() > record.expiresAt) continue;

        const ok = await verifyPassword(password, record.hash);
        if (ok) { matchedRecord = record; matchedKey = key; break; }
    }

    if (!matchedRecord) {
        return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    // Update usedAt
    matchedRecord.usedAt    = Date.now();
    matchedRecord.usedCount = (matchedRecord.usedCount || 0) + 1;
    await kvSet(matchedKey, matchedRecord);

    // Issue JWT — expires in 24 hours
    const token = signJWT({
        sub:   matchedRecord.id,
        buyer: matchedRecord.buyer || 'student',
        iat:   Math.floor(Date.now() / 1000),
        exp:   Math.floor(Date.now() / 1000) + 86400
    }, JWT_SECRET);

    return res.status(200).json({ token, buyer: matchedRecord.buyer || 'Student' });
}
