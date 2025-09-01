// // src/lib/spotify.js

// // Gets the app-wide access token for the Spotify API
// export async function getSpotifyAccessToken() {
//   const client_id = process.env.SPOTIFY_CLIENT_ID;
//   const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
//   const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

//   const response = await fetch('https://accounts.spotify.com/api/token', {
//     method: 'POST',
//     headers: {
//       Authorization: `Basic ${basic}`,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: 'grant_type=client_credentials',
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     throw new Error(`Spotify token fetch failed ${response.status}: ${text}`);
//   }
//   const data = await response.json();
//   if (!data.access_token) throw new Error('No access_token in Spotify response');
//   return data.access_token;
// }

// // Normalize PLAYLIST_ID (accepts full URL, URI, or bare ID)
// function normalizePlaylistId(inputRaw) {
//   if (!inputRaw) throw new Error('Missing playlistId');
//   const input = String(inputRaw).trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
//   // Match full web URL: https://open.spotify.com/playlist/<ID>?si=...
//   const m1 = input.match(/playlist\/([A-Za-z0-9]+)(?=[/?#]|$)/);
//   if (m1) return m1[1];
//   // Match spotify URI: spotify:playlist:<ID>
//   const m2 = input.match(/^spotify:playlist:([A-Za-z0-9]+)$/);
//   if (m2) return m2[1];
//   // Otherwise assume it's already a bare ID; strip non-ID cruft just in case
//   const m3 = input.match(/^([A-Za-z0-9]+)$/);
//   if (m3) return m3[1];
//   throw new Error(`Unrecognized playlist identifier: "${inputRaw}"`);
// }

// // Fetches all tracks from a given playlist, handling pagination
// export async function fetchPlaylistTracks(playlistId, accessToken) {
//   const id = normalizePlaylistId(playlistId);
//   const firstTracksUrl = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;
//   const allTracks = [];

//   // Helper to page through a /tracks URL
//   const pageTracks = async (startUrl) => {
//     let nextUrl = startUrl;
//     while (nextUrl) {
//       // DEBUG: show what we’re fetching (first page only to avoid noisy logs)
//       if (nextUrl === startUrl) console.log('[spotify] GET', nextUrl);

//       const response = await fetch(nextUrl, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(`Spotify tracks fetch failed ${response.status}: ${text}`);
//       }
//       const data = await response.json();
//       if (!Array.isArray(data.items)) {
//         console.error('Spotify API unexpected shape for /tracks:', data);
//         break;
//       }
//       for (const item of data.items) {
//         if (item?.track?.id) allTracks.push(item.track);
//       }
//       nextUrl = data.next; // null when finished
//     }
//   };

//   // Try the canonical /tracks URL first
//   try {
//     await pageTracks(firstTracksUrl);
//     return allTracks;
//   } catch (e) {
//     // If it's a 404, fallback: fetch the playlist root and use tracks.href
//     if (!String(e.message || '').includes(' 404: ')) throw e;

//     console.warn('[spotify] /tracks 404 — falling back to playlist root');

//     const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     if (!playlistRes.ok) {
//       const text = await playlistRes.text();
//       throw new Error(`Spotify playlist fetch failed ${playlistRes.status}: ${text}`);
//     }
//     const playlist = await playlistRes.json();
//     const href = playlist?.tracks?.href;
//     if (!href) throw new Error('Playlist has no tracks.href');

//     await pageTracks(`${href}${href.includes('?') ? '&' : '?'}limit=100`);
//     return allTracks;
//   }
// }


// ----

// lib/spotify.js
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function getSpotifyAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const r = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Failed to get Spotify token: ${r.status} ${t}`);
  }
  const json = await r.json();
  return json.access_token;
}

/**
 * Fetch all tracks from a playlist (handles pagination).
 * Returns: { id, name, artist, imageUrl, externalUrl, duration_ms, is_local }
 */
export async function fetchPlaylistTracks(playlistId, accessToken, market = 'US') {
  const out = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&market=${encodeURIComponent(
    market
  )}`;

  while (url) {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Spotify fetch error for ${playlistId}: ${r.status} ${t}`);
    }
    const data = await r.json();
    const items = Array.isArray(data.items) ? data.items : [];

    for (const item of items) {
      const tr = item?.track;
      if (!tr || tr.is_local) continue;

      const name = tr.name || '';
      const artist = tr.artists?.[0]?.name || '';
      const imageUrl =
        tr.album?.images?.[0]?.url ||
        tr.album?.images?.[1]?.url ||
        tr.album?.images?.[2]?.url ||
        '';
      const externalUrl = tr.external_urls?.spotify || '';

      if (name && artist) {
        out.push({
          id: tr.id || tr.uri || `${name}::${artist}`,
          name,
          artist,
          imageUrl,
          externalUrl,
          duration_ms: tr.duration_ms || 0,
          is_local: !!tr.is_local,
        });
      }
    }

    url = data.next || null;
  }

  return out;
}
