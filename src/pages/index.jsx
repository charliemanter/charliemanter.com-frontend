import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <div className="content">
        <div className="typewriter">Charlie Manter</div>

        <div className="button-container">
          <Link href="/chess-dash" passHref>
            <a className="button" aria-label="Go to Chess Dashboard">
              ♟️
            </a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .page {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          font-family: "Courier New", monospace;
          background: radial-gradient(circle at top left, #111, #222);
          color: #f4f4f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .typewriter {
          font-size: 3rem;
          border-right: 0.15em solid #f4f4f4;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          animation: typing 2s steps(20, end) forwards,
            blink 0.75s step-end infinite;
        }

        .button-container {
          margin-top: 2rem;
          text-align: center;
          animation: fadeIn 1s ease-in-out 2s forwards;
          opacity: 0;
        }

        .button {
          font-size: 2.5rem;
          text-decoration: none;
          color: #f4f4f4;
          transition: transform 0.2s;
        }

        .button:hover {
          transform: scale(1.2);
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 15ch;
          }
        }

        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .typewriter {
            font-size: 2.2rem;
          }
          .button {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .typewriter {
            font-size: 1.6rem;
          }
          .button {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
