import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState(null);
  const [timeClass, setTimeClass] = useState('blitz');
  const [loading, setLoading] = useState(false);
  const [pieChart, setPieChart] = useState(null);
  const [lineChart, setLineChart] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.charliemanter.com/analyze?username=${username}&time_class=${timeClass}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setPieChart(null);
        setLineChart(null);
      } else {
        setPieChart(`data:image/png;base64,${data.pie_chart}`);
        setLineChart(`data:image/png;base64,${data.line_chart}`);
      }
    } catch (err) {
      setError('Failed to fetch data.');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>♟️ Chess Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Chess.com username"
          required
        />
        <select value={timeClass} onChange={e => setTimeClass(e.target.value)}>
          <option value="blitz">Blitz</option>
          <option value="bullet">Bullet</option>
          <option value="rapid">Rapid</option>
          <option value="daily">Daily</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {pieChart && (
        <div>
          <h2>Win Breakdown</h2>
          <img src={pieChart} alt="Win Pie Chart" />
        </div>
      )}

      {lineChart && (
        <div>
          <h2>Rating Progression</h2>
          <img src={lineChart} alt="Rating Line Chart" />
        </div>
      )}
    </div>
  );
}
