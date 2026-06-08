import type { ReactNode } from "react";

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

/**
 * Shared sticky header for the mobile app shell (/app/*).
 * Handles the top safe-area inset so it clears the status bar in a
 * full-screen TWA / installed PWA.
 */
export function AppHeader({ eyebrow, title, subtitle, actions }: AppHeaderProps) {
  return (
    <header className="app-safe-top sticky top-0 z-40 border-b border-black/6 bg-[#f3f6f2]/92 px-4 pb-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
            {eyebrow}
          </p>
          <h1 className="truncate text-2xl font-black tracking-[-0.04em]">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm font-semibold text-[#66736b]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
