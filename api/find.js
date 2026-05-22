const { getHeaders, getBaseUrl } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { kanji, furigana } = req.body;
  if (!kanji) return res.status(400).json({ error: '氏名を入力してください' });

  const r = await fetch(
    `${getBaseUrl()}/tickets?kanji=eq.${encodeURIComponent(kanji.trim())}&order=created_at.desc`,
    { headers: getHeaders() }
  );
  let found = await r.json();
  if (!r.ok) return res.status(500).json({ error: found });

  if (furigana && furigana.trim()) {
    const filtered = found.filter(t => t.furigana === furigana.trim());
    if (filtered.length > 0) found = filtered;
  }

  if (found.length === 0) {
    return res.status(404).json({ error: '登録が見つかりません。名前を確認してください。' });
  }

  return res.status(200).json({ id: found[0].id });
};
