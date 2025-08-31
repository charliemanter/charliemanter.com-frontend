import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <div>
        <div className="typewriter">Charlie Manter</div>

        <div className="button-container">
            <Link href="/chess-dash" className="emoji-link" title="chess.com analytics">♟️</Link>
            <Link href="/pool-safety" className="emoji-link" title="pool safety">🏊</Link>
            <Link href="/song-arena" className="emoji-link" title="song arena">🎵</Link>
        </div>
      </div>

      <style jsx>{`
        .page {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: monospace;
          font-size: 2rem;
        }

        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.15em solid orange;
          animation: typing 2s steps(15, end), blink 0.75s step-end infinite;
        }

        .button-container {
          margin-top: 2rem;
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .emoji-link {
          font-size: 2.5rem;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.2, 1.5, 0.5, 1), filter 0.3s ease;
        }

        .emoji-link:hover {
          transform: scale(1.5) rotate(5deg);
          filter: hue-rotate(90deg) brightness(1.2) saturate(1.5);
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 15ch }
        }

        @keyframes blink {
          50% { border-color: transparent }
        }
      `}</style>
    </div>
  );
}
