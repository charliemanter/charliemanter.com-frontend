// // src/pages/leaderboard.js
// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function LeaderboardPage() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await fetch('/api/leaderboard?limit=100');
//         const data = await r.json();
//         setRows(data.rows || []);
//       } catch (e) {
//         console.error('leaderboard fetch failed', e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) return <div style={{ padding: 24 }}>Loading leaderboard…</div>;

//   return (
//     <main className="max-w-3xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
//       <p className="text-sm mb-6">ELO-ranked from your recent votes</p>

//       <ol className="space-y-3">
//         {rows.map((t, idx) => (
//           <li
//             key={t.id}
//             className="flex items-center gap-3 p-3 rounded-xl shadow-sm border"
//           >
//             <span className="w-8 text-right font-mono">{idx + 1}.</span>

//             {t.imageUrl ? (
//               <Image
//                 src={t.imageUrl}
//                 alt={t.name || 'cover'}
//                 width={56}
//                 height={56}
//                 className="rounded-lg"
//               />
//             ) : (
//               <div className="w-[56px] h-[56px] rounded-lg bg-gray-200" />
//             )}

//             <div className="flex-1 min-w-0">
//               <div className="font-semibold truncate">
//                 {t.name || 'Unknown track'}
//               </div>
//               <div className="text-sm text-gray-600 truncate">
//                 {t.artist || 'Unknown artist'}
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="font-semibold">{t.rating}</div>
//               <div className="text-xs text-gray-600">
//                 {t.wins}–{t.losses} ({t.games} games)
//               </div>
//             </div>

//             {t.externalUrl ? (
//               <a
//                 href={t.externalUrl}
//                 className="ml-3 text-sm underline"
//                 target="_blank"
//                 rel="noreferrer"
//               >
//                 Open
//               </a>
//             ) : null}
//           </li>
//         ))}
//       </ol>
//     </main>
//   );
// }
// /pages/leaderboard.js
// import { useEffect, useState, useMemo } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import { useRouter } from "next/router";

// export default function LeaderboardPage() {
//   const router = useRouter();
//   const pageFromQuery = Number(router.query.page ?? 1);
//   const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);
//   const pageSize = 25;

//   useEffect(() => {
//     let cancelled = false;
//     async function run() {
//       setLoading(true);
//       setErr(null);
//       try {
//         const res = await fetch(`/api/leaderboard?page=${page}&pageSize=${pageSize}`);
//         if (!res.ok) throw new Error(`Failed to load leaderboard (${res.status})`);
//         const json = await res.json();
//         if (!cancelled) setData(json);
//       } catch (e) {
//         if (!cancelled) setErr(e.message ?? "Unknown error");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     run();
//     return () => { cancelled = true };
//   }, [page]);

//   const items = data?.items ?? [];
//   const title = useMemo(() => `Song Arena • Leaderboard (page ${page})`, [page]);

//   const handlePrev = () => {
//     if (page > 1) router.push({ pathname: "/leaderboard", query: { page: page - 1 } }, undefined, { shallow: true });
//   };
//   const handleNext = () => {
//     if (items.length === pageSize) {
//       router.push({ pathname: "/leaderboard", query: { page: page + 1 } }, undefined, { shallow: true });
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>{title}</title>
//         <meta name="robots" content="noindex" />
//       </Head>

//       <div className="min-h-screen bg-gray-50">
//         <header className="sticky top-0 bg-white border-b">
//           <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
//             <h1 className="text-xl font-semibold">Leaderboard</h1>
//             <Link href="/song-arena" className="px-4 py-2 rounded bg-black text-white">
//               Vote again
//             </Link>
//           </div>
//         </header>

//         <main className="mx-auto max-w-6xl px-4 py-6">
//           {loading && <p>Loading…</p>}
//           {err && <p className="text-red-600">{err}</p>}
//           {!loading && !err && items.length === 0 && <p>No tracks ranked yet.</p>}

//           {!loading && !err && items.length > 0 && (
//             <ul className="grid gap-4">
//               {items.map((t, idx) => (
//                 <li key={t.trackId} className="p-4 bg-white rounded shadow">
//                   <div className="flex gap-4">
//                     {t.imageUrl && (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img src={t.imageUrl} alt="cover" className="h-16 w-16 object-cover rounded" />
//                     )}
//                     <div className="flex-1">
//                       <h3 className="font-semibold">{t.name}</h3>
//                       <p className="text-sm text-gray-600">{t.artist}</p>
//                       <p className="text-sm mt-1">
//                         ELO {Math.round(t.elo)} — {t.wins}–{t.losses} ({t.matches} matches)
//                       </p>
//                       {t.previewUrl && (
//                         <audio className="mt-2 w-full" src={t.previewUrl} controls preload="none" />
//                       )}
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//           <div className="mt-8 flex justify-between">
//             <button onClick={handlePrev} disabled={page <= 1}>← Previous</button>
//             <span>Page {page}</span>
//             <button onClick={handleNext} disabled={items.length < pageSize}>Next →</button>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }

