/**
 * TAG BRIDGE — Academy Admin API
 * Protected by ACADEMY_ADMIN_KEY header
 *
 * POST   /api/academy-admin  { action:'create', buyer, expiryDays }  → create password
 * POST   /api/academy-admin  { action:'list' }                        → list all
 * POST   /api/academy-admin  { action:'revoke', id }                 → deactivate
 * POST   /api/academy-admin  { action:'activate', id }               → reactivate
 * POST   /api/academy-admin  { action:'delete', id }                 → permanently delete
 */

import { randomBytes } from 'crypto';

// PBKDF2 hash (same as login)
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        require('crypto').pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
            if (err) return reject(err);
            resolve(`pbkdf2:${salt}:${key.toString('hex')}`);
        });
    });
}

// Generate a human-friendly password: XXXX-XXXX-XXXX
function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `TB-${seg()}-${seg()}-${seg()}`;
}

// KV helpers
async function kvGet(key) {
    const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
    const d   = await res.json();
    if (!d.result) return null;
    try { return JSON.parse(d.result); } catch { return d.result; }
}

async function kvSet(key, value) {
    const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    return res.ok;
}

async function kvDel(key) {
    const url = `${process.env.KV_REST_API_URL}/del/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    return res.ok;
}

async function kvKeys(pattern) {
    const url = `${process.env.KV_REST_API_URL}/keys/${encodeURIComponent(pattern)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
    const d   = await res.json();
    return d.result || [];
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    // Admin key check
    const adminKey = req.headers['x-admin-key'] || (req.body || {}).adminKey;
    if (!adminKey || adminKey !== process.env.ACADEMY_ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, buyer, expiryDays, id } = req.body || {};

    // ── CREATE ────────────────────────────────────────────────
    if (action === 'create') {
        const plainPassword = generatePassword();
        const hash          = await hashPassword(plainPassword);
        const uid           = randomBytes(8).toString('hex');
        const record = {
            id,
            id:        uid,
            buyer:     buyer || 'Unknown',
            hash,
            active:    true,
            createdAt: Date.now(),
            expiresAt: expiryDays ? Date.now() + expiryDays * 86400000 : null,
            usedAt:    null,
            usedCount: 0
        };
        await kvSet(`academy:pass:${uid}`, record);
        return res.status(200).json({
            success: true,
            id: uid,
            password: plainPassword,   // Only shown ONCE — save immediately
            buyer: record.buyer,
            expiresAt: record.expiresAt
        });
    }

    // ── LIST ──────────────────────────────────────────────────
    if (action === 'list') {
        const keys    = await kvKeys('academy:pass:*');
        const records = await Promise.all(keys.map(k => kvGet(k)));
        const clean   = records
            .filter(Boolean)
            .map(r => ({
                id:        r.id,
                buyer:     r.buyer,
                active:    r.active,
                createdAt: r.createdAt,
                expiresAt: r.expiresAt,
                usedAt:    r.usedAt,
                usedCount: r.usedCount || 0,
                expired:   r.expiresAt ? Date.now() > r.expiresAt : false
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
        return res.status(200).json({ success: true, records: clean });
    }

    // ── REVOKE ────────────────────────────────────────────────
    if (action === 'revoke') {
        if (!id) return res.status(400).json({ error: 'id required' });
        const key    = `academy:pass:${id}`;
        const record = await kvGet(key);
        if (!record) return res.status(404).json({ error: 'Not found' });
        record.active = false;
        await kvSet(key, record);
        return res.status(200).json({ success: true });
    }

    // ── ACTIVATE ──────────────────────────────────────────────
    if (action === 'activate') {
        if (!id) return res.status(400).json({ error: 'id required' });
        const key    = `academy:pass:${id}`;
        const record = await kvGet(key);
        if (!record) return res.status(404).json({ error: 'Not found' });
        record.active = true;
        await kvSet(key, record);
        return res.status(200).json({ success: true });
    }

    // ── DELETE ────────────────────────────────────────────────
    if (action === 'delete') {
        if (!id) return res.status(400).json({ error: 'id required' });
        await kvDel(`academy:pass:${id}`);
        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
}
