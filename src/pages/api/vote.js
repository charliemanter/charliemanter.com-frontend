// /pages/api/vote.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { winnerId, loserId, k = 24 } = req.body || {};
  if (!winnerId || !loserId || winnerId === loserId) {
    return res.status(400).json({ error: 'Invalid vote payload' });
  }

  try {
    // Make sure both ratings exist (safe no-op if they already do)
    await supabaseAdmin.from('ratings').upsert(
      [{ track_id: winnerId }, { track_id: loserId }],
      { onConflict: 'track_id', ignoreDuplicates: true }
    );

    const { data, error } = await supabaseAdmin
      .rpc('record_vote', { p_winner: winnerId, p_loser: loserId, p_k: k });

    if (error) throw error;
    res.json({ ok: true, result: data?.[0] || null });
  } catch (e) {
    console.error('[vote]', e);
    res.status(500).json({ error: e.message });
  }
}
