import { useEffect, useState } from 'react';

type Status = {
  safe: boolean;
  resume_at: string | null;
};

export default function PoolSafety() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Fetch latest lightning status
  async function fetchStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/safety/lightning-status');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Status = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Initial load and polling every minute
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer until all-clear
  useEffect(() => {
    if (!status || status.safe || !status.resume_at) {
      setCountdown(null);
      return;
    }
    function updateCountdown() {
      const now = new Date();
      const resume = new Date(status.resume_at);
      const diff = resume.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('00:00');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdown(
          `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
        );
      }
    }
    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerId);
  }, [status]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pool Lightning Safety</h1>

      <div>
        <p>
          <strong>Status:</strong>{' '}
          <span className={status?.safe ? 'text-green-600' : 'text-red-600'}>
            {status?.safe ? 'SAFE to swim' : 'DO NOT SWIM'}
          </span>
        </p>
        {!status?.safe && countdown && (
          <p>All-clear in: {countdown}</p>
        )}
      </div>

      <button
        onClick={fetchStatus}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Now
      </button>
    </div>
  );
}
