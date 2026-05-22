const { getHeaders, getBaseUrl } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const r = await fetch(`${getBaseUrl()}/tickets?select=*&order=created_at.desc`, { headers: getHeaders() });
  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: data });

  return res.status(200).json(data.map(t => ({
    id: t.id, kanji: t.kanji, furigana: t.furigana, school: t.school,
    used: t.used, createdAt: t.created_at, usedAt: t.used_at
  })));
};
