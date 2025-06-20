import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <div>
        <div className="typewriter">Charlie Manter</div>

        <div className="button-container">
          <Link href="/chess-dash" passHref>
            <a className="emoji-link" title="chess.com analytics">♟️</a>
          </Link>
          <Link href="/pool-safety" passHref>
            <a className="emoji-link" title="pool safety">🏊</a>
          </Link>
          <Link href="/songmatch" passHref>
            <a className="emoji-link" title="song match">🎵</a>
          </Link>
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
          transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
          color: inherit;
          cursor: pointer;
        }

        .emoji-link:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          color: #0070f3;
          background: yellow; /* 👈 easy to spot */
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
