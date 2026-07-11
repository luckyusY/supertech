import type { ReactNode } from "react";

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

/**
 * Shared sticky header for the mobile app shell (/app/*).
 * Uses SuperTech design tokens for parity with the main marketplace.
 */
export function AppHeader({ eyebrow, title, subtitle, actions }: AppHeaderProps) {
  return (
    <header className="app-safe-top sticky top-0 z-[var(--z-sticky)] border-b border-[var(--line)] bg-[var(--background)]/92 px-4 pb-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h1 className="truncate text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-sm font-medium text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
