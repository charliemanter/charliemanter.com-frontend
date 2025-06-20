import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.page}>
      <div>
        <div style={styles.typewriter}>Charlie Manter</div>

        <div style={styles.buttonContainer}>
          <Link href="/chess-dash" passHref>
            <a style={styles.button} aria-label="Go to Chess Dashboard">♟️</a>
          </Link>
          <Link href="/pool-safety" passHref>
            <a style={styles.button} aria-label="Go to Pool Safety">🏊</a>
          </Link>
          <Link href="/songmatch" passHref>
            <a style={styles.button} aria-label="Go to Song Match">🎵</a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 15ch }
        }
        @keyframes blink {
          50% { border-color: transparent }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '2rem',
  },
  typewriter: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderRight: '0.15em solid orange',
    animation: 'typing 2s steps(15, end), blink 0.75s step-end infinite',
  },
  buttonContainer: {
    marginTop: '2rem',
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
  },
  button: {
    fontSize: '2rem',
    textDecoration: 'none',
    transition: 'transform 0.2s',
  }
};
