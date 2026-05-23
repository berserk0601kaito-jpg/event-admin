const { getHeaders, getBaseUrl } = require('../_db');
const ExcelJS = require('exceljs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const r = await fetch(`${getBaseUrl()}/tickets?select=*&order=created_at.desc`, { headers: getHeaders() });
  const tickets = await r.json();
  if (!r.ok) return res.status(500).json({ error: tickets });

  const toJST = iso => new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('割引チケット一覧');
  ws.columns = [
    { header: '氏名（漢字）', key: 'kanji',     width: 16 },
    { header: 'ふりがな',     key: 'furigana',  width: 16 },
    { header: '所属校舎',     key: 'school',    width: 16 },
    { header: '担任',         key: 'tanin',     width: 14 },
    { header: '使用状況',     key: 'status',    width: 12 },
    { header: '登録日時',     key: 'createdAt', width: 24 },
    { header: '使用日時',     key: 'usedAt',    width: 24 },
    { header: 'チケットID',   key: 'id',        width: 40 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF667EEA' } };

  tickets.forEach(t => {
    const row = ws.addRow({
      kanji: t.kanji, furigana: t.furigana, school: t.school || '−', tanin: t.tanin || '−',
      status: t.used ? '使用済み' : '未使用',
      createdAt: toJST(t.created_at),
      usedAt: t.used_at ? toJST(t.used_at) : '−',
      id: t.id,
    });
    if (t.used) row.getCell('status').font = { color: { argb: 'FFE74C3C' } };
  });

  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="tickets_${dateStr}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
};
