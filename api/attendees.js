const { getHeaders, getBaseUrl, checkAuth, setCors } = require('./_supabase');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;

  const base = getBaseUrl();
  const headers = getHeaders();

  if (req.method === 'GET') {
    const { event_id } = req.query;
    const filter = event_id ? `&event_id=eq.${event_id}` : '';
    const r = await fetch(`${base}/attendees?select=*&order=created_at.asc${filter}`, { headers });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { event_id, name, email } = req.body;
    const r = await fetch(`${base}/attendees`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ event_id, name, email, checked_in: false }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });
    return res.status(201).json(Array.isArray(data) ? data[0] : data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const r = await fetch(`${base}/attendees?id=eq.${id}`, { method: 'DELETE', headers });
    if (!r.ok) { const d = await r.json(); return res.status(500).json({ error: d }); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
};