// /src/pages/leaderboard.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const r = await fetch(`/api/leaderboard?page=${page}&pageSize=${pageSize}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to load leaderboard');
      setItems(data.items || []);
    } catch (e) {
      setError(String(e.message || e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Empty state (after loading with no rows)
  if (!loading && !error && items.length === 0) {
    return (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Leaderboard</h1>
        <p style={styles.muted}>No tracks ranked yet.</p>
        <Link href="/song-arena" legacyBehavior>
          <a style={styles.cta}>Vote again</a>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Leaderboard</h1>
        <p style={styles.error}>Error: {error}</p>
        <div style={{ marginTop: 16 }}>
          <button style={styles.button} onClick={() => load()}>Retry</button>
          <Link href="/song-arena" legacyBehavior>
            <a style={{ ...styles.cta, marginLeft: 12 }}>Vote again</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Leaderboard</h1>
        <div>
          <Link href="/song-arena" legacyBehavior>
            <a style={styles.cta}>Vote again</a>
          </Link>
        </div>
      </header>

      {loading ? (
        <p style={styles.muted}>Loading…</p>
      ) : (
        <div style={styles.card}>
          <div style={styles.rowHeader}>
            <span style={{ ...styles.cell, width: 48, textAlign: 'right' }}>#</span>
            <span style={{ ...styles.cell, flex: 1 }}>Track</span>
            <span style={{ ...styles.cell, width: 90, textAlign: 'right' }}>ELO</span>
            <span style={{ ...styles.cell, width: 110, textAlign: 'right' }}>W-L</span>
            <span style={{ ...styles.cell, width: 90, textAlign: 'right' }}>Matches</span>
          </div>

          {items.map((t, idx) => (
            <div key={t.trackId} style={styles.row}>
              <span style={{ ...styles.cell, width: 48, textAlign: 'right' }}>{(page - 1) * pageSize + idx + 1}</span>

              <span style={{ ...styles.cell, flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                {t.imageUrl ? (
                  <Image
                    src={t.imageUrl}
                    alt={t.name || 'cover'}
                    width={48}
                    height={48}
                    style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={styles.placeholder} />
                )}
                <span>
                  {t.externalUrl ? (
                    <a href={t.externalUrl} target="_blank" rel="noreferrer" style={styles.title}>
                      {t.name || 'Unknown'}
                    </a>
                  ) : (
                    <span style={styles.title}>{t.name || 'Unknown'}</span>
                  )}
                  <div style={styles.artist}>{t.artist || 'Unknown'}</div>
                </span>
              </span>

              <span style={{ ...styles.cell, width: 90, textAlign: 'right' }}>{Math.round(t.elo)}</span>
              <span style={{ ...styles.cell, width: 110, textAlign: 'right' }}>
                {t.wins ?? 0}-{t.losses ?? 0}
              </span>
              <span style={{ ...styles.cell, width: 90, textAlign: 'right' }}>{t.matches ?? 0}</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.pagination}>
        <button
          style={{ ...styles.button, opacity: page === 1 ? 0.6 : 1 }}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          ← Prev
        </button>
        <span style={styles.pageBadge}>Page {page}</span>
        <button
          style={styles.button}
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || (items.length < pageSize)}
          title={items.length < pageSize ? 'No more results' : 'Next page'}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 900,
    margin: '32px auto',
    padding: '0 16px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: 700, margin: 0 },
  muted: { color: '#667085' },
  error: { color: '#b42318' },
  card: { border: '1px solid #e4e7ec', borderRadius: 12, overflow: 'hidden' },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#f8fafc',
    borderBottom: '1px solid #e4e7ec',
    fontSize: 12,
    fontWeight: 600,
    color: '#475467'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderTop: '1px solid #f1f3f5',
    gap: 8
  },
  cell: { fontSize: 14, color: '#0f172a' },
  title: { fontWeight: 600, color: '#0f172a', textDecoration: 'none' },
  artist: { fontSize: 12, color: '#667085' },
  placeholder: { width: 48, height: 48, borderRadius: 8, background: '#e2e8f0' },
  cta: {
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #0f172a',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 600
  },
  button: {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #e4e7ec',
    background: '#fff',
    cursor: 'pointer'
  },
  pagination: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  pageBadge: {
    fontSize: 13,
    color: '#475467',
    padding: '6px 10px',
    border: '1px solid #e4e7ec',
    borderRadius: 999
  }
};
