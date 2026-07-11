import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          {eyebrow ? (
            <p className="text-overline text-[var(--muted)]">{eyebrow}</p>
          ) : null}
          <h1 className="text-title text-[var(--foreground)]">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-body text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
