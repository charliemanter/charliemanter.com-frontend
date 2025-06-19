export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.typewriter}>Charlie Manter</div>
      <style jsx>{`
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
  }
};
