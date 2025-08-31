// src/pages/api/rank.js
import { recordMatch } from '../../lib/store';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { winner, loser } = req.body || {};
    if (!winner?.id || !loser?.id) {
      return res.status(400).json({ error: 'Missing winner/loser payload' });
    }

    const updated = recordMatch({ winner, loser });
    return res.status(200).json(updated);
  } catch (e) {
    console.error('[rank] error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
