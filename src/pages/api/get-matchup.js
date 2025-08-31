// src/pages/api/get-matchup.js
import { getSpotifyAccessToken, fetchPlaylistTracks } from '../../lib/spotify';

let cachedTracks = [];
let cacheTime = 0;

export default async function handler(req, res) {
  try {
    if (cachedTracks.length === 0 || Date.now() - cacheTime > 3600000) {
      const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
      if (!playlistId) throw new Error('SPOTIFY_PLAYLIST_ID env var is missing');

      const accessToken = await getSpotifyAccessToken();
      console.log('[get-matchup] Loading tracks for SPOTIFY_PLAYLIST_ID:', playlistId);

      const allTracks = await fetchPlaylistTracks(playlistId, accessToken);
      cachedTracks = allTracks.filter(t => t?.id);
      cacheTime = Date.now();
    }

    if (cachedTracks.length < 2) {
      return res.status(503).json({
        error:
          'Not enough previewable tracks in playlist(s). Add more tracks with preview clips or configure FALLBACK_PLAYLIST_IDS.',
      });
    }

    // Pick two distinct random tracks
    let i1 = Math.floor(Math.random() * cachedTracks.length);
    let i2 = Math.floor(Math.random() * cachedTracks.length);
    while (i1 === i2) i2 = Math.floor(Math.random() * cachedTracks.length);

    const toCard = (t) => ({
      id: t.id,
      name: t.name,
      artist: (t.artists ?? []).map(a => a.name).join(', '),
      imageUrl: t.album?.images?.[0]?.url ?? '',
      previewUrl: t.preview_url,
    });

    res.status(200).json([toCard(cachedTracks[i1]), toCard(cachedTracks[i2])]);
  } catch (error) {
    console.error('Error in get-matchup:', error);
    res.status(500).json({ error: 'Failed to get matchup' });
  }
}
