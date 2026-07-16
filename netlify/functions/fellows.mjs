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
  const url = new URL(req.url);

  // --- admin: clear all or remove one, protected by the FF_ADMIN_KEY env var ---
  const reset = url.searchParams.get('reset');   // reset=all -> wipe the wall
  const del = url.searchParams.get('del');        // del=1     -> remove FF-#1
  if (reset || del) {
    const ADMIN = process.env.FF_ADMIN_KEY;
    const key = url.searchParams.get('key');
    if (!ADMIN || key !== ADMIN) return reply({ error: 'unauthorized' }, 401);
    let list = (await store.get('list', { type: 'json' })) || [];
    if (reset === 'all') list = [];
    else if (del) list = list.filter((f) => String(f.n) !== String(del));
    await store.setJSON('list', list);
    return reply({ ok: true, removed: reset === 'all' ? 'all' : del, fellows: list });
  }

  if (req.method === 'GET') {
    const list = (await store.get('list', { type: 'json' })) || [];
    return reply({ fellows: list });
  }

  if (req.method === 'POST') {
    let body = {};
    try { body = await req.json(); } catch { /* ignore */ }
    const name = clean(body.name, 60) || '';   // keep the full name (e.g. "Jamie Zhang"), not just the first word
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
