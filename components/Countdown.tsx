'use client';
import { useEffect, useState } from 'react';

function parts(target: number) {
  const diff = Math.max(target - Date.now(), 0);
  return {
    Days: Math.floor(diff / 86_400_000),
    Hours: Math.floor((diff / 3_600_000) % 24),
    Minutes: Math.floor((diff / 60_000) % 60),
    Seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ dateISO }: { dateISO: string }) {
  const target = new Date(dateISO).getTime();
  const [p, setP] = useState<ReturnType<typeof parts> | null>(null);
  useEffect(() => {
    setP(parts(target));
    const id = setInterval(() => setP(parts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return (
    <div className="countdown" aria-label="Countdown to opening night" role="timer">
      {Object.entries(p ?? { Days: '--', Hours: '--', Minutes: '--', Seconds: '--' }).map(([k, v]) => (
        <div key={k}>
          <b>{typeof v === 'number' ? String(v).padStart(2, '0') : v}</b>
          <span>{k}</span>
        </div>
      ))}
    </div>
  );
}
