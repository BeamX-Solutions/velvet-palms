"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** `to` is a wall-clock time with no zone, so it is read in the visitor's own clock. */
export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return <span className="count">&nbsp;</span>;

  const left = new Date(to).getTime() - now;
  if (left <= 0) return <span className="count">They&rsquo;re open. Come in.</span>;

  const s = Math.floor(left / 1000);
  const parts: [number, string][] = [
    [Math.floor(s / 86400), "d"],
    [Math.floor(s / 3600) % 24, "h"],
    [Math.floor(s / 60) % 60, "m"],
    [s % 60, "s"],
  ];

  return (
    <span className="count" suppressHydrationWarning>
      {parts.map(([n, unit]) => (
        <span key={unit}>
          {pad(n)}
          <i>{unit}</i>
        </span>
      ))}
    </span>
  );
}
