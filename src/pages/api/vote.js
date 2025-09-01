// // /pages/api/vote.js
// import { supabaseAdmin } from '../../lib/supabaseAdmin';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const { winnerId, loserId, k = 24 } = req.body || {};
//   if (!winnerId || !loserId || winnerId === loserId) {
//     return res.status(400).json({ error: 'Invalid vote payload' });
//   }

//   try {
//     // Make sure both ratings exist (safe no-op if they already do)
//     await supabaseAdmin.from('ratings').upsert(
//       [{ track_id: winnerId }, { track_id: loserId }],
//       { onConflict: 'track_id', ignoreDuplicates: true }
//     );

//     const { data, error } = await supabaseAdmin
//       .rpc('record_vote', { p_winner: winnerId, p_loser: loserId, p_k: k });

//     if (error) throw error;
//     res.json({ ok: true, result: data?.[0] || null });
//   } catch (e) {
//     console.error('[vote]', e);
//     res.status(500).json({ error: e.message });
//   }
// }
// src/pages/api/vote.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { winner, loser, winnerId, loserId } = req.body || {};

    // normalize to IDs + optional metadata
    const w = winner || {};
    const l = loser || {};
    const wId = winnerId || w.id;
    const lId = loserId || l.id;

    if (!wId || !lId) {
      return res.status(400).json({ error: 'winnerId and loserId (or winner/loser with id) are required' });
    }

    // Upsert minimal track metadata so leaderboard can join
    const toUpsert = [];
    if (wId) {
      toUpsert.push({
        id: wId,
        name: w.name || w.title || 'Unknown',
        artist: w.artist || w.artists?.[0]?.name || 'Unknown',
        image_url: w.imageUrl || w.album?.images?.[0]?.url || null,
        external_url: w.externalUrl || w.external_urls?.spotify || null
      });
    }
    if (lId) {
      toUpsert.push({
        id: lId,
        name: l.name || l.title || 'Unknown',
        artist: l.artist || l.artists?.[0]?.name || 'Unknown',
        image_url: l.imageUrl || l.album?.images?.[0]?.url || null,
        external_url: l.externalUrl || l.external_urls?.spotify || null
      });
    }

    if (toUpsert.length) {
      const { error: upsertErr } = await supabaseAdmin
        .from('tracks')
        .upsert(toUpsert, { onConflict: 'id' });
      if (upsertErr) console.error('[vote] tracks upsert error', upsertErr);
    }

    // Call RPC to update Elo & stats
    const { data, error } = await supabaseAdmin.rpc('record_vote', {
      winner_id: wId,
      loser_id: lId,
      k_factor: 32
    });

    if (error) {
      console.error('[vote] record_vote error', error);
      return res.status(500).json({ error: 'record_vote failed', details: error });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (e) {
    console.error('[vote] unexpected error', e);
    return res.status(500).json({ error: 'unexpected', details: String(e) });
  }
}
