import { useState } from "react";

export default function SongMatch() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState([]);

  const findMatches = async () => {
    const res = await fetch(`https://api.charliemanter.com/songmatch?title=${title}&artist=${artist}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🎧 SongMatch</h1>
      <input
        placeholder="Song Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <button onClick={findMatches} className="bg-black text-white px-4 py-2 rounded">
        Find Similar Songs
      </button>

      <div className="mt-6 grid gap-4">
        {results.map((track, i) => (
          <div key={i} className="border rounded p-4 flex items-center gap-4">
            <img src={track.album_art} alt="Album" className="w-16 h-16" />
            <div>
              <p className="font-semibold">{track.title}</p>
              <p className="text-sm">{track.artist}</p>
              {track.preview_url && (
                <audio controls src={track.preview_url} className="mt-2" />
              )}
              <a href={track.spotify_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                Open in Spotify →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
