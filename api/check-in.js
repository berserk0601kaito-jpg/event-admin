const { getHeaders, getBaseUrl, checkAuth, setCors } = require('./_supabase');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const base = getBaseUrl();
  const headers = getHeaders();

  const { token, attendee_id } = req.body;

  // 管理者による手動チェックイン
  if (attendee_id) {
    if (!checkAuth(req, res)) return;
    const r = await fetch(`${base}/attendees?id=eq.${attendee_id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ checked_in: true, checked_in_at: new Date().toISOString() }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });
    return res.status(200).json({ status: 'success', attendee: Array.isArray(data) ? data[0] : data });
  }

  // QRコードスキャンによるチェックイン
  if (!token) return res.status(400).json({ error: 'token が必要です' });

  const findR = await fetch(`${base}/attendees?select=*,events(*)&qr_token=eq.${token}&limit=1`, { headers });
  const found = await findR.json();
  if (!findR.ok || !found.length) return res.status(404).json({ error: 'QRコードが無効です' });

  const attendee = found[0];
  if (attendee.checked_in) return res.status(200).json({ status: 'already_checked_in', attendee });

  const updateR = await fetch(`${base}/attendees?qr_token=eq.${token}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ checked_in: true, checked_in_at: new Date().toISOString() }),
  });
  const updated = await updateR.json();
  if (!updateR.ok) return res.status(500).json({ error: updated });

  const updatedAttendee = Array.isArray(updated) ? updated[0] : updated;
  updatedAttendee.events = attendee.events;
  return res.status(200).json({ status: 'success', attendee: updatedAttendee });
};
