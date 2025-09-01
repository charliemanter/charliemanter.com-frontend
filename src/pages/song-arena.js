// // src/pages/song-arena.js
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import Image from 'next/image';

// export default function SongArenaPage() {
//   const [matchup, setMatchup] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const fetchMatchup = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await fetch('/api/get-matchup');
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data?.error || 'Failed to load matchup');
//       }
//       setMatchup(data);
//     } catch (e) {
//       setError(String(e.message || e));
//       setMatchup(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMatchup();
//   }, []);

//   async function handleVote(winnerObj, loserObj) {
//   setLoading(true);
//   try {
//     const r = await fetch('/api/rank', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ winner: winnerObj, loser: loserObj }),
//     });
//     if (!r.ok) throw new Error('Rank API failed');
//     window.location.href = '/leaderboard';
//   } catch (e) {
//     console.error(e);
//     alert('Could not record vote');
//   } finally {
//     setLoading(false);
//   }
// };

//   if (loading) return <div className="container"><h1>Finding the next matchup…</h1></div>;
//   if (error) return <div className="container"><h1>{error}</h1></div>;
//   if (!matchup || matchup.length !== 2) return <div className="container"><h1>No matchup available.</h1></div>;

//   const [song1, song2] = matchup;

//   return (
//     <>
//       <div className="container">
//         <header className="header">
//           <h1>Which song is better?</h1>
//         </header>
//         <div className="matchup-container">
//           <SongCard song={song1} onVote={() => handleVote(song1, song2)} />
//           <div className="vs-text">VS</div>
//           <SongCard song={song2} onVote={() => handleVote(song2, song1)} />
//         </div>
//       </div>
//       <style jsx global>{`
//         body { background-color: #121212; color: #ffffff; font-family: system-ui, sans-serif; }
//       `}</style>
//       <style jsx>{`
//         .container { max-width: 1000px; margin: 0 auto; padding: 2rem; text-align: center; }
//         .header h1 { font-size: 2.5rem; color: #1DB954; }
//         .matchup-container { display: flex; justify-content: center; align-items: center; gap: 2rem; margin-top: 3rem; }
//         .vs-text { font-size: 2rem; font-weight: bold; color: #1DB954; }
//       `}</style>
//     </>
//   );
// }

// // A reusable component for the song card
// function SongCard({ song, onVote }) {
//   return (
//     <div className="song-card" onClick={onVote}>
//       <Image
//         src={song.imageUrl}
//         alt={song.name}
//         width={300}
//         height={300}
//         className="album-art"
//       />
//       <h2>{song.name}</h2>
//       <p>{song.artist}</p>
//       <audio controls src={song.previewUrl} className="audio-player"></audio>
//       <style jsx>{`
//         .song-card {
//           background-color: #181818;
//           border-radius: 8px;
//           padding: 1.5rem;
//           width: 300px;
//           cursor: pointer;
//           transition: transform 0.2s ease;
//         }
//         .song-card:hover {
//           transform: scale(1.05);
//         }
//         .album-art {
//           border-radius: 4px;
//         }
//         h2 {
//           margin: 1rem 0 0.25rem;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         p {
//           color: #b3b3b3;
//           margin-top: 0;
//         }
//         .audio-player {
//           width: 100%;
//           margin-top: 1rem;
//         }
//       `}</style>
//     </div>
//   );
// }
// src/pages/song-arena.js
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SongArenaPage() {
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchMatchup() {
    try {
      setLoading(true);
      setError('');
      const r = await fetch('/api/get-matchup');
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to get matchup');
      if (!Array.isArray(data) || data.length !== 2) {
        throw new Error('Matchup response malformed');
      }
      setMatchup(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error fetching matchup');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatchup();
  }, []);

  async function handleVote(winner, loser) {
    try {
      setError('');
    // IMPORTANT: switch to Supabase-backed API
      const r = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner, loser })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || 'Vote failed');

    // (optional) optimistic UI, show toast, etc.
    await fetchMatchup(); // get next pairing
  } catch (e) {
    console.error('[song-arena] vote error', e);
    setError(String(e.message || e));
  }
}
  //     const r = await fetch('/api/rank', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ winner, loser }),
  //     });
  //     if (!r.ok) {
  //       const data = await r.json().catch(() => ({}));
  //       throw new Error(data?.error || 'Vote failed');
  //     }
  //     // Load a fresh matchup
  //     fetchMatchup();
  //   } catch (e) {
  //     console.error(e);
  //     setError(e.message || 'Vote failed');
  //   }
  // }

  if (loading) return <Shell><p>Loading matchup…</p></Shell>;
  if (error) return <Shell><p style={{ color: '#f66' }}>{error}</p></Shell>;
  if (!matchup || matchup.length !== 2) return <Shell><p>No matchup available.</p></Shell>;

  const [left, right] = matchup;

  return (
    <Shell>
      <header className="header">
        <h1>Which song is better?</h1>
      </header>

      <div className="matchup">
        <SongCard song={left} onVote={() => handleVote(left, right)} />
        <div className="vs">VS</div>
        <SongCard song={right} onVote={() => handleVote(right, left)} />
      </div>

      <style jsx global>{`
        body {
          background: #121212;
          color: #ffffff;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>
      <style jsx>{`
        .header {
          text-align: center;
          margin: 2rem 0 1rem;
        }
        .header h1 {
          font-size: 2.2rem;
          color: #1DB954;
          margin: 0;
        }
        .matchup {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem;
        }
        .vs {
          align-self: center;
          font-weight: 700;
          color: #1DB954;
        }
      `}</style>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="page">
      {children}
      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
}

function SongCard({ song, onVote }) {
  const title = song?.name || 'Unknown track';
  const artist = song?.artist || 'Unknown artist';
  const img = song?.imageUrl || '/placeholder.png';
  const query = [artist, title].filter(Boolean).join(' ').trim();

  return (
    <div className="card">
      <Image
        src={img}
        alt={`${title} cover`}
        width={320}
        height={320}
        className="art"
      />
      <h2 className="title" title={title}>{title}</h2>
      <p className="artist" title={artist}>{artist}</p>

      {/* YouTube embed of first “[artist] [song]” result */}
      <YouTubeEmbed query={query} />

      <button className="vote" onClick={onVote} aria-label={`Vote for ${title} by ${artist}`}>
        Vote
      </button>

      <style jsx>{`
        .card {
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          width: 320px;
          padding: 1rem;
        }
        .art {
          border-radius: 8px;
          object-fit: cover;
        }
        .title {
          margin: 0.75rem 0 0.25rem;
          font-size: 1.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .artist {
          margin: 0;
          color: #b3b3b3;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vote {
          margin-top: 0.8rem;
          width: 100%;
          padding: 0.6rem 0.8rem;
          border-radius: 10px;
          border: 1px solid #2a2a2a;
          background: #1DB954;
          color: #000000;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function YouTubeEmbed({ query }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!query) return;
      try {
        setLoading(true);
        setErr('');
        const r = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
        const data = await r.json();
        if (!r.ok || !data?.videoId) throw new Error(data?.error || 'No result');
        if (!cancelled) setVideoId(data.videoId);
      } catch (e) {
        if (!cancelled) setErr('No YouTube result found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!query) return null;
  if (loading) return <div className="yt-status">Searching YouTube…</div>;
  if (err) return <div className="yt-status">{err}</div>;
  if (!videoId) return null;

  return (
    <div className="yt">
      <iframe
        width="100%"
        height="180"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={query}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      <style jsx>{`
        .yt {
          margin-top: 0.75rem;
        }
        .yt-status {
          margin-top: 0.75rem;
          color: #b3b3b3;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
