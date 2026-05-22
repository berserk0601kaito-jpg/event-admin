const { getHeaders, getBaseUrl } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.query;
  const base = getBaseUrl();
  const headers = getHeaders();

  const checkR = await fetch(`${base}/tickets?id=eq.${id}&limit=1`, { headers });
  const found = await checkR.json();
  if (!checkR.ok || !found.length) return res.status(404).json({ error: 'チケットが見つかりません' });

  const ticket = found[0];
  if (ticket.used) {
    return res.status(400).json({ error: 'このチケットはすでに使用済みです', usedAt: ticket.used_at });
  }

  const usedAt = new Date().toISOString();
  const r = await fetch(`${base}/tickets?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ used: true, used_at: usedAt }),
  });
  if (!r.ok) { const d = await r.json(); return res.status(500).json({ error: d }); }

  return res.status(200).json({ success: true, usedAt });
};
