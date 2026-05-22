const { getSupabase, checkAuth, setCors } = require('./_supabase');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { event_id } = req.query;
    let query = supabase.from('attendees').select('*').order('created_at', { ascending: true });
    if (event_id) query = query.eq('event_id', event_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { event_id, name, email } = req.body;
    const { data, error } = await supabase
      .from('attendees')
      .insert([{ event_id, name, email, checked_in: false }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase.from('attendees').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
};
