// Frisson Fellow wall — global, persistent, ordered roster.
// GET  /api/fellows        -> { fellows: [{n,name,link,at}, ...] }  (newest first)
// POST /api/fellows {name,link,email} -> assigns the next global FF number, stores, returns updated list.
// Storage: Netlify Blobs (built-in; no external DB). Email is kept out of the public list.
import { getStore } from '@netlify/blobs';

const clean = (s, max) => String(s == null ? '' : s).replace(/[<>]/g, '').trim().slice(0, max);
const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store' };
const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });

export default async (req) => {
  const store = getStore({ name: 'frisson-fellows', consistency: 'strong' });

  if (req.method === 'GET') {
    const list = (await store.get('list', { type: 'json' })) || [];
    return reply({ fellows: list });
  }

  if (req.method === 'POST') {
    let body = {};
    try { body = await req.json(); } catch { /* ignore */ }
    const name = clean(body.name, 60).split(/\s+/)[0] || '';
    const link = clean(body.link, 300);
    const title = clean(body.title, 40);
    if (!name) return reply({ error: 'name required' }, 400);

    const list = (await store.get('list', { type: 'json' })) || [];
    const n = list.reduce((m, f) => Math.max(m, f.n || 0), 0) + 1;
    const fellow = { n, name, title, link, at: Date.now() };
    list.unshift(fellow);                 // newest first
    await store.setJSON('list', list);
    return reply({ fellow, fellows: list });
  }

  return reply({ error: 'method not allowed' }, 405);
};

export const config = { path: '/api/fellows' };
