// src/pages/api/youtube-search.js
import yts from 'yt-search';

let cache = new Map(); // tiny in-memory cache to cut repeat lookups

export default async function handler(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing q' });

    if (cache.has(q)) {
      return res.status(200).json({ videoId: cache.get(q) });
    }

    const results = await yts(q);
    const first = results?.videos?.[0];
    if (!first?.videoId) return res.status(404).json({ error: 'No results' });

    cache.set(q, first.videoId);
    return res.status(200).json({ videoId: first.videoId });
  } catch (e) {
    console.error('[youtube-search] error', e);
    return res.status(500).json({ error: 'Search failed' });
  }
}
