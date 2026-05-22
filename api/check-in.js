const { getSupabase, checkAuth, setCors } = require('./_supabase');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = getSupabase();
  const { token, attendee_id } = req.body;

  // 管理者による手動チェックイン (IDで指定)
  if (attendee_id) {
    if (!checkAuth(req, res)) return;
    const { data, error } = await supabase
      .from('attendees')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', attendee_id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'success', attendee: data });
  }

  // QRコードスキャンによるチェックイン (tokenで検索)
  if (!token) return res.status(400).json({ error: 'token が必要です' });

  const { data: attendee, error: findError } = await supabase
    .from('attendees')
    .select('*, events(*)')
    .eq('qr_token', token)
    .single();

  if (findError || !attendee) {
    return res.status(404).json({ error: 'QRコードが無効です' });
  }

  if (attendee.checked_in) {
    return res.status(200).json({ status: 'already_checked_in', attendee });
  }

  const { data: updated, error: updateError } = await supabase
    .from('attendees')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('qr_token', token)
    .select('*, events(*)')
    .single();

  if (updateError) return res.status(500).json({ error: updateError.message });
  return res.status(200).json({ status: 'success', attendee: updated });
};
