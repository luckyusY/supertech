"use client";

import { useState } from "react";
import { X } from "lucide-react";

const messages = [
  "🚀 Free delivery on orders over $100 — limited time offer",
  "✅ All sellers verified before listing — shop with confidence",
  "🌍 Shipping across East & West Africa — 12+ cities",
  "⚡ Same-day dispatch on orders placed before 2 PM",
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-50 overflow-hidden bg-[var(--foreground)] py-2.5 text-white">
      <div className="announcement-scroll flex gap-0 whitespace-nowrap" aria-hidden="true">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="flex shrink-0 items-center gap-0">
            <span className="px-8 text-xs font-medium tracking-[0.02em] text-white/85">{msg}</span>
            <span className="text-white/25">·</span>
          </span>
        ))}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
