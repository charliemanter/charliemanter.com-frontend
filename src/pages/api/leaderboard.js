// // src/pages/api/leaderboard.js
// import { topN } from '../../lib/store';

// export default async function handler(req, res) {
//   try {
//     const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
//     const rows = topN(limit);
//     res.status(200).json({ rows });
//   } catch (e) {
//     console.error('[leaderboard] error', e);
//     res.status(500).json({ error: 'Internal error' });
//   }
// }

// ------

// /pages/api/leaderboard.js
// import { supabaseAdmin } from '../../lib/supabaseAdmin';

// export default async function handler(req, res) {
//   const page = Math.max(1, Number(req.query.page ?? 1));
//   const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
//   const from = (page - 1) * pageSize;
//   const to = from + pageSize - 1;

//   try {
//     const { data, error } = await supabaseAdmin
//       .from('ratings')
//       .select(`
//         track_id,
//         elo, wins, losses, match_count, last_match_at,
//         track:tracks ( name, artist, image_url, preview_url, external_url )
//       `)
//       .order('elo', { ascending: false })
//       .range(from, to);

//     if (error) throw error;

//     res.json({
//       page, pageSize,
//       items: (data || []).map(r => ({
//         trackId: r.track_id,
//         name: r.track?.name ?? '',
//         artist: r.track?.artist ?? '',
//         imageUrl: r.track?.image_url ?? null,
//         previewUrl: r.track?.preview_url ?? null,
//         elo: Number(r.elo),
//         wins: r.wins,
//         losses: r.losses,
//         matches: r.match_count,
//         lastMatchAt: r.last_match_at
//       }))
//     });
//   } catch (e) {
//     console.error('[leaderboard]', e);
//     res.status(500).json({ error: e.message });
//   }
// }

// src/pages/api/leaderboard.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize || '50', 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Join ratings -> tracks for display
  const { data, error } = await supabaseAdmin
    .from('ratings')
    .select(`
      track_id,
      elo,
      wins,
      losses,
      matches,
      last_match_at,
      track:tracks (
        id, name, artist, image_url, external_url
      )
    `)
    .order('elo', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[leaderboard] query error', error);
    return res.status(500).json({ error: 'query failed', details: error });
  }

  const items = (data || []).map((r) => ({
    trackId: r.track_id,
    elo: Number(r.elo),
    wins: r.wins,
    losses: r.losses,
    matches: r.matches,
    lastMatchAt: r.last_match_at,
    name: r.track?.name || 'Unknown',
    artist: r.track?.artist || 'Unknown',
    imageUrl: r.track?.image_url || null,
    externalUrl: r.track?.external_url || null
  }));

  res.status(200).json({ page, pageSize, items });
}
