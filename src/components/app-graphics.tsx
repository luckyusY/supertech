import {
  Camera,
  Gamepad2,
  Headphones,
  HeartPulse,
  Lightbulb,
  Smartphone,
  Sparkles,
  Tag,
  Watch,
} from "lucide-react";

type CategoryVisual = {
  icon: typeof Tag;
  /** Tailwind-free inline styles so admin-created categories still get a color. */
  from: string;
  to: string;
};

const categoryVisuals: Array<{ match: RegExp; visual: CategoryVisual }> = [
  { match: /audio|sound|speaker|headphone/i, visual: { icon: Headphones, from: "#7c5cff", to: "#5436d6" } },
  { match: /beauty|personal care|cosmetic/i, visual: { icon: Sparkles, from: "#f472b6", to: "#db2777" } },
  { match: /creator|camera|studio/i, visual: { icon: Camera, from: "#f59e0b", to: "#d97706" } },
  { match: /gaming|game|console/i, visual: { icon: Gamepad2, from: "#8b5cf6", to: "#6d28d9" } },
  { match: /health|wellness|fitness/i, visual: { icon: HeartPulse, from: "#34d399", to: "#059669" } },
  { match: /home|control|smart/i, visual: { icon: Lightbulb, from: "#38bdf8", to: "#0284c7" } },
  { match: /mobile|phone|essential/i, visual: { icon: Smartphone, from: "#60a5fa", to: "#2563eb" } },
  { match: /wear|watch|band/i, visual: { icon: Watch, from: "#2dd4bf", to: "#0d9488" } },
];

const fallbackPalette: Array<Pick<CategoryVisual, "from" | "to">> = [
  { from: "#f5830c", to: "#db750a" },
  { from: "#1fae5b", to: "#158243" },
  { from: "#6366f1", to: "#4338ca" },
  { from: "#f43f5e", to: "#be123c" },
];

export function getCategoryVisual(name: string): CategoryVisual {
  for (const { match, visual } of categoryVisuals) {
    if (match.test(name)) return visual;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return { icon: Tag, ...fallbackPalette[hash % fallbackPalette.length] };
}

export function CategoryIconTile({ name, size = 44 }: { name: string; size?: number }) {
  const { icon: Icon, from, to } = getCategoryVisual(name);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl text-white shadow-sm"
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${from}, ${to})` }}
      aria-hidden
    >
      <Icon style={{ width: size * 0.48, height: size * 0.48 }} />
    </span>
  );
}

/** Soft decorative rings + dots used behind the home hero. */
export function HeroDecor() {
  return (
    <svg
      viewBox="0 0 448 304"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="404" cy="36" r="74" fill="none" stroke="#f4c95d" strokeOpacity="0.28" strokeWidth="1.5" />
      <circle cx="404" cy="36" r="46" fill="none" stroke="#f4c95d" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="30" cy="268" r="60" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />
      <g fill="#f4c95d" fillOpacity="0.9">
        <path d="M392 96l3.2 8.1 8.1 3.2-8.1 3.2-3.2 8.1-3.2-8.1-8.1-3.2 8.1-3.2z" />
        <path d="M62 50l2.2 5.6 5.6 2.2-5.6 2.2-2.2 5.6-2.2-5.6-5.6-2.2 5.6-2.2z" fillOpacity="0.7" />
      </g>
      <g fill="#ffffff" fillOpacity="0.35">
        <circle cx="350" cy="150" r="2.5" />
        <circle cx="330" cy="118" r="2" />
        <circle cx="76" cy="120" r="2.5" />
        <circle cx="106" cy="236" r="2" />
      </g>
    </svg>
  );
}

/** Open parcel box with sparkles — empty cart / no results. */
export function EmptyBoxIllustration({ className = "h-32 w-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <ellipse cx="80" cy="132" rx="52" ry="9" fill="#102019" fillOpacity="0.07" />
      <path d="M38 70l42-18 42 18-42 18-42-18z" fill="#f9a94f" />
      <path d="M38 70v40l42 18v-40L38 70z" fill="#f68b1e" />
      <path d="M122 70v40l-42 18v-40l42-18z" fill="#dd7106" />
      <path d="M38 70l-14 12 42 19 14-13-42-18z" fill="#fbbd7c" />
      <path d="M122 70l14 12-42 19-14-13 42-18z" fill="#f29a3d" />
      <path
        d="M80 24v14M58 32l6 10M102 32l-6 10"
        stroke="#102019"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M128 26l2.6 6.6 6.6 2.6-6.6 2.6-2.6 6.6-2.6-6.6-6.6-2.6 6.6-2.6z" fill="#f4c95d" />
      <path d="M30 40l1.9 4.8 4.8 1.9-4.8 1.9-1.9 4.8-1.9-4.8-4.8-1.9 4.8-1.9z" fill="#f4c95d" />
    </svg>
  );
}

/** Magnifier over a card — no search matches. */
export function EmptySearchIllustration({ className = "h-32 w-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <ellipse cx="80" cy="134" rx="52" ry="9" fill="#102019" fillOpacity="0.07" />
      <rect x="30" y="34" width="74" height="92" rx="12" fill="#ffffff" stroke="#102019" strokeOpacity="0.12" strokeWidth="3" />
      <rect x="42" y="48" width="50" height="34" rx="8" fill="#f3f6f2" />
      <rect x="42" y="92" width="40" height="7" rx="3.5" fill="#102019" fillOpacity="0.16" />
      <rect x="42" y="106" width="28" height="7" rx="3.5" fill="#102019" fillOpacity="0.1" />
      <circle cx="106" cy="86" r="26" fill="#fff4e5" stroke="#f68b1e" strokeWidth="6" />
      <path d="M125 105l16 16" stroke="#f68b1e" strokeWidth="8" strokeLinecap="round" />
      <path d="M98 86h16M106 78v16" stroke="#f68b1e" strokeWidth="5" strokeLinecap="round" />
      <path d="M136 38l2.6 6.6 6.6 2.6-6.6 2.6-2.6 6.6-2.6-6.6-6.6-2.6 6.6-2.6z" fill="#f4c95d" />
    </svg>
  );
}

/** Delivery rider — track order empty state. */
export function DeliveryIllustration({ className = "h-32 w-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <ellipse cx="80" cy="134" rx="56" ry="9" fill="#102019" fillOpacity="0.07" />
      <path d="M14 96h28M8 108h26M20 84h24" stroke="#102019" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
      <rect x="92" y="52" width="34" height="30" rx="6" fill="#f68b1e" />
      <path d="M92 62h34" stroke="#dd7106" strokeWidth="3" />
      <rect x="104" y="52" width="10" height="10" rx="2" fill="#f4c95d" />
      <circle cx="62" cy="114" r="17" fill="none" stroke="#102019" strokeWidth="6" />
      <circle cx="120" cy="114" r="17" fill="none" stroke="#102019" strokeWidth="6" />
      <circle cx="62" cy="114" r="4" fill="#102019" />
      <circle cx="120" cy="114" r="4" fill="#102019" />
      <path
        d="M62 114l14-34h18m0 0l10 18m16 16l-8-18"
        stroke="#1fae5b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="78" cy="70" r="9" fill="#1fae5b" />
    </svg>
  );
}
