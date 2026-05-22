const { getHeaders, getBaseUrl } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  const r = await fetch(`${getBaseUrl()}/tickets?id=eq.${id}&limit=1`, { headers: getHeaders() });
  const data = await r.json();
  if (!r.ok || !data.length) return res.status(404).json({ error: 'チケットが見つかりません' });

  const t = data[0];
  return res.status(200).json({
    id: t.id, kanji: t.kanji, furigana: t.furigana, school: t.school,
    used: t.used, createdAt: t.created_at, usedAt: t.used_at
  });
};
