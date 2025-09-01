// // src/pages/api/get-matchup.js
// import { getSpotifyAccessToken, fetchPlaylistTracks } from '../../lib/spotify';

// let cachedTracks = [];
// let cacheTime = 0;

// export default async function handler(req, res) {
//   try {
//     if (cachedTracks.length === 0 || Date.now() - cacheTime > 3600000) {
//       const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
//       if (!playlistId) throw new Error('SPOTIFY_PLAYLIST_ID env var is missing');

//       const accessToken = await getSpotifyAccessToken();
//       console.log('[get-matchup] Loading tracks for SPOTIFY_PLAYLIST_ID:', playlistId);

//       const allTracks = await fetchPlaylistTracks(playlistId, accessToken);
//       cachedTracks = allTracks.filter(t => t?.id);
//       cacheTime = Date.now();
//     }

//     if (cachedTracks.length < 2) {
//       return res.status(503).json({
//         error:
//           'Not enough previewable tracks in playlist(s). Add more tracks with preview clips or configure FALLBACK_PLAYLIST_IDS.',
//       });
//     }

//     // Pick two distinct random tracks
//     let i1 = Math.floor(Math.random() * cachedTracks.length);
//     let i2 = Math.floor(Math.random() * cachedTracks.length);
//     while (i1 === i2) i2 = Math.floor(Math.random() * cachedTracks.length);

//     const toCard = (t) => ({
//       id: t.id,
//       name: t.name,
//       artist: (t.artists ?? []).map(a => a.name).join(', '),
//       imageUrl: t.album?.images?.[0]?.url ?? '',
//       previewUrl: t.preview_url,
//     });

//     res.status(200).json([toCard(cachedTracks[i1]), toCard(cachedTracks[i2])]);
//   } catch (error) {
//     console.error('Error in get-matchup:', error);
//     res.status(500).json({ error: 'Failed to get matchup' });
//   }
// }

//---
// src/pages/api/get-matchup.js
import { getSpotifyAccessToken, fetchPlaylistTracks } from '../../lib/spotify';

let cached = { tracks: [], time: 0 };

function pickTwoRandom(arr) {
  const n = arr.length;
  const i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * (n - 1));
  if (j >= i) j += 1;
  return [arr[i], arr[j]];
}

export default async function handler(req, res) {
  try {
    const market = process.env.SPOTIFY_MARKET || 'US';
    const now = Date.now();

    const rawPrimary = (process.env.SPOTIFY_PLAYLIST_ID || '').trim();
    const rawFallback = (process.env.FALLBACK_PLAYLIST_IDS || '').trim();
    const ids = [
      ...rawPrimary.split(',').map(s => s.trim()).filter(Boolean),
      ...rawFallback.split(',').map(s => s.trim()).filter(Boolean),
    ];
    if (!ids.length) {
      return res.status(500).json({ error: 'No playlist IDs configured' });
    }

    if (!cached.tracks.length || now - cached.time > 60 * 60 * 1000) {
      const token = await getSpotifyAccessToken();
      const all = [];
      for (const pid of ids) {
        try {
          const t = await fetchPlaylistTracks(pid, token, market);
          all.push(...t);
        } catch (e) {
          console.error('[get-matchup] playlist fetch failed', pid, e?.message);
        }
      }
      // de-dup by id or name::artist
      const seen = new Set();
      const deduped = [];
      for (const t of all) {
        const key = t.id || `${t.name}::${t.artist}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(t);
        }
      }
      cached = { tracks: deduped, time: now };
      console.log(`[get-matchup] Cached ${deduped.length} tracks from ${ids.length} playlist(s).`);
    }

    if (cached.tracks.length < 2) {
      return res.status(503).json({ error: 'Not enough tracks found.' });
    }

    const [a, b] = pickTwoRandom(cached.tracks);
    // Return exactly 2 tracks; no preview fields included.
    return res.status(200).json([a, b]);
  } catch (e) {
    console.error('[get-matchup] Error:', e);
    return res.status(500).json({ error: e.message || 'Unexpected server error' });
  }
}
