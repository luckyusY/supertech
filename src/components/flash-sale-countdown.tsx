"use client";

import { useEffect, useState } from "react";

function getTimeLeft(endTime: number) {
  const diff = Math.max(0, endTime - Date.now());
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}

export function FlashSaleCountdown({ endTime }: { endTime: number }) {
  const [time, setTime] = useState(getTimeLeft(endTime));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (time.done) return <span className="text-sm text-[var(--muted)]">Sale ended</span>;

  return (
    <div className="flex items-center gap-1">
      {[
        { value: time.h, label: "h" },
        { value: time.m, label: "m" },
        { value: time.s, label: "s" },
      ].map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1">
          {i > 0 && <span className="text-sm font-bold text-[var(--accent)]">:</span>}
          <div className="flex flex-col items-center">
            <span className="min-w-[2rem] rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-center text-sm font-bold text-white tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase text-[var(--muted)]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
