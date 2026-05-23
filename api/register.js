const { getHeaders, getBaseUrl } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { kanji, furigana, school, tanin } = req.body;
  if (!kanji || !furigana || !school || !tanin) {
    return res.status(400).json({ error: 'すべての項目を入力してください' });
  }

  const r = await fetch(`${getBaseUrl()}/tickets`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Prefer': 'return=representation' },
    body: JSON.stringify({ kanji: kanji.trim(), furigana: furigana.trim(), school: school.trim(), tanin: tanin.trim(), used: false }),
  });
  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: data });

  const ticket = Array.isArray(data) ? data[0] : data;
  return res.status(200).json({ id: ticket.id });
};
