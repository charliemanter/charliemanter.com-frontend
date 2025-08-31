// src/pages/api/leaderboard.js
import { topN } from '../../lib/store';

export default async function handler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const rows = topN(limit);
    res.status(200).json({ rows });
  } catch (e) {
    console.error('[leaderboard] error', e);
    res.status(500).json({ error: 'Internal error' });
  }
}
