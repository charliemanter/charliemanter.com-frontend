// src/pages/song-arena.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function SongArenaPage() {
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchMatchup = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/get-matchup');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load matchup');
      }
      setMatchup(data);
    } catch (e) {
      setError(String(e.message || e));
      setMatchup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchup();
  }, []);

  async function handleVote(winnerObj, loserObj) {
  setLoading(true);
  try {
    const r = await fetch('/api/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner: winnerObj, loser: loserObj }),
    });
    if (!r.ok) throw new Error('Rank API failed');
    window.location.href = '/leaderboard';
  } catch (e) {
    console.error(e);
    alert('Could not record vote');
  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="container"><h1>Finding the next matchup…</h1></div>;
  if (error) return <div className="container"><h1>{error}</h1></div>;
  if (!matchup || matchup.length !== 2) return <div className="container"><h1>No matchup available.</h1></div>;

  const [song1, song2] = matchup;

  return (
    <>
      <div className="container">
        <header className="header">
          <h1>Which song is better?</h1>
        </header>
        <div className="matchup-container">
          <SongCard song={song1} onVote={() => handleVote(song1, song2)} />
          <div className="vs-text">VS</div>
          <SongCard song={song2} onVote={() => handleVote(song2, song1)} />
        </div>
      </div>
      <style jsx global>{`
        body { background-color: #121212; color: #ffffff; font-family: system-ui, sans-serif; }
      `}</style>
      <style jsx>{`
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; text-align: center; }
        .header h1 { font-size: 2.5rem; color: #1DB954; }
        .matchup-container { display: flex; justify-content: center; align-items: center; gap: 2rem; margin-top: 3rem; }
        .vs-text { font-size: 2rem; font-weight: bold; color: #1DB954; }
      `}</style>
    </>
  );
}

// A reusable component for the song card
function SongCard({ song, onVote }) {
  return (
    <div className="song-card" onClick={onVote}>
      <Image
        src={song.imageUrl}
        alt={song.name}
        width={300}
        height={300}
        className="album-art"
      />
      <h2>{song.name}</h2>
      <p>{song.artist}</p>
      <audio controls src={song.previewUrl} className="audio-player"></audio>
      <style jsx>{`
        .song-card {
          background-color: #181818;
          border-radius: 8px;
          padding: 1.5rem;
          width: 300px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .song-card:hover {
          transform: scale(1.05);
        }
        .album-art {
          border-radius: 4px;
        }
        h2 {
          margin: 1rem 0 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        p {
          color: #b3b3b3;
          margin-top: 0;
        }
        .audio-player {
          width: 100%;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
