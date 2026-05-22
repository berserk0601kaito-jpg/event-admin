const { getHeaders, getBaseUrl, checkAuth, setCors } = require('./_supabase');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;

  const base = getBaseUrl();
  const headers = getHeaders();

  if (req.method === 'GET') {
    const r = await fetch(`${base}/events?select=*&order=created_at.desc`, { headers });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, date, location, description } = req.body;
    const r = await fetch(`${base}/events`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name, date, location, description }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });
    return res.status(201).json(Array.isArray(data) ? data[0] : data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const r = await fetch(`${base}/events?id=eq.${id}`, { method: 'DELETE', headers });
    if (!r.ok) { const d = await r.json(); return res.status(500).json({ error: d }); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
};
