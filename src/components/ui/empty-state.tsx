import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--neutral-100)] text-[var(--muted)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
