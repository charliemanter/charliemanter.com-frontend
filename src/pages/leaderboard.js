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
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LeaderboardPage() {
  const router = useRouter();
  const pageFromQuery = Number(router.query.page ?? 1);
  const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const pageSize = 25;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/leaderboard?page=${page}&pageSize=${pageSize}`);
        if (!res.ok) throw new Error(`Failed to load leaderboard (${res.status})`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true };
  }, [page]);

  const items = data?.items ?? [];
  const title = useMemo(() => `Song Arena • Leaderboard (page ${page})`, [page]);

  const handlePrev = () => {
    if (page > 1) router.push({ pathname: "/leaderboard", query: { page: page - 1 } }, undefined, { shallow: true });
  };
  const handleNext = () => {
    if (items.length === pageSize) {
      router.push({ pathname: "/leaderboard", query: { page: page + 1 } }, undefined, { shallow: true });
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white border-b">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Leaderboard</h1>
            <Link href="/song-arena" className="px-4 py-2 rounded bg-black text-white">
              Vote again
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          {loading && <p>Loading…</p>}
          {err && <p className="text-red-600">{err}</p>}
          {!loading && !err && items.length === 0 && <p>No tracks ranked yet.</p>}

          {!loading && !err && items.length > 0 && (
            <ul className="grid gap-4">
              {items.map((t, idx) => (
                <li key={t.trackId} className="p-4 bg-white rounded shadow">
                  <div className="flex gap-4">
                    {t.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.imageUrl} alt="cover" className="h-16 w-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="text-sm text-gray-600">{t.artist}</p>
                      <p className="text-sm mt-1">
                        ELO {Math.round(t.elo)} — {t.wins}–{t.losses} ({t.matches} matches)
                      </p>
                      {t.previewUrl && (
                        <audio className="mt-2 w-full" src={t.previewUrl} controls preload="none" />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex justify-between">
            <button onClick={handlePrev} disabled={page <= 1}>← Previous</button>
            <span>Page {page}</span>
            <button onClick={handleNext} disabled={items.length < pageSize}>Next →</button>
          </div>
        </main>
      </div>
    </>
  );
}
