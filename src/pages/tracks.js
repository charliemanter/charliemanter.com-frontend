import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

export default function TracksPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/playlist-tracks');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch tracks');
        if (mounted) setTracks(data.tracks || []);
      } catch (e) {
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(t => (`${t.name} ${t.artist}`).toLowerCase().includes(q));
  }, [query, tracks]);

  if (loading) return <div className="container"><h1>Loading playlist…</h1></div>;
  if (error)   return <div className="container"><h1>Oops: {error}</h1></div>;

  return (
    <>
      <div className="container">
        <header className="header">
          <h1>Playlist Tracks</h1>
          <div className="search">
            <input
              type="text"
              placeholder="Filter by song or artist…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="count">{filtered.length} / {tracks.length}</span>
          </div>
        </header>

        {filtered.length === 0 ? (
          <p>No tracks match your search.</p>
        ) : (
          <ul className="grid">
            {filtered.map((t) => (
              <li key={t.id} className="card">
                {t.imageUrl
                  ? <Image src={t.imageUrl} alt={`${t.name} art`} width={120} height={120} className="art" />
                  : <div className="placeholder" />}
                <div className="meta">
                  <h2 title={t.name}>{t.name}</h2>
                  <p className="artist" title={t.artist}>{t.artist}</p>
                  <p className="muted">{formatDuration(t.duration_ms)}</p>
                  <div className="actions">
                    {t.previewUrl ? <audio controls src={t.previewUrl} className="audio" /> : <span className="muted">No preview</span>}
                    {t.externalUrl && <a href={t.externalUrl} target="_blank" rel="noreferrer">Open in Spotify ↗</a>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx global>{`body { background:#121212; color:#fff; font-family:system-ui,sans-serif; }`}</style>
      <style jsx>{`
        .container { max-width:1100px; margin:0 auto; padding:2rem; }
        .header h1 { color:#1DB954; margin:0 0 .5rem; }
        .search { display:flex; gap:.5rem; align-items:center; margin:1rem 0 2rem; }
        .search input { flex:1; padding:.75rem 1rem; border-radius:8px; border:1px solid #333; background:#181818; color:#fff; }
        .count { color:#b3b3b3; }
        .grid { list-style:none; padding:0; margin:0; display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); }
        .card { display:flex; gap:1rem; background:#181818; border:1px solid #222; border-radius:10px; padding:1rem; }
        .art { border-radius:6px; }
        .placeholder { width:120px; height:120px; border-radius:6px; background:#2a2a2a; }
        .meta { min-width:0; flex:1; }
        h2 { margin:0 0 .25rem; font-size:1.05rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .artist { color:#b3b3b3; margin:0 0 .5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .muted { color:#9a9a9a; font-size:.9rem; }
        .actions { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; margin-top:.5rem; }
        .audio { width:220px; max-width:100%; }
      `}</style>
    </>
  );
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
