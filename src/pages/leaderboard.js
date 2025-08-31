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
// src/pages/leaderboard.js
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const router = useRouter();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const r = await fetch('/api/leaderboard?limit=100', { signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e) {
        if (e.name !== 'AbortError') setErr('Could not load leaderboard.');
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const VoteAgainButton = (
    <button
      type="button"
      onClick={() => router.push('/song-arena')}
      className="rounded-2xl px-4 py-2 border shadow-sm hover:shadow transition"
      aria-label="Vote again"
    >
      Vote again
    </button>
  );

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          {VoteAgainButton}
        </header>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-200/60" />
          ))}
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          {VoteAgainButton}
        </header>
        <p className="text-sm text-red-600 mb-4">{err}</p>
        <p className="text-sm text-gray-600">
          Try casting a vote first, or refresh the page. If you’re on a serverless deploy, make sure your ratings store
          is persistent (DB/KV) instead of in-memory.
        </p>
      </main>
    );
  }

  if (rows.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <Head><title>Leaderboard • Song Arena</title></Head>
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          {VoteAgainButton}
        </header>
        <p className="text-sm text-gray-600 mb-6">No results yet. Cast a vote to get things started.</p>
        {VoteAgainButton}
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Head><title>Leaderboard • Song Arena</title></Head>

      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        {VoteAgainButton}
      </header>

      <p className="text-sm text-gray-600 mb-6">
        Ranked by ELO.
      </p>

      <ol className="space-y-3">
        {rows.map((t, idx) => (
          <li
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-xl shadow-sm border"
          >
            <span className="w-8 text-right font-mono">{idx + 1}.</span>

            {t.imageUrl ? (
              <Image
                src={t.imageUrl}
                alt={t.name || 'cover'}
                width={56}
                height={56}
                className="rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-[56px] h-[56px] rounded-lg bg-gray-200 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{t.name || 'Unknown track'}</div>
              <div className="text-sm text-gray-600 truncate">{t.artist || 'Unknown artist'}</div>
            </div>

            <div className="text-right">
              <div className="font-semibold">{t.rating}</div>
              <div className="text-xs text-gray-600">
                {t.wins ?? 0}–{t.losses ?? 0} ({t.games ?? 0})
              </div>
            </div>

            {t.externalUrl ? (
              <a
                href={t.externalUrl}
                className="ml-3 text-sm underline"
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
