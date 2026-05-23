const { getHeaders, getBaseUrl } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id が必要です' });

  const r = await fetch(`${getBaseUrl()}/tickets?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!r.ok) { const d = await r.json(); return res.status(500).json({ error: d }); }
  return res.status(200).json({ success: true });
};
