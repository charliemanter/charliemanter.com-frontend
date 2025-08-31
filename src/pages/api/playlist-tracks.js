// src/pages/api/playlist-tracks.js
import { getSpotifyAccessToken, fetchPlaylistTracks } from '../../lib/spotify.js';

export default async function handler(req, res) {
  try {
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    if (!playlistId) {
      return res.status(400).json({ error: 'Missing SPOTIFY_PLAYLIST_ID in environment.' });
    }

    const accessToken = await getSpotifyAccessToken();
    const items = await fetchPlaylistTracks(playlistId, accessToken);
    if (items && items.length > 0) {
      console.log('First item:', items[0]);
    }

    // Shape detection:
    // A) Playlist Items: [{ track: { id, name, ... } }, ...]
    // B) Tracks directly: [{ id, name, ... }, ...]  ← matches your JSON
    // Improved getTrack: handles nested 'track' property, and ignores non-track objects
    const getTrack = (it) => {
      if (it && typeof it === 'object') {
        if ('track' in it && it.track && typeof it.track === 'object') {
          return it.track;
        }
        // If it looks like a track object (has id, name, album, etc.)
        if ('id' in it && 'name' in it && 'album' in it) {
          return it;
        }
      }
      return null;
    };

    const tracks = (items || [])
      .map(getTrack)
      .filter(Boolean)
      .map((t) => ({
        id: t.id ?? t.uri ?? cryptoRandomId(),
        name: t.name ?? '',
        artist: Array.isArray(t.artists) ? t.artists.map(a => a?.name).filter(Boolean).join(', ') : '',
        imageUrl: t.album?.images?.[0]?.url ?? '',
        previewUrl: t.preview_url ?? '',
        externalUrl: t.external_urls?.spotify ?? '',
        duration_ms: t.duration_ms ?? 0,
        is_local: !!t.is_local,
      }));

    return res.status(200).json({ tracks });
  } catch (e) {
    console.error('playlist-tracks error:', e);
    return res.status(500).json({ error: e?.message || 'Failed to fetch playlist tracks.' });
  }
}

// Tiny fallback for missing IDs on odd cases
function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Math.random().toString(36).slice(2);
}