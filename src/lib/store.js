// src/lib/store.js
import { DEFAULT_RATING, updateElo } from './elo';

const tracks = new Map(); 
// value shape: {
//   id, name, artist, imageUrl, externalUrl,
//   rating, wins, losses, games
// }

function ensureTrack(t) {
  let row = tracks.get(t.id);
  if (!row) {
    row = {
      id: t.id,
      name: t.name || '',
      artist: t.artist || '',
      imageUrl: t.imageUrl || '',
      externalUrl: t.externalUrl || '',
      rating: DEFAULT_RATING,
      wins: 0,
      losses: 0,
      games: 0,
    };
    tracks.set(t.id, row);
  } else {
    // keep metadata fresh (helpful if names/art change)
    row.name = t.name || row.name;
    row.artist = t.artist || row.artist;
    row.imageUrl = t.imageUrl || row.imageUrl;
    row.externalUrl = t.externalUrl || row.externalUrl;
  }
  return row;
}

export function recordMatch({ winner, loser, k = 24 }) {
  const w = ensureTrack(winner);
  const l = ensureTrack(loser);

  const [wNew, lNew] = updateElo(w.rating, l.rating, 1, k);
  w.rating = wNew;
  l.rating = lNew;

  w.wins += 1; w.games += 1;
  l.losses += 1; l.games += 1;

  return { winner: { ...w }, loser: { ...l } };
}

export function topN(n = 50) {
  return [...tracks.values()]
    .sort((a, b) => b.rating - a.rating || b.wins - a.wins)
    .slice(0, n);
}

// Not required, but handy if you want to inspect all rows:
export function getAll() {
  return [...tracks.values()];
}
