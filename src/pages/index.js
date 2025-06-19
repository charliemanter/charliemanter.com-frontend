import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.page}>
      <div>
        <div style={styles.typewriter}>Charlie Manter</div>

        <div style={styles.buttonContainer}>
          <Link href="/chess-dash" passHref>
            <a style={styles.button} aria-label="Go to Chess Dashboard">
              ♟️
            </a>
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
    width: '100%',
    minHeight: '100vh',
    fontFamily: '"Courier New", monospace',
    background: 'radial-gradient(circle at top left, #111, #222)',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typewriter: {
    fontSize: '3rem',
    borderRight: '.15em solid #f4f4f4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: 0,
    animation: 'typing 2s steps(20, end) forwards, blink .75s step-end infinite',
  },
  buttonContainer: {
    marginTop: '2rem',
    textAlign: 'center',
    animation: 'fadeIn 1s ease-in-out 2s forwards',
    opacity: 0,
  },
  button: {
    fontSize: '2.5rem',
    textDecoration: 'none',
    color: '#f4f4f4',
    transition: 'transform 0.2s',
  }
};
